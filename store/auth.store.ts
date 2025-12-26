// store/useAuthStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService } from "@/services/auth.service";

interface PendingVerification {
  email: string;
  userId: number;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  nationality?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthState {
  pendingVerification: PendingVerification | null;
  loading: boolean;
  error: string | null;
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Registration methods
  registerAndKickoffOTP: (payload: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    nationality: string;
  }) => Promise<boolean>;

  verifyOTP: (otp: string) => Promise<boolean>;
  resendOTP: () => Promise<void>;
  clearPendingVerification: () => void;

  // Login methods
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;

  // Initialize auth state
  initialize: () => void;

  // Check authentication status
  checkAuth: () => boolean;
}

// Helper function to extract user ID from various response structures
const extractUserId = (data: any): number | null => {
  if (!data) return null;
  
  const possiblePaths = [
    data.user?.id,
    data.id,
    data.user_id,
    data.data?.user?.id,
    data.data?.id,
  ];

  for (const id of possiblePaths) {
    if (typeof id === 'number') return id;
    if (typeof id === 'string') {
      const parsed = parseInt(id, 10);
      if (!isNaN(parsed)) return parsed;
    }
  }

  return null;
};

// Helper function to extract token from various response structures
const extractToken = (data: any): string | null => {
  if (!data) return null;
  
  if (typeof data === 'string' && data.length > 0) return data;

  const possiblePaths = [
    data.token,
    data.access_token,
    data.accessToken,
    data.data?.token,
    data.data?.access_token,
    data.data?.accessToken,
  ];

  for (const token of possiblePaths) {
    if (typeof token === 'string' && token.length > 0) return token;
  }

  return null;
};

// Helper function to extract user from various response structures
const extractUser = (data: any): User | null => {
  if (!data) return null;

  const userData = data.data?.user || data.data || data.user || data;

  if (userData && typeof userData === 'object' && 'email' in userData) {
    return userData as User;
  }

  return null;
};

// Helper function to create minimal user object
const createMinimalUser = (email: string, userId?: number): User => {
  return {
    id: userId || 0,
    email,
    first_name: "",
    last_name: "",
    name: email.split('@')[0],
    role: "user",
    is_active: true,
    email_verified: false,
  };
};

// Helper function to extract error message
const extractErrorMessage = (err: any, defaultMessage: string): string => {
  return (
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.response?.data?.detail ||
    err.message ||
    defaultMessage
  );
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      pendingVerification: null,
      loading: false,
      error: null,
      user: null,
      token: null,
      isAuthenticated: false,

      /* ======== REGISTER → AUTO-LOGIN → GET OTP ======== */
      registerAndKickoffOTP: async (payload) => {
        set({ loading: true, error: null });

        try {
          // 1️⃣ Register user
          console.log("📝 Registering user:", payload.email);
          const registerRes = await authService.register(payload);
          console.log("✅ Registration response:", registerRes.data);

          const userId = extractUserId(registerRes.data);

          if (!userId) {
            console.error("❌ No user ID found in response:", registerRes.data);
            throw new Error("Registration failed: No user ID received");
          }

          // 2️⃣ Auto-login immediately after registration (background)
          console.log("🔄 Auto-login after registration...");
          const loginRes = await authService.login({
            email: payload.email,
            password: payload.password,
          });

          const token = extractToken(loginRes.data);

          if (!token) {
            console.error("❌ No token in login response:", loginRes.data);
            throw new Error("Login succeeded but no token received");
          }

          // 3️⃣ Get user info (optional, can fail gracefully)
          let user: User | null = null;
          
          try {
            const userRes = await authService.getUser();
            console.log("✅ User info response:", userRes.data);
            user = extractUser(userRes.data);
          } catch (userErr) {
            console.warn("⚠️ Failed to fetch user info:", userErr);
          }

          // Use minimal user if API fails
          if (!user) {
            console.log("ℹ️ Using minimal user data");
            user = createMinimalUser(payload.email, userId);
          }

          // 4️⃣ Update state with authenticated user (but email not verified yet)
          set({
            user,
            token,
            isAuthenticated: true,
            pendingVerification: {
              email: payload.email,
              userId,
            },
            loading: false,
            error: null,
          });

          // 5️⃣ Send OTP in background (non-blocking)
          console.log("📧 Sending OTP to:", payload.email);
          authService.getOTP(userId)
            .then(() => {
              console.log("✅ OTP sent successfully");
            })
            .catch((otpErr) => {
              console.warn("⚠️ OTP sending failed:", otpErr);
              // Update error but don't block the flow
              set({ 
                error: "OTP sending failed. Please request a new code." 
              });
            });

          console.log("✅ Registration and auto-login complete!");
          return true;

        } catch (err: any) {
          const message = extractErrorMessage(err, "Registration failed");
          console.error("❌ Registration error:", err.response?.data || err.message);
          
          set({ 
            error: message, 
            loading: false,
            // Clear any partial state
            user: null,
            token: null,
            isAuthenticated: false,
          });
          return false;
        }
      },

      /* ======== VERIFY OTP → MARK EMAIL AS VERIFIED ======== */
      verifyOTP: async (otp) => {
        const pending = get().pendingVerification;
        
        if (!pending) {
          set({ error: "No pending verification found." });
          return false;
        }

        set({ loading: true, error: null });

        try {
          // 1️⃣ Verify OTP
          console.log("🔐 Verifying OTP for:", pending.email);
          await authService.verifyOTP({
            email: pending.email,
            otp,
          });
          console.log("✅ OTP verified successfully");

          // 2️⃣ Update user's email_verified status
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: {
                ...currentUser,
                email_verified: true,
              },
              pendingVerification: null,
              loading: false,
              error: null,
            });
          }

          console.log("✅ Email verification complete!");
          return true;

        } catch (err: any) {
          const message = extractErrorMessage(
            err,
            "OTP verification failed. Please try again."
          );
          console.error("❌ OTP verification error:", err.response?.data || err.message);
          
          set({ 
            error: message, 
            loading: false,
            // Keep pendingVerification so user can retry
          });
          return false;
        }
      },

      /* ======== RESEND OTP ======== */
      resendOTP: async () => {
        const pending = get().pendingVerification;
        
        if (!pending) {
          set({ error: "No pending verification found." });
          return;
        }

        set({ loading: true, error: null });

        try {
          await authService.getOTP(pending.userId);
          console.log("✅ OTP resent successfully");
          set({ loading: false });
        } catch (err: any) {
          const message = extractErrorMessage(err, "Failed to resend OTP");
          console.error("❌ Resend OTP error:", err.response?.data || err.message);
          set({ error: message, loading: false });
        }
      },

      clearPendingVerification: () => {
        console.log("🧹 Clearing pending verification");
        set({ pendingVerification: null, error: null });
      },

      /* ======== LOGIN ======== */
      login: async (email: string, password: string) => {
        set({ loading: true, error: null });

        try {
          // 1️⃣ Login request
          console.log("🔐 Logging in:", email);
          const loginRes = await authService.login({ email, password });

          const token = extractToken(loginRes.data);

          if (!token) {
            console.error("❌ No token found in response:", loginRes.data);
            throw new Error("No authentication token received");
          }

          // 2️⃣ Get user info
          let user: User | null = null;
          
          try {
            const userRes = await authService.getUser();
            console.log("✅ User info response:", userRes.data);
            user = extractUser(userRes.data);
          } catch (userErr) {
            console.warn("⚠️ Failed to fetch user info:", userErr);
          }

          // 3️⃣ Use minimal user if API fails
          if (!user) {
            console.log("ℹ️ Using minimal user data");
            user = createMinimalUser(email);
          }

          // 4️⃣ Update state
          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
            pendingVerification: null,
          });

          console.log("✅ Login successful!");
          return true;

        } catch (err: any) {
          const message = extractErrorMessage(
            err,
            "Login failed. Please check your credentials."
          );
          console.error("❌ Login error:", err.response?.data || err.message);
          
          set({
            error: message,
            loading: false,
          });
          return false;
        }
      },

      /* ======== LOGOUT ======== */
      logout: () => {
        console.log("👋 Logging out...");

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          pendingVerification: null,
          error: null,
        });
      },

      /* ======== CLEAR ERROR ======== */
      clearError: () => {
        set({ error: null });
      },

      /* ======== INITIALIZE AUTH ======== */
      initialize: () => {
        const { token, user } = get();
        const isAuthenticated = !!(token && user);
        
        console.log("🔄 Initializing auth state:", { isAuthenticated });
        set({ isAuthenticated });
      },

      /* ======== CHECK AUTH STATUS ======== */
      checkAuth: () => {
        const state = get();
        return state.isAuthenticated && !!state.token;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => {
        // Server-side rendering guard
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      // Only persist essential auth data
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        pendingVerification: state.pendingVerification,
      }),
    }
  )
);
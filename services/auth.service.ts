// store/useAuthStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService } from "@/services/auth.service";

/* ======================================================
   TYPES
====================================================== */

interface PendingVerification {
  email: string;
  userId: number;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  is_active: boolean;
  is_admin?: boolean;
  nationality?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  pendingVerification: PendingVerification | null;
  loading: boolean;
  error: string | null;
  

  /* Auth actions */
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

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  initialize: () => Promise<void>;
  clearError: () => void;
}

/* ======================================================
   HELPERS - Updated to match actual API responses
====================================================== */

const extractUserId = (data: any): number | null => {
  // Check all possible locations for user ID
  const possible = [
    data?.user?.id,
    data?.id,
  ];

  for (const id of possible) {
    if (typeof id === "number") return id;
  }
  return null;
};

const extractToken = (data: any): string | null => {
  // Check all possible token field names
  const possible = [
    data?.token,
    data?.access,
    data?.access_token,
  ];

  for (const token of possible) {
    if (typeof token === "string" && token.length > 0) return token;
  }
  return null;
};

const extractUser = (data: any): User | null => {
  // API returns user object directly (not wrapped)
  if (data && typeof data === 'object' && data.email) {
    return data as User;
  }
  return null;
};

const extractError = (err: any, fallback: string) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.response?.data?.detail ||
  err?.message ||
  fallback;

/* ======================================================
   STORE
====================================================== */

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      /* ================= STATE ================= */
      user: null,
      token: null,
      isAuthenticated: false,
      pendingVerification: null,
      loading: false,
      error: null,

      /* ======================================================
         REGISTER → AUTO LOGIN → OTP
      ====================================================== */
      registerAndKickoffOTP: async (payload) => {
        set({ loading: true, error: null });

        try {
          console.log("📝 Step 1: Registering user...");
          
          // 1️⃣ Register
          const registerRes = await authService.register(payload);
          const userId = extractUserId(registerRes.data);

          if (!userId) {
            console.error("❌ No user ID in response:", registerRes.data);
            throw new Error("Registration failed: No user ID received");
          }

          console.log("✅ Registration successful, user ID:", userId);

          // 2️⃣ Auto-login
          console.log("🔐 Step 2: Auto-login...");
          const loginRes = await authService.login({
            email: payload.email,
            password: payload.password,
          });

          const token = extractToken(loginRes.data);
          if (!token) {
            console.error("❌ No token in login response:", loginRes.data);
            throw new Error("Login failed: No token received");
          }

          console.log("✅ Login successful, token received");

          // 3️⃣ Fetch user info
          console.log("👤 Step 3: Fetching user info...");
          let user: User | null = null;
          
          try {
            const userRes = await authService.getUser();
            user = extractUser(userRes.data);
            console.log("✅ User info fetched:", user);
          } catch (userErr) {
            console.warn("⚠️ Failed to fetch user info, using registration data");
            // Fallback to registration data
            user = {
              id: userId,
              email: payload.email,
              first_name: payload.first_name,
              last_name: payload.last_name,
              username: payload.email.split('@')[0],
              is_active: true,
              nationality: payload.nationality,
            };
          }

          // 4️⃣ Store auth state
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

          // 5️⃣ Send OTP (background, non-blocking)
          console.log("📧 Step 4: Sending OTP...");
          authService.getOTP(userId)
            .then(() => {
              console.log("✅ OTP sent successfully");
            })
            .catch((otpErr) => {
              console.warn("⚠️ OTP sending failed:", otpErr);
              set({ 
                error: "OTP sending failed. Please click 'Resend Code'" 
              });
            });

          console.log("🎉 Registration flow complete!");
          return true;

        } catch (err: any) {
          const message = extractError(err, "Registration failed");
          console.error("❌ Registration flow error:", message);
          
          set({ 
            error: message, 
            loading: false,
            user: null,
            token: null,
            isAuthenticated: false,
            pendingVerification: null,
          });
          return false;
        }
      },

      /* ======================================================
         VERIFY OTP
      ====================================================== */
      verifyOTP: async (otp) => {
        const pending = get().pendingVerification;
        if (!pending) {
          set({ error: "No OTP verification in progress" });
          return false;
        }

        set({ loading: true, error: null });

        try {
          console.log("🔐 Verifying OTP...");
          
          await authService.verifyOTP({
            email: pending.email,
            otp,
          });

          console.log("✅ OTP verified, fetching updated user...");

          // Re-fetch user to get email_verified status
          try {
            const userRes = await authService.getUser();
            const verifiedUser = extractUser(userRes.data);

            if (verifiedUser) {
              set({
                user: verifiedUser,
                pendingVerification: null,
                loading: false,
                error: null,
              });
              console.log("🎉 Email verification complete!");
              return true;
            }
          } catch (fetchErr) {
            console.warn("⚠️ Could not fetch updated user, clearing pending verification");
          }

          // If user fetch fails, just clear pending verification
          set({
            pendingVerification: null,
            loading: false,
            error: null,
          });

          return true;

        } catch (err: any) {
          const message = extractError(err, "Invalid OTP code. Please try again.");
          console.error("❌ OTP verification error:", message);
          
          set({
            error: message,
            loading: false,
          });
          return false;
        }
      },

      /* ======================================================
         RESEND OTP
      ====================================================== */
      resendOTP: async () => {
        const pending = get().pendingVerification;
        if (!pending) {
          set({ error: "No pending verification found" });
          return;
        }

        set({ loading: true, error: null });
        
        try {
          console.log("📧 Resending OTP...");
          await authService.getOTP(pending.userId);
          console.log("✅ OTP resent successfully");
          set({ loading: false });
        } catch (err: any) {
          const message = extractError(err, "Failed to resend OTP");
          console.error("❌ Resend OTP error:", message);
          set({ error: message, loading: false });
        }
      },

      clearPendingVerification: () => {
        console.log("🧹 Clearing pending verification");
        set({ pendingVerification: null, error: null });
      },

      /* ======================================================
         LOGIN (NO OTP)
      ====================================================== */
      login: async (email, password) => {
        set({ loading: true, error: null });

        try {
          console.log("🔐 Logging in...");
          
          // 1️⃣ Login
          const loginRes = await authService.login({ email, password });
          const token = extractToken(loginRes.data);
          
          if (!token) {
            throw new Error("Login failed: No token received");
          }

          console.log("✅ Login successful");

          // 2️⃣ Fetch user
          console.log("👤 Fetching user info...");
          const userRes = await authService.getUser();
          const user = extractUser(userRes.data);
          
          if (!user) {
            throw new Error("Failed to fetch user information");
          }

          console.log("✅ User info fetched");

          set({
            user,
            token,
            isAuthenticated: true,
            pendingVerification: null, // ✅ Never trigger OTP on login
            loading: false,
            error: null,
          });

          console.log("🎉 Login complete!");
          return true;

        } catch (err: any) {
          const message = extractError(err, "Login failed. Please check your credentials.");
          console.error("❌ Login error:", message);
          
          set({
            error: message,
            loading: false,
            user: null,
            token: null,
            isAuthenticated: false,
          });
          return false;
        }
      },

      /* ======================================================
         INITIALIZE (ON APP LOAD)
      ====================================================== */
      initialize: async () => {
        const { token } = get();
        
        if (!token) {
          console.log("ℹ️ No token found, user not authenticated");
          set({ user: null, isAuthenticated: false });
          return;
        }

        console.log("🔄 Initializing auth state...");

        try {
          const userRes = await authService.getUser();
          const user = extractUser(userRes.data);
          
          if (!user) {
            throw new Error("Invalid user data");
          }

          console.log("✅ Auth state initialized");
          set({ user, isAuthenticated: true });

        } catch (err) {
          console.error("❌ Auth initialization failed, clearing session");
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            pendingVerification: null,
          });
          localStorage.removeItem("auth-storage");
        }
      },

      /* ======================================================
         LOGOUT
      ====================================================== */
      logout: () => {
        console.log("👋 Logging out...");
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          pendingVerification: null,
          error: null,
        });
        
        localStorage.removeItem("auth-storage");
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
          : localStorage
      ),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        pendingVerification: state.pendingVerification,
      }),
    }
  )
);
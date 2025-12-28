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
  name: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
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
   HELPERS
====================================================== */

const extractUserId = (data: any): number | null => {
  const possible = [
    data?.data?.user?.id,
    data?.data?.id,
    data?.user?.id,
    data?.id,
  ];

  for (const id of possible) {
    if (typeof id === "number") return id;
  }
  return null;
};

const extractToken = (data: any): string | null => {
  const possible = [
    data?.data?.token,
    data?.token,
    data?.access_token,
  ];

  for (const token of possible) {
    if (typeof token === "string") return token;
  }
  return null;
};

const extractUser = (data: any): User | null => {
  const user = data?.data?.user || data?.data || data?.user;
  if (user && user.email) {
    // Ensure the user object has all required fields
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name || user.firstName || "",
      last_name: user.last_name || user.lastName || "",
      name: `${user.first_name || user.firstName || ""} ${user.last_name || user.lastName || ""}`.trim(),
      role: user.role || "user",
      is_active: user.is_active !== undefined ? user.is_active : true,
      email_verified: user.email_verified !== undefined ? user.email_verified : false,
      nationality: user.nationality,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
  return null;
};

const extractError = (err: any, fallback: string) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
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
         REGISTER → AUTO LOGIN → OTP (ONLY PLACE OTP STARTS)
      ====================================================== */
      registerAndKickoffOTP: async (payload) => {
        set({ loading: true, error: null });

        try {
          console.log('📝 Starting registration process...', { email: payload.email });

          // 1️⃣ Register user
          const registerRes = await authService.register(payload);
          console.log('✅ Registration response:', registerRes.data);

          // Extract user ID from registration response
          const userId = extractUserId(registerRes.data);
          console.log('📊 Extracted userId from registration:', userId);

          if (!userId) {
            throw new Error("Registration successful but userId not found in response");
          }

          // 2️⃣ Auto-login immediately after registration
          console.log('🔐 Attempting auto-login...');
          const loginRes = await authService.login({
            email: payload.email,
            password: payload.password,
          });
          
          const token = extractToken(loginRes.data);
          if (!token) {
            throw new Error("Auto-login failed: No token received");
          }
          console.log('✅ Auto-login successful, token received');

          // 3️⃣ Get user info with the new token
          let user: User | null = null;
          try {
            console.log('👤 Fetching user info...');
            const userRes = await authService.getUser();
            user = extractUser(userRes.data);
            if (user) {
              console.log('✅ User info loaded:', { id: user.id, email: user.email });
            }
          } catch (userError: any) {
            console.warn('⚠️ Could not fetch user info immediately:', userError.message);
            // Create a temporary user object from registration data
            user = {
              id: userId,
              email: payload.email,
              first_name: payload.first_name,
              last_name: payload.last_name,
              name: `${payload.first_name} ${payload.last_name}`,
              role: "user",
              is_active: true,
              email_verified: false,
              nationality: payload.nationality,
            };
          }

          // 4️⃣ Store authentication state and mark OTP as pending
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

          // 5️⃣ Send OTP in background (don't wait for it)
          console.log('📱 Sending OTP to user ID:', userId);
          setTimeout(async () => {
            try {
              await authService.getOTP(userId);
              console.log('✅ OTP sent successfully');
            } catch (otpError: any) {
              console.error('⚠️ Failed to send OTP automatically:', otpError.message);
              // Don't show error to user - they can resend manually
            }
          }, 500);

          return true;
        } catch (err: any) {
          const errorMsg = extractError(err, "Registration failed");
          console.error('❌ Registration error:', {
            message: errorMsg,
            fullError: err.response?.data || err.message,
          });
          
          set({
            error: errorMsg,
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
         VERIFY OTP (REGISTRATION ONLY)
      ====================================================== */
      verifyOTP: async (otp) => {
        const pending = get().pendingVerification;
        if (!pending) {
          set({ error: "No OTP verification in progress" });
          return false;
        }

        set({ loading: true, error: null });

        try {
          console.log('🔍 Verifying OTP:', { email: pending.email, otp });
          const verifyRes = await authService.verifyOTP({
            email: pending.email,
            otp,
          });
          console.log('✅ OTP verification response:', verifyRes.data);

          // 🔥 Re-fetch user info to get updated email_verified status
          let verifiedUser: User | null = null;
          try {
            const userRes = await authService.getUser();
            verifiedUser = extractUser(userRes.data);
            console.log('✅ Verified user info:', verifiedUser);
          } catch (userError) {
            console.warn('⚠️ Could not fetch updated user info:', userError);
            // Fallback to current user with verified flag
            const currentUser = get().user;
            if (currentUser) {
              verifiedUser = { ...currentUser, email_verified: true };
            }
          }

          set({
            user: verifiedUser || get().user,
            pendingVerification: null,
            loading: false,
            error: null,
          });

          return true;
        } catch (err: any) {
          const errorMsg = extractError(err, "OTP verification failed");
          console.error('❌ OTP verification error:', {
            message: errorMsg,
            fullError: err.response?.data || err.message,
          });
          
          set({
            error: errorMsg,
            loading: false,
          });
          return false;
        }
      },

      /* ======================================================
         RESEND OTP (REGISTRATION ONLY)
      ====================================================== */
      resendOTP: async () => {
        const pending = get().pendingVerification;
        if (!pending) {
          set({ error: "No OTP verification in progress" });
          return;
        }

        set({ loading: true, error: null });
        try {
          console.log('🔄 Resending OTP to user ID:', pending.userId);
          await authService.getOTP(pending.userId);
          console.log('✅ OTP resent successfully');
          set({ loading: false, error: null });
        } catch (err: any) {
          const errorMsg = extractError(err, "Failed to resend OTP");
          console.error('❌ Resend OTP error:', errorMsg);
          set({
            error: errorMsg,
            loading: false,
          });
        }
      },

      /* ======================================================
         CLEAR PENDING VERIFICATION
      ====================================================== */
      clearPendingVerification: () => {
        console.log("🧹 Clearing pending verification");
        set({ pendingVerification: null, error: null });
      },

      /* ======================================================
         LOGIN (NO OTP HERE - ONLY FOR EXISTING USERS)
      ====================================================== */
      login: async (email, password) => {
        set({ loading: true, error: null });

        try {
          console.log('🔐 Login attempt:', { email });
          const loginRes = await authService.login({ email, password });
          const token = extractToken(loginRes.data);
          
          if (!token) {
            throw new Error("Login failed: No token received");
          }

          console.log('✅ Login successful, fetching user info...');
          const userRes = await authService.getUser();
          const user = extractUser(userRes.data);
          
          if (!user) {
            throw new Error("Failed to fetch user information");
          }

          console.log('✅ User loaded:', { id: user.id, email: user.email });
          
          set({
            user,
            token,
            isAuthenticated: true,
            pendingVerification: null, // 🔥 NEVER trigger OTP on login
            loading: false,
            error: null,
          });

          return true;
        } catch (err: any) {
          const errorMsg = extractError(err, "Login failed");
          console.error('❌ Login error:', {
            message: errorMsg,
            fullError: err.response?.data || err.message,
          });
          
          set({
            error: errorMsg,
            loading: false,
          });
          return false;
        }
      },

      /* ======================================================
         INITIALIZE (REFRESH / REHYDRATE ON APP LOAD)
      ====================================================== */
      initialize: async () => {
        const { token } = get();
        if (!token) {
          console.log('🔄 No token found, setting unauthenticated');
          set({ user: null, isAuthenticated: false });
          return;
        }

        try {
          console.log('🔄 Initializing auth with existing token...');
          const userRes = await authService.getUser();
          const user = extractUser(userRes.data);
          
          if (!user) {
            throw new Error("Failed to fetch user with stored token");
          }

          console.log('✅ Auth initialized:', { id: user.id, email: user.email });
          set({ user, isAuthenticated: true });
        } catch (err: any) {
          console.error('❌ Auth initialization failed:', err.message);
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
        console.log('👋 Logging out...');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          pendingVerification: null,
          error: null,
        });
        localStorage.removeItem("auth-storage");
      },

      /* ======================================================
         CLEAR ERROR
      ====================================================== */
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
      // Optional: Add migration if needed
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration logic from version 0 to 1 if needed
          return persistedState;
        }
        return persistedState;
      },
    }
  )
);

/* ======================================================
   DEBUG UTILITY
====================================================== */

export const debugAuth = () => {
  const state = useAuthStore.getState();
  console.log('🔍 Auth State Debug:', {
    isAuthenticated: state.isAuthenticated,
    hasToken: !!state.token,
    pendingVerification: state.pendingVerification,
    user: state.user ? {
      id: state.user.id,
      email: state.user.email,
      email_verified: state.user.email_verified,
      name: state.user.name,
    } : null,
    loading: state.loading,
    error: state.error,
  });
};

/* ======================================================
   AUTH GUARD HOOK
====================================================== */

export const useAuthGuard = () => {
  const { isAuthenticated, initialize, loading } = useAuthStore();
  
  return {
    isAuthenticated,
    loading,
    requireAuth: () => {
      if (!isAuthenticated && !loading) {
        // Redirect to login or show modal
        return false;
      }
      return true;
    },
  };
};
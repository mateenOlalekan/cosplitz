// services/auth.service.ts
import { api } from "@/lib/axios";
import { AUTH, OTP,ADMIN } from "@/lib/endpoints";

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  nationality: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOTPPayload {
  email: string;
  otp: string;
}

export interface User {
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

export interface AuthResponse {
  success: boolean;
  data: {
    token?: string;
    user?: User;
    id?: number;
    message?: string;
  };
  message?: string;
}

export const authService = {
  // Registration - Add debugging
  register: async (data: RegisterPayload) => {
    try {
      console.log('🔍 Registration attempt:', { 
        url: AUTH.REGISTER, 
        data: { ...data, password: '***' } 
      });
      const response = await api.post<AuthResponse>(AUTH.REGISTER, data);
      console.log('✅ Registration response:', response.data);
      return response;
    } catch (error: any) {
      console.error('❌ Registration error:', {
        status: error.response?.status,
        method: error.config?.method,
        url: error.config?.url,
        data: error.response?.data,
      });
      throw error;
    }
  },

  // Login - Add debugging
  login: async (data: LoginPayload) => {
    try {
      console.log('🔍 Login attempt:', { 
        url: AUTH.LOGIN, 
        email: data.email 
      });
      const response = await api.post<AuthResponse>(AUTH.LOGIN, data);
      console.log('✅ Login response:', response.data);
      return response;
    } catch (error: any) {
      console.error('❌ Login error:', {
        status: error.response?.status,
        method: error.config?.method,
        url: error.config?.url,
        data: error.response?.data,
      });
      throw error;
    }
  },

  // OTP Verification
  verifyOTP: (data: VerifyOTPPayload) => 
    api.post<AuthResponse>(OTP.VERIFYOTP, data),

  // Get OTP - This might need to be POST instead of GET
  getOTP: async (id: number) => {
    try {
      // Try GET first
      return await api.get<AuthResponse>(OTP.GETOTP(id));
    } catch (error: any) {
      if (error.response?.status === 405) {
        // If 405, try POST instead
        console.warn('⚠️ GET returned 405, trying POST');
        return await api.post<AuthResponse>(OTP.GETOTP(id));
      }
      throw error;
    }
  },

  // Get User Info
  getUser: () => 
    api.get<{ data: User }>(AUTH.USER_INFO),

  // Forgot Password - Fixed endpoint
  forgotPassword: (email: string) => 
    api.post<{ success: boolean; message?: string }>(
      ADMIN.FORGET_PASSWORD, // Changed from ADMIN.LOGIN
      { email }
    ),

  // Reset Password
  resetPassword: (token: string, password: string) => 
    api.post<{ success: boolean; message?: string }>(
      ADMIN.RESET_PASSWORD, 
      { token, password }
    ),
};


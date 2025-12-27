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
  // Registration
  register: (data: RegisterPayload) => 
    api.post<AuthResponse>(AUTH.REGISTER, data),

  // Login
  login: (data: LoginPayload) => 
    api.post<AuthResponse>(AUTH.LOGIN, data),

  // OTP Verification
  verifyOTP: (data: VerifyOTPPayload) => 
    api.post<AuthResponse>(OTP.VERIFYOTP, data),

  // Get OTP
  getOTP: (id: number) => 
    api.get<AuthResponse>(OTP.GETOTP(id)),

  // Get User Info
  getUser: () => 
    api.get<{ data: User }>(AUTH.USER_INFO),

    // Logout (if your API has it)
  // logout: () => 
  //   api.post<{ success: boolean; message?: string }>(ADMIN.LOGOUT),

  // Forgot Password
  forgotPassword: (email: string) => 
    api.post<{ success: boolean; message?: string }>(ADMIN.LOGIN, { email }),

  // Reset Password
  resetPassword: (token: string, password: string) => 
    api.post<{ success: boolean; message?: string }>(ADMIN.RESET_PASSWORD, { token, password }),

  forgetPassword: (token: string, password: string) => 
    api.post<{ success: boolean; message?: string }>(ADMIN.FORGET_PASSWORD, { token, password }),
};


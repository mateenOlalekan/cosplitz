import { api } from "@/lib/axios";
import { OTP } from "@/lib/endpoints";

export const otpService = {
  sendOtp: (userId: number) => api.get(OTP.SEND(userId)),

  verifyOtp: (data: { email: string; otp: string }) =>
    api.post(OTP.VERIFY, data),
};

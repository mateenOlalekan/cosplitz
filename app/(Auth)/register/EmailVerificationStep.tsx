// src/app/register/components/EmailVerificationStep.tsx
"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import OTPInput from "./OTPInput";

interface EmailVerificationStepProps {
  email: string;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export default function EmailVerificationStep({
  email,
  onBack,
  loading,
  error,
}: EmailVerificationStepProps) {
  const [timer, setTimer] = useState(180);
  const { verifyOTP, resendOTP, clearError } = useAuthStore();

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    if (timer > 0) return;

    await resendOTP();
    setTimer(180);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex flex-col items-center gap-5 py-8 relative w-full">
      <button
        onClick={onBack}
        className="absolute left-4 top-4 text-gray-600 hover:text-green-600 transition"
        type="button"
        disabled={loading}
      >
        <ArrowLeft size={28} />
      </button>

      <h2 className="text-xl font-bold text-gray-800 mt-8">Verify Your Email</h2>
      <p className="text-gray-500 text-sm text-center max-w-xs">
        Enter the code sent to{" "}
        <span className="text-green-600 font-medium">{email}</span>.
      </p>

      <div className="bg-[#1F82250D] rounded-full w-14 h-14 flex items-center justify-center">
        <Mail className="text-[#1F8225]" size={24} />
      </div>

      {/* OTP Input */}
      <OTPInput
        loading={loading}
        onComplete={verifyOTP}
      />

      {/* Timer / Resend */}
      <div className="text-center mt-4">
        {timer > 0 ? (
          <p className="text-sm text-gray-600">
            Resend code in{" "}
            <span className="font-semibold">{formatTime(timer)}</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
          >
            Resend Code
          </button>
        )}
      </div>

      {/* Errors */}
      {error && (
        <p className="text-red-600 text-sm text-center max-w-xs mt-2">{error}</p>
      )}
    </div>
  );
}
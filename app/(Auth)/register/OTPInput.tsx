// src/app/register/components/OTPInput.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

interface OTPInputProps {
  length?: number;
  loading: boolean;
  onComplete: (otp: string) => Promise<boolean>;
  autoSubmit?: boolean;
}

export default function OTPInput({
  length = 6,
  loading,
  onComplete,
  autoSubmit = true,
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { clearError } = useAuthStore();

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Focus the first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handle OTP change
  const handleChange = (value: string, index: number) => {
    // Only allow single digit numbers
    if (!/^\d?$/.test(value)) return;

    // Clear any existing errors when user starts typing
    clearError();

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < length - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }

    // If all digits are filled and autoSubmit is enabled
    if (autoSubmit && newOtp.every((digit) => digit !== "")) {
      handleSubmit(newOtp.join(""));
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
      return;
    }

    // Move to next input on arrow right
    if (e.key === "ArrowRight" && index < length - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
      return;
    }

    // Move to previous input on arrow left
    if (e.key === "ArrowLeft" && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
      return;
    }

    // Handle numeric keypad input
    if (e.key === "Enter" && otp.every((digit) => digit !== "")) {
      handleSubmit(otp.join(""));
    }
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Only process if pasted data is numeric and matches length
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.slice(0, length).split("");
      const newOtp = [...otp];

      digits.forEach((digit, index) => {
        if (index < length) {
          newOtp[index] = digit;
        }
      });

      setOtp(newOtp);
      
      // Focus the last filled input
      const lastFilledIndex = Math.min(digits.length - 1, length - 1);
      setActiveIndex(lastFilledIndex);
      inputRefs.current[lastFilledIndex]?.focus();

      // Auto-submit if all digits are filled
      if (autoSubmit && digits.length === length) {
        handleSubmit(digits.join(""));
      }
    }
  };

  // Handle submit
  const handleSubmit = async (code?: string) => {
    const otpCode = code || otp.join("");
    
    if (otpCode.length !== length) {
      return;
    }

    await onComplete(otpCode);
  };

  // Handle input focus
  const handleFocus = (index: number) => {
    setActiveIndex(index);
    // Select the text in the input when focused
    setTimeout(() => {
      inputRefs.current[index]?.select();
    }, 0);
  };

  // Handle click on the OTP container
  const handleContainerClick = () => {
    // Find the first empty input and focus it
    const firstEmptyIndex = otp.findIndex((digit) => digit === "");
    const indexToFocus = firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex;
    
    setActiveIndex(indexToFocus);
    inputRefs.current[indexToFocus]?.focus();
  };

  return (
    <div className="w-full max-w-md">
      {/* OTP Input Fields */}
      <div 
        className="flex items-center justify-center gap-2 sm:gap-3 mb-4"
        onClick={handleContainerClick}
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => handleFocus(index)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={loading}
            className={`
              w-12 h-12 sm:w-14 sm:h-14
              text-center text-xl sm:text-2xl font-bold
              border-2 rounded-lg
              transition-all duration-200
              outline-none
              ${activeIndex === index 
                ? "border-green-600 ring-2 ring-green-100" 
                : "border-gray-300 hover:border-gray-400"
              }
              ${digit ? "bg-green-50 border-green-500" : "bg-white"}
              ${loading ? "opacity-60 cursor-not-allowed" : "cursor-text"}
              focus:border-green-600 focus:ring-2 focus:ring-green-100
            `}
            aria-label={`Digit ${index + 1} of your verification code`}
          />
        ))}
      </div>

      {/* Manual Submit Button (only if autoSubmit is false) */}
      {!autoSubmit && (
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={loading || otp.some((digit) => digit === "")}
          className={`
            w-full mt-4 py-3 px-4
            bg-green-600 text-white
            rounded-lg font-semibold
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-green-700
            active:scale-95
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verifying...
            </span>
          ) : (
            "Verify Code"
          )}
        </button>
      )}

      {/* Helper Text */}
      <p className="text-center text-sm text-gray-500 mt-3">
        {autoSubmit 
          ? "Code will auto-verify when complete"
          : "Enter all 6 digits to verify"
        }
      </p>
    </div>
  );
}

// Helper hook for OTP validation (optional, can be placed in a separate file)
export const useOTPValidation = () => {
  const validateOTP = (otp: string): { valid: boolean; message?: string } => {
    if (otp.length !== 6) {
      return { valid: false, message: "OTP must be 6 digits" };
    }
    
    if (!/^\d+$/.test(otp)) {
      return { valid: false, message: "OTP must contain only numbers" };
    }
    
    return { valid: true };
  };

  return { validateOTP };
};
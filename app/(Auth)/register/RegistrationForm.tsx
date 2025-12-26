// src/app/register/components/RegistrationForm.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { PiAppleLogoBold } from "react-icons/pi";
import { Eye, EyeOff } from "lucide-react";
import PasswordValidation from "./PasswordValidation";

interface RegistrationFormProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    nationality: string;
    password: string;
    agreeToTerms: boolean;
  };
  loading: boolean;
  error: string | null;
  onInputChange: (field: string, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSocialRegister: (provider: string) => void;
}

export default function RegistrationForm({
  formData,
  loading,
  error,
  onInputChange,
  onSubmit,
  onSocialRegister,
}: RegistrationFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const formFields = [
    { key: "firstName", label: "First Name", type: "text" },
    { key: "lastName", label: "Last Name", type: "text" },
    { key: "email", label: "Email Address", type: "email" },
    { key: "nationality", label: "Nationality", type: "text" },
  ];

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl text-center font-bold text-gray-900">
        Create Your Account
      </h1>
      <p className="text-gray-500 text-center text-sm mt-1 mb-4">
        Let's get started with real-time cost sharing.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-3 text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <SocialButton
          provider="google"
          icon={<FcGoogle size={20} />}
          label="Sign Up with Google"
          onClick={() => onSocialRegister("google")}
        />
        <SocialButton
          provider="apple"
          icon={<PiAppleLogoBold size={20} />}
          label="Sign Up with Apple"
          onClick={() => onSocialRegister("apple")}
        />
      </div>

      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-2 text-gray-500 text-sm">Or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {formFields.map((field) => (
          <div key={field.key}>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {field.label} *
            </label>
            <input
              type={field.type}
              value={formData[field.key as keyof typeof formData] as string}
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              onChange={(e) => onInputChange(field.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors"
              required
            />
          </div>
        ))}

        <PasswordField
          password={formData.password}
          showPassword={showPassword}
          onPasswordChange={(value) => onInputChange("password", value)}
          onToggleShowPassword={() => setShowPassword(!showPassword)}
        />

        <TermsCheckbox
          checked={formData.agreeToTerms}
          onChange={(checked) => onInputChange("agreeToTerms", checked)}
        />

        <SubmitButton loading={loading} />

        <p className="text-center text-sm text-gray-600 mt-3">
          Already have an account?{" "}
          <a href="/login" className="text-green-600 hover:underline font-medium">
            Log In
          </a>
        </p>
      </form>
    </div>
  );
}

// Supporting Components
function SocialButton({ provider, icon, label, onClick }: {
  provider: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      {icon}
      <span className="text-gray-700 text-sm">{label}</span>
    </motion.button>
  );
}

function PasswordField({ password, showPassword, onPasswordChange, onToggleShowPassword }: {
  password: string;
  showPassword: boolean;
  onPasswordChange: (value: string) => void;
  onToggleShowPassword: () => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">
        Password *
      </label>
      <div className="flex items-center border border-gray-300 px-3 rounded-lg focus-within:ring-2 focus-within:ring-green-500 transition-colors">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          placeholder="Create your password"
          onChange={(e) => onPasswordChange(e.target.value)}
          className="w-full py-2 outline-none"
          required
        />
        <button
          type="button"
          onClick={onToggleShowPassword}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <PasswordValidation password={password} />
    </div>
  );
}

function TermsCheckbox({ checked, onChange }: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex gap-2 text-sm text-gray-600 mt-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded focus:ring-green-500"
      />
      <span>
        I agree to the{" "}
        <a href="/terms" className="text-green-600 hover:underline font-medium">
          Terms
        </a>
        ,{" "}
        <a href="/privacy" className="text-green-600 hover:underline font-medium">
          Privacy
        </a>{" "}
        &{" "}
        <a href="/fees" className="text-green-600 hover:underline font-medium">
          Fees
        </a>
        .
      </span>
    </label>
  );
}

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="submit"
      disabled={loading}
      className={`w-full bg-green-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 ${
        loading ? "opacity-60 cursor-not-allowed" : "hover:bg-green-700"
      }`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Creating Account...
        </span>
      ) : (
        "Create Account"
      )}
    </motion.button>
  );
}
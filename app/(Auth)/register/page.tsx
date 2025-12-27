"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import EmailVerificationStep from "./EmailVerificationStep";
import RegistrationForm from "./RegistrationForm";
import Successful from "./Successful";
import loginlogo from "@/assets/login.jpg";
import logo from "@/assets/logo.svg";
import Image from "next/image";

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const reloadTimer = useRef<NodeJS.Timeout | null>(null);

  // Zustand store
  const {
    loading,
    error,
    pendingVerification,
    registerAndKickoffOTP,
    verifyOTP,
    resendOTP,
    clearError,
    clearPendingVerification,
  } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    nationality: "",
    password: "",
    agreeToTerms: false,
  });

  const steps = [
    { id: 1, label: "Account", description: "Create your account" },
    { id: 2, label: "Verify Email", description: "Verify your email address" },
    { id: 3, label: "Success", description: "Account created successfully" },
  ];

  useEffect(() => {
    clearError();
  }, [currentStep, clearError]);

  useEffect(() => {
    return () => {
      if (reloadTimer.current) {
        clearTimeout(reloadTimer.current);
      }
    };
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      return;
    }

    if (!formData.agreeToTerms) {
      return;
    }

    const passwordValid =
      formData.password.length >= 8 &&
      /[A-Z]/.test(formData.password) &&
      /\d/.test(formData.password);

    if (!passwordValid) {
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return;
    }

    // Call Zustand store action
    const success = await registerAndKickoffOTP({
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      nationality: formData.nationality || "",
    });

    if (success) {
      setCurrentStep(2);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const handleEmailVerificationSuccess = async () => {
    setCurrentStep(3);

    setTimeout(() => {
      router.push("/onboarding-steps");
    }, 2000);
  };

  const handleVerificationFailed = (msg: string) => {
    reloadTimer.current = setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleBackToStep1 = () => {
    clearError();
    clearPendingVerification();
    setCurrentStep(1);
  };

  const handleSocialRegister = (provider: string) => {
    console.log(`Social register with ${provider}`);
  };

  return (
    <div className="flex bg-[#F7F5F9] w-full h-screen justify-center overflow-hidden md:px-6 md:py-4 rounded-2xl">
      <div className="flex max-w-screen-2xl w-full h-full rounded-xl overflow-hidden">
        {/* LEFT */}
        <div className="hidden lg:flex w-1/2 bg-[#F8EACD] rounded-xl p-6 items-center justify-center">
          <div className="w-full flex flex-col items-center">
            <Image
              src={loginlogo}
              alt="Register"
              className="rounded-lg w-full h-auto max-h-[400px] object-contain"
            />
            <div className="bg-gradient-to-br max-w-lg from-[#FAF3E8] to-[#F8EACD] mt-4 p-4 rounded-2xl shadow-sm text-center">
              <h1 className="text-3xl font-semibold text-[#2D0D23] mb-1">
                Share Expenses & Resources in Real Time
              </h1>
              <p className="text-xl font-medium text-[#4B4B4B] leading-relaxed">
                Connect with students, travelers, and locals to effortlessly manage costs and resources.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-1 flex-col items-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full mb-4 flex justify-center md:justify-start items-center md:items-start">
            <Image src={logo} alt="Logo" className="h-10 md:h-12" />
          </div>

          <div className="w-full max-w-2xl p-5 rounded-xl shadow-none md:shadow-md border-none md:border border-gray-100 bg-white">
            {/* STEPS */}
            <div className="w-full flex flex-col items-center py-4 mb-4">
              <div className="flex items-center gap-2 justify-center mb-2">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                        currentStep >= s.id
                          ? "bg-green-600 border-green-600 text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      {s.id}
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={`w-16 md:w-24 lg:w-32 border-t-2 mx-2 ${
                          currentStep > s.id ? "border-green-600" : "border-gray-300"
                        }`}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 text-center">
                {steps.find((s) => s.id === currentStep)?.description}
              </p>
            </div>

            {/* STEP CONTENT */}
            {currentStep === 1 && (
              <RegistrationForm
                formData={formData}
                handleInputChange={handleInputChange}
                handleFormSubmit={handleFormSubmit}
                handleSocialRegister={handleSocialRegister}
                loading={loading}
                error={error}
              />
            )}

            {currentStep === 2 && pendingVerification && (
              <EmailVerificationStep
                email={pendingVerification.email}
                userId={pendingVerification.userId}
                onBack={handleBackToStep1}
                onSuccess={handleEmailVerificationSuccess}
                onVerificationFailed={handleVerificationFailed}
                verifyOTP={verifyOTP}
                resendOTP={resendOTP}
                loading={loading}
                error={error}
              />
            )}

            {currentStep === 3 && <Successful />}
          </div>
        </div>
      </div>
    </div>
  );
}
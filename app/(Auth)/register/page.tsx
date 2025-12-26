// src/app/register/page.tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import RegistrationForm from "./RegistrationForm";
import EmailVerificationStep from "./EmailVerificationStep";
import SuccessStep from "./Successful";
import RegistrationStepper from "./REgistrationStepper";
import LeftPanel from "@/components/Ui/LeftPanel";
import { useRegistration } from "@/hooks/useRegistration";
import logo from "../../../assets/logo.svg";

export default function Register() {
  const {
    currentStep,
    formData,
    loading,
    error,
    pendingVerification,
    handleInputChange,
    handleFormSubmit,
    handleBackToStep1,
    handleSocialRegister,
  } = useRegistration();

  const steps = [
    { id: 1, label: "Account", description: "Create your account" },
    { id: 2, label: "Verify Email", description: "Verify your email address" },
    { id: 3, label: "Success", description: "Account created successfully" },
  ];

  return (
    <div className="flex bg-[#F7F5F9] w-full h-screen justify-center overflow-hidden md:px-6 md:py-4 rounded-2xl">
      <div className="flex max-w-screen-2xl w-full h-full rounded-xl overflow-hidden">
        
        {/* Left Panel */}
        <LeftPanel />

        {/* Right Panel */}
        <div className="flex flex-1 flex-col items-center p-3 sm:p-5 overflow-y-auto">
          {/* Logo */}
          <div className="w-full mb-4 flex justify-center md:justify-start items-center md:items-start">
            <Image
              src={logo}
              alt="Logo"
              className="h-10 md:h-12 w-auto"
              priority
            />
          </div>

          {/* Registration Card */}
          <div className="w-full max-w-2xl p-5 rounded-xl shadow-none md:shadow-md border-none md:border border-gray-100 bg-white">
            
            {/* Stepper */}
            <RegistrationStepper
              steps={steps}
              currentStep={currentStep}
            />

            {/* Step Content */}
            {currentStep === 1 && (
              <RegistrationForm
                formData={formData}
                loading={loading}
                error={error}
                onInputChange={handleInputChange}
                onSubmit={handleFormSubmit}
                onSocialRegister={handleSocialRegister}
              />
            )}

            {currentStep === 2 && (
              <EmailVerificationStep
                email={pendingVerification?.email || formData.email}
                onBack={handleBackToStep1}
                loading={loading}
                error={error}
              />
            )}

            {currentStep === 3 && <SuccessStep />}
          </div>
        </div>
      </div>
    </div>
  );
}
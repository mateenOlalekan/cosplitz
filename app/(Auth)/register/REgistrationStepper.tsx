// src/app/register/components/RegistrationStepper.tsx
"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface Step {
  id: number;
  label: string;
  description: string;
}

interface RegistrationStepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  showLabels?: boolean;
  showDescriptions?: boolean;
}

export default function RegistrationStepper({
  steps,
  currentStep,
  className = "",
  showLabels = false,
  showDescriptions = true,
}: RegistrationStepperProps) {
  // Calculate progress percentage
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="relative mb-6">
        {/* Background Track */}
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          {/* Animated Progress Fill */}
          <motion.div
            className="h-full bg-green-600 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Step Circles */}
        <div className="absolute top-1/2 left-0 right-0 flex justify-between -translate-y-1/2">
          {steps.map((step, index) => {
            const stepIndex = index + 1;
            const isCompleted = stepIndex < currentStep;
            const isCurrent = stepIndex === currentStep;
            const isUpcoming = stepIndex > currentStep;

            return (
              <div key={step.id} className="relative">
                {/* Step Circle */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? "bg-green-600 border-green-600 text-white"
                      : isCurrent
                      ? "bg-white border-green-600 text-green-600 shadow-lg shadow-green-100"
                      : "bg-white border-gray-300 text-gray-400"
                  } ${isCurrent ? "scale-110" : "scale-100"}`}
                >
                  {isCompleted ? (
                    <Check size={16} className="text-white" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>

                {/* Step Label (Optional) */}
                {showLabels && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2">
                    <span
                      className={`text-xs font-medium whitespace-nowrap ${
                        isCurrent || isCompleted
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Description */}
      {showDescriptions && (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <p className="text-sm text-gray-600">
            {steps.find((s) => s.id === currentStep)?.description}
          </p>
          
          {/* Step Indicator Text */}
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-xs text-gray-500">
              Step {currentStep} of {steps.length}
            </span>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className="text-xs font-medium text-green-600">
              {Math.round(progressPercentage)}% complete
            </span>
          </div>
        </motion.div>
      )}

      {/* Mobile Progress Indicator (Alternative Design) */}
      <div className="md:hidden mt-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepIndex = index + 1;
            const isCompleted = stepIndex < currentStep;
            const isCurrent = stepIndex === currentStep;

            return (
              <div key={step.id} className="flex-1 flex items-center">
                {/* Step Circle (Mobile) */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCompleted || isCurrent
                        ? "bg-green-600"
                        : "bg-gray-300"
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={12} className="text-white" />
                    ) : (
                      <span
                        className={`text-xs ${
                          isCurrent ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {step.id}
                      </span>
                    )}
                  </div>
                  
                  {/* Step Label for Mobile */}
                  <span
                    className={`text-xs mt-1 ${
                      isCurrent
                        ? "text-green-600 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connecting Line (except for last step) */}
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      stepIndex < currentStep
                        ? "bg-green-600"
                        : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


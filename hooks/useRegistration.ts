// src/hooks/useRegistration.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { validateRegistrationForm } from '@/utils/formValidation';

export const useRegistration = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nationality: '',
    password: '',
    agreeToTerms: false,
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  
  const {
    pendingVerification,
    loading,
    error,
    registerAndKickoffOTP,
    clearPendingVerification,
    clearError,
  } = useAuthStore();

  useEffect(() => {
    // Navigate to step 2 after successful registration
    if (pendingVerification && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [pendingVerification, currentStep]);

  useEffect(() => {
    // Navigate to success step after email verification
    if (currentStep === 2 && !pendingVerification && !error) {
      setCurrentStep(3);
      setTimeout(() => {
        router.push('/onboarding-steps');
      }, 2000);
    }
  }, [pendingVerification, error, currentStep, router]);

  useEffect(() => {
    return () => {
      clearPendingVerification();
    };
  }, [clearPendingVerification]);

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
    // Clear store error
    if (error) {
      clearError();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateRegistrationForm(formData);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }
    
    // Prepare registration data
    const registrationData = {
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      nationality: formData.nationality || '',
    };
    
    // Call registration API
    const success = await registerAndKickoffOTP(registrationData);
    
    if (success) {
      setFormErrors([]);
    }
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    clearError();
  };

  const handleSocialRegister = (provider: string) => {
    console.log(`Social register with ${provider}`);
    // Implement social registration logic
  };

  return {
    currentStep,
    formData,
    formErrors,
    loading,
    error: error || (formErrors.length > 0 ? formErrors[0] : null),
    pendingVerification,
    handleInputChange,
    handleFormSubmit,
    handleBackToStep1,
    handleSocialRegister,
    setCurrentStep,
  };
};
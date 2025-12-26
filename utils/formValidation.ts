// src/utils/formValidation.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export const validateRegistrationForm = (formData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!formData.firstName.trim()) errors.push("First name is required");
  if (!formData.lastName.trim()) errors.push("Last name is required");
  if (!formData.email.trim()) errors.push("Email is required");
  if (!validateEmail(formData.email)) errors.push("Please enter a valid email address");
  if (!formData.password) errors.push("Password is required");
  if (!formData.agreeToTerms) errors.push("You must agree to the terms");
  
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.valid) {
    errors.push(...passwordValidation.errors);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
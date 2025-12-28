// import { Check, X } from "lucide-react";

// interface Props {
//   password: string;
// }

// export default function PasswordValidation({ password }: Props) {
//   const validations = [
//     { label: "8+ characters", isValid: password.length >= 8 },
//     { label: "Uppercase letter", isValid: /[A-Z]/.test(password) },
//     { label: "Digit", isValid: /\d/.test(password) },
//   ];

//   return (
//     <div className="flex flex-col gap-2 mt-2">
//       {validations.map((v, i) => (
//         <div key={i} className="flex items-center gap-3">
//           <div
//             className={`w-5 h-5 rounded-full flex items-center justify-center ${
//               v.isValid ? "bg-green-100" : "bg-gray-100"
//             }`}
//           >
//             {v.isValid ? <Check size={14} className="text-green-600" /> : <X size={14} className="text-gray-400" />}
//           </div>
//           <span className={`text-xs ${v.isValid ? "text-green-600" : "text-gray-500"}`}>{v.label}</span>
//         </div>
//       ))}
//     </div>
//   );
// }
// app/register/PasswordValidation.tsx
"use client";

import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface Props {
  password: string;
}

export default function PasswordValidation({ password }: Props) {
  const validations = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "At least one uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "At least one number",
      valid: /[0-9]/.test(password),
    },
  ];

  const isValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  return (
    <div className="mt-2">
      <div className="space-y-1">
        {validations.map((validation, index) => (
          <div key={index} className="flex items-center gap-2">
            {validation.valid ? (
              <CheckCircle size={14} className="text-green-500" />
            ) : (
              <XCircle size={14} className="text-gray-300" />
            )}
            <span className={`text-xs ${validation.valid ? "text-green-600" : "text-gray-500"}`}>
              {validation.label}
            </span>
          </div>
        ))}
      </div>
      {password.length > 0 && (
        <div className="mt-2">
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isValid ? "bg-green-500" : "bg-yellow-500"
              }`}
              style={{
                width: `${Math.min((password.length / 8) * 100, 100)}%`,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Password strength: {isValid ? "Strong" : password.length > 0 ? "Weak" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
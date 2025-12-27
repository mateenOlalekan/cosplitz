// RegistrationForm.tsx
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { PiAppleLogoBold } from "react-icons/pi";
import { Eye, EyeOff, ChevronDown, Loader2 } from "lucide-react";
import PasswordValidation from "./PasswordValidation";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  nationality: string;
  password: string;
  agreeToTerms: boolean;
}

interface Props {
  formData: FormData;
  handleInputChange: (field: string, value: string | boolean) => void;
  handleFormSubmit: (e: React.FormEvent) => Promise<void>;
  handleSocialRegister: (provider: string) => void;
  loading: boolean;
  error: string | null;
}

interface Country {
  name: {
    common: string;
    official: string;
  };
  demonyms?: {
    eng?: {
      m: string;
      f: string;
    };
  };
  flags: {
    png: string;
    svg: string;
  };
}

export default function RegistrationForm({
  formData,
  handleInputChange,
  handleFormSubmit,
  handleSocialRegister,
  loading,
  error,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [filteredNationalities, setFilteredNationalities] = useState<string[]>([]);
  const [loadingNationalities, setLoadingNationalities] = useState(false);
  const nationalityRef = useRef<HTMLDivElement>(null);

  // Fetch nationalities from REST Countries API
  useEffect(() => {
    const fetchNationalities = async () => {
      setLoadingNationalities(true);
      try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,demonyms");
        const data: Country[] = await response.json();
        
        // Extract nationalities (demonyms)
        const nationalityList = data
          .map((country) => country.demonyms?.eng?.m || country.name.common)
          .filter(Boolean)
          .sort();
        
        setNationalities(nationalityList);
      } catch (error) {
        console.error("Failed to fetch nationalities:", error);
        // Fallback to basic list if API fails
        setNationalities(["American", "British", "Canadian", "Nigerian", "Indian", "Chinese", "German", "French"]);
      } finally {
        setLoadingNationalities(false);
      }
    };

    fetchNationalities();
  }, []);

  // Handle nationality input change with filtering
  const handleNationalityChange = (value: string) => {
    handleInputChange("nationality", value);
    
    if (value.trim() === "") {
      setFilteredNationalities([]);
      setShowNationalityDropdown(false);
    } else {
      const filtered = nationalities.filter(nat => 
        nat.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredNationalities(filtered);
      setShowNationalityDropdown(filtered.length > 0);
    }
  };

  // Handle nationality selection
  const selectNationality = (nationality: string) => {
    handleInputChange("nationality", nationality);
    setShowNationalityDropdown(false);
    setFilteredNationalities([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (nationalityRef.current && !nationalityRef.current.contains(event.target as Node)) {
        setShowNationalityDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => handleSocialRegister("google")}
          className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FcGoogle size={20} />
          <span className="text-gray-700 text-sm">Sign Up with Google</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => handleSocialRegister("apple")}
          className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <PiAppleLogoBold size={20} />
          <span className="text-gray-700 text-sm">Sign Up with Apple</span>
        </motion.button>
      </div>

      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-2 text-gray-500 text-sm">Or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-3">
        {[
          { key: "firstName", label: "First Name", type: "text" },
          { key: "lastName", label: "Last Name", type: "text" },
          { key: "email", label: "Email Address", type: "email" },
        ].map((field) => (
          <div key={field.key}>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {field.label} *
            </label>
            <input
              type={field.type}
              value={formData[field.key as keyof FormData] as string}
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors"
              required
            />
          </div>
        ))}

        {/* Nationality with API Autocomplete */}
        <div ref={nationalityRef} className="relative">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Nationality *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.nationality}
              placeholder="Enter your nationality"
              onChange={(e) => handleNationalityChange(e.target.value)}
              onFocus={() => {
                if (formData.nationality && filteredNationalities.length > 0) {
                  setShowNationalityDropdown(true);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors"
              required
              autoComplete="off"
              disabled={loadingNationalities}
            />
            {loadingNationalities ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={18} />
            ) : (
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            )}
          </div>

          {/* Dropdown */}
          {showNationalityDropdown && filteredNationalities.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredNationalities.slice(0, 10).map((nationality, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectNationality(nationality)}
                  className="w-full px-3 py-2 text-left hover:bg-green-50 hover:text-green-600 transition-colors text-sm border-b border-gray-100 last:border-b-0"
                >
                  {nationality}
                </button>
              ))}
              {filteredNationalities.length > 10 && (
                <div className="px-3 py-2 text-xs text-gray-500 text-center bg-gray-50">
                  +{filteredNationalities.length - 10} more results
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Password *
          </label>
          <div className="flex items-center w-full border border-gray-300 px-3 rounded-lg focus-within:ring-2 focus-within:ring-green-500 transition-colors">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              placeholder="Create your password"
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="w-full py-2 outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <PasswordValidation password={formData.password} />
        </div>

        <label className="flex gap-2 text-sm text-gray-600 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
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

        <p className="text-center text-sm text-gray-600 mt-3">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 hover:underline font-medium">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}
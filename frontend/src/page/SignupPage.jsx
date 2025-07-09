import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Code,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { signUpSchema } from "../util/zodSchema";
import AuthImagePattern from "../components/AuthImagePattern";
import { useAuthStore } from "../store/useAuthStore";
import OTPLogin from "../components/OtpLogin";

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState("");
  const navigate = useNavigate();
  const { signup, isSigningUp } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    watch,
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onChange", // This will validate on every change
  });

  // Watch all form values for debugging
  const watchedValues = watch();

  const onSubmit = async (data) => {
    console.log("Form submitted with data:", data);

    try {
      const result = await signup(data);

      if (result.success) {
        // Show email verification component
        setRegistrationEmail(data.email);
        setShowEmailVerification(true);
      } else {
        // Handle specific signup errors
        if (result.error.includes("already exists")) {
          setError("email", { message: "Email already registered" });
        } else {
          setError("email", { message: result.error });
        }
      }
    } catch (error) {
      console.error("Error in signup form submission:", error);
    }
  };

  const handleEmailVerificationSuccess = () => {
    // After successful email verification, redirect to login or dashboard
    navigate("/login", {
      replace: true,
      state: {
        message: "Email verified successfully! You can now login.",
      },
    });
  };

  const handleBackToSignup = () => {
    setShowEmailVerification(false);
    setRegistrationEmail("");
  };

  // Debug function to test button click
  const handleDebugClick = () => {
    console.log("Button clicked!");
    console.log("Current form values:", watchedValues);
    console.log("Form errors:", errors);
    console.log("Is form valid:", isValid);
    console.log("Is signing up:", isSigningUp);
  };

  if (showEmailVerification) {
    return (
      <div className="h-screen grid lg:grid-cols-2">
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Success Message */}
            <div className="text-center">
              <div className="flex flex-col items-center gap-2 mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold">Registration Successful!</h1>
                <p className="text-base-content/60">
                  We've sent a verification code to your email
                </p>
              </div>
            </div>

            {/* Verification Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Email Verification Required</span>
              </div>
              <p className="text-sm text-blue-600">
                Please check your email at <strong>{registrationEmail}</strong>{" "}
                and enter the verification code below to complete your
                registration.
              </p>
            </div>

            {/* OTP Verification Component */}
            <OTPLogin
              email={registrationEmail}
              onBackToLogin={handleBackToSignup}
              onSuccess={handleEmailVerificationSuccess}
            />

            {/* Additional Info */}
            <div className="text-center">
              <p className="text-base-content/60 text-sm">
                Wrong email address?{" "}
                <button
                  onClick={handleBackToSignup}
                  className="link link-primary"
                >
                  Go back to signup
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Image/Pattern */}
        <AuthImagePattern
          title="Almost There!"
          subtitle="Check your email and enter the verification code to complete your registration."
        />
      </div>
    );
  }

  return (
    <div className="h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Create Account</h1>
              <p className="text-base-content/60">
                Join us and start your journey
              </p>
            </div>
          </div>

          {/* Debug Info (remove in production) */}
          <div className="bg-gray-100 p-2 rounded text-xs">
            <p>Debug Info:</p>
            <p>Form Valid: {isValid ? "Yes" : "No"}</p>
            <p>Errors: {Object.keys(errors).length}</p>
            <p>Is Signing Up: {isSigningUp ? "Yes" : "No"}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className={`input input-bordered w-full pl-10 ${
                    errors.name ? "input-error" : ""
                  }`}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.name.message}
                  </span>
                </label>
              )}
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-base-content/40" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`input input-bordered w-full pl-10 ${
                    errors.email ? "input-error" : ""
                  }`}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.email.message}
                  </span>
                </label>
              )}
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-base-content/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className={`input input-bordered w-full pl-10 pr-10 ${
                    errors.password ? "input-error" : ""
                  }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-base-content/40 hover:text-base-content"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.password.message}
                  </span>
                </label>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className={`checkbox ${
                    errors.acceptTerms ? "checkbox-error" : ""
                  }`}
                  {...register("acceptTerms")}
                />
                <span className="label-text">
                  I agree to the{" "}
                  <Link to="/terms" className="link link-primary">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="link link-primary">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.acceptTerms.message}
                  </span>
                </label>
              )}
            </div>

            {/* Debug Button */}
            <button
              type="button"
              onClick={handleDebugClick}
              className="btn btn-secondary w-full mb-2"
            >
              Debug - Check Form State
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSigningUp}
              className="btn btn-primary w-full"
              onClick={(e) => {
                console.log("Submit button clicked!");
                console.log("Event:", e);
              }}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Manual submit for testing */}
            <button
              type="button"
              onClick={() => {
                console.log("Manual submit triggered");
                handleSubmit(onSubmit)();
              }}
              className="btn btn-outline w-full"
            >
              Manual Submit (Test)
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title="Join Our Community"
        subtitle="Start your journey with us today and discover endless possibilities."
      />
    </div>
  );
};

export default SignupPage;

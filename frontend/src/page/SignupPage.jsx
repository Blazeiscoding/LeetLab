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
  ArrowLeft,
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

  const onSubmit = async (data) => {

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

  if (showEmailVerification) {
    return (
      <div className="min-h-screen grid lg:grid-cols-2 bg-base-100">
        <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative">
           {/* Back Button */}
           <button 
            onClick={handleBackToSignup}
            className="absolute top-8 left-8 p-2 rounded-full hover:bg-base-200 transition-colors group"
            aria-label="Go back to signup"
        >
            <ArrowLeft className="w-5 h-5 text-base-content/60 group-hover:text-base-content" />
        </button>

          <div className="w-full max-w-md space-y-8">
            {/* Success Message */}
            <div className="text-center">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center border border-success/20 animate-bounce-subtle">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">Verify Your Email</h1>
                <p className="text-base-content/60">
                  We've sent a verification code to your email address.
                </p>
              </div>
            </div>

            {/* Verification Info */}
            <div className="bg-base-200/50 border border-base-content/10 rounded-xl p-6 text-center">
              <p className="text-sm text-base-content/70 mb-2">
                  Code sent to:
              </p>
              <p className="font-bold text-lg text-primary mb-4">{registrationEmail}</p>
              
              <div className="flex items-center justify-center gap-2 text-warning text-xs font-medium bg-warning/10 py-2 px-3 rounded-lg w-fit mx-auto">
                <AlertCircle className="w-4 h-4" />
                <span>Check your spam folder if you don't see it</span>
              </div>
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
                  className="link link-primary font-semibold no-underline hover:underline"
                >
                  Change email
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-base-100">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative">
        {/* Back Button */}
        <Link 
            to="/"
            className="absolute top-8 left-8 p-2 rounded-full hover:bg-base-200 transition-colors group"
            aria-label="Go back to home"
        >
            <ArrowLeft className="w-5 h-5 text-base-content/60 group-hover:text-base-content" />
        </Link>

        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/10 border border-primary/10">
                <Code className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-3xl font-black mt-4 tracking-tight">Create Account</h1>
              <p className="text-base-content/60">
                Join our community and start coding today
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div className="form-control space-y-1.5">
              <label className="label p-0">
                <span className="label-text font-bold">Full Name</span>
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className={`input input-bordered w-full pl-10 bg-base-200/50 focus:bg-base-100 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                    errors.name ? "input-error focus:ring-error/20 focus:border-error" : ""
                  }`}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-error text-sm font-medium mt-1 pl-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="form-control space-y-1.5">
              <label className="label p-0">
                <span className="label-text font-bold">Email Address</span>
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`input input-bordered w-full pl-10 bg-base-200/50 focus:bg-base-100 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                    errors.email ? "input-error focus:ring-error/20 focus:border-error" : ""
                  }`}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-error text-sm font-medium mt-1 pl-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="form-control space-y-1.5">
              <label className="label p-0">
                <span className="label-text font-bold">Password</span>
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className={`input input-bordered w-full pl-10 pr-10 bg-base-200/50 focus:bg-base-100 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                    errors.password ? "input-error focus:ring-error/20 focus:border-error" : ""
                  }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-base-content/40 hover:text-base-content transition-colors"
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
                <p className="text-error text-sm font-medium mt-1 pl-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className={`checkbox checkbox-primary checkbox-sm ${
                    errors.acceptTerms ? "checkbox-error" : ""
                  }`}
                  {...register("acceptTerms")}
                />
                <span className="label-text text-base-content/70">
                  I agree to the{" "}
                  <Link to="/terms" className="link link-primary font-medium no-underline hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="link link-primary font-medium no-underline hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-error text-sm font-medium mt-1 pl-1">
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSigningUp}
              className="btn btn-primary w-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
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
          </form>

          {/* Login Link */}
          <div className="text-center pt-4">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary font-semibold hover:text-primary-focus no-underline hover:underline transition-all">
                Sign in here
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

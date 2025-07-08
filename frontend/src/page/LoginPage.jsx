import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Code, Loader2, Lock, Mail, KeyRound } from "lucide-react";
import { z } from "zod";
import AuthImagePattern from "../components/AuthImagePattern";
import { useAuthStore } from "../store/useAuthStore";
import OTPLogin from "../components/OtpLogin";

// Email only schema for the new login flow
const emailOnlySchema = z.object({
  email: z.string().email("Enter a valid email"),
});

const LoginPage = () => {
  const [loginMethod, setLoginMethod] = useState("otp"); // Default to OTP since it's the primary method
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggingIn } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(emailOnlySchema),
  });

  const onSubmit = async (data) => {
    try {
      const result = await login(data);

      if (result.success && result.requiresOTP) {
        setUserEmail(data.email);
        setShowOTPForm(true);
      } else if (result.success) {
        // Direct login (if still supported)
        navigate("/", { replace: true });
      } else {
        if (result.error.includes("not found")) {
          setError("email", { message: "No account found with this email" });
        } else if (result.error.includes("verify")) {
          setError("email", { message: "Please verify your email first" });
        } else {
          setError("email", { message: result.error });
        }
      }
    } catch (error) {
      console.error("Error in login form submission:", error);
    }
  };

  const handleBackToEmailForm = () => {
    setShowOTPForm(false);
    setUserEmail("");
  };

  const handleOTPSuccess = () => {
    const redirectPath = location.state?.from?.pathname || "/";
    navigate(redirectPath, { replace: true });
  };

  return (
    <div className="h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        {showOTPForm ? (
          <OTPLogin
            email={userEmail}
            onBackToLogin={handleBackToEmailForm}
            onSuccess={handleOTPSuccess}
          />
        ) : (
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
                <p className="text-base-content/60">
                  Enter your email to login
                </p>
              </div>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-700">
                <KeyRound className="w-5 h-5" />
                <span className="font-medium">Secure Login</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                We'll send you a one-time password (OTP) to your email for
                secure access.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email Address</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-base-content/40" />
                  </div>
                  <input
                    type="email"
                    {...register("email")}
                    className={`input input-bordered w-full pl-10 ${
                      errors.email ? "input-error" : ""
                    }`}
                    placeholder="you@example.com"
                    disabled={isLoggingIn}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center">
              <p className="text-base-content/60">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="link link-primary"
                  tabIndex={isLoggingIn ? -1 : 0}
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title={showOTPForm ? "Enter Verification Code" : "Welcome Back!"}
        subtitle={
          showOTPForm
            ? "Enter the OTP sent to your email to complete login."
            : "Enter your email to receive a secure one-time password for quick access."
        }
      />
    </div>
  );
};

export default LoginPage;

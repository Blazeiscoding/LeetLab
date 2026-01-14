import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowLeft, IconCode, IconEye, IconEyeOff, IconLoader, IconLock, IconMail } from '@tabler/icons-react';
import { z } from "zod";
import AuthImagePattern from "../components/AuthImagePattern";
import { useAuthStore } from "../store/useAuthStore";
import OTPLogin from "../components/OtpLogin";

// Updated schema to include password
const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggingIn, authUser } = useAuthStore();

  useEffect(() => {
    if (authUser) {
      const redirectPath = location.state?.from?.pathname || "/";
      navigate(redirectPath, { replace: true });
    }
  }, [authUser, location, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const result = await login(data);

      if (result.success && result.requiresOTP) {
        // User needs email verification (unverified account)
        setUserEmail(data.email);
        setShowOTPForm(true);
      } else if (result.success) {
        // Direct login successful (verified account)
        const redirectPath = location.state?.from?.pathname || "/";
        navigate(redirectPath, { replace: true });
      } else {
        // Handle various error cases
        if (result.error.includes("not found")) {
          setError("email", {
            message: "You must register your account before logging in.",
          });
        } else if (result.error.includes("verify")) {
          setError("email", { message: "Please verify your email first" });
        } else if (result.error.includes("Invalid password")) {
          setError("password", { message: "Incorrect password" });
        } else if (result.error.includes("Invalid credentials")) {
          setError("password", { message: "Invalid email or password" });
        } else {
          setError("email", { message: result.error });
        }
      }
    } catch (error) {
      console.error("Error in login form submission:", error);
      setError("email", { message: "An unexpected error occurred" });
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-base-100">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative">
        {/* Back Button */}
        <Link 
            to="/"
            className="absolute top-8 left-8 p-2 rounded-full hover:bg-base-200 transition-colors group"
            aria-label="Go back to home"
        >
            <IconArrowLeft className="w-5 h-5 text-base-content/60 group-hover:text-base-content" />
        </Link>

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
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/10 border border-primary/10">
                  <IconCode className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-3xl font-black mt-4 tracking-tight">Welcome Back</h1>
                <p className="text-base-content/60">
                  Sign in to continue your coding journey
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div className="form-control space-y-1.5">
                <label className="label p-0">
                  <span className="label-text font-bold">Email Address</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconMail className="h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    {...register("email")}
                    className={`input input-bordered w-full pl-10 bg-base-200/50 focus:bg-base-100 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      errors.email ? "input-error focus:ring-error/20 focus:border-error" : ""
                    }`}
                    placeholder="you@example.com"
                    disabled={isLoggingIn}
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconLock className="h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={`input input-bordered w-full pl-10 pr-10 bg-base-200/50 focus:bg-base-100 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      errors.password ? "input-error focus:ring-error/20 focus:border-error" : ""
                    }`}
                    placeholder="••••••••"
                    disabled={isLoggingIn}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoggingIn}
                  >
                    {showPassword ? (
                      <IconEyeOff className="h-5 w-5" />
                    ) : (
                      <IconEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-error text-sm font-medium mt-1 pl-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <IconLoader className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center pt-4">
              <p className="text-base-content/60">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="link link-primary font-semibold hover:text-primary-focus no-underline hover:underline transition-all"
                  tabIndex={isLoggingIn ? -1 : 0}
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title={showOTPForm ? "Email Verification" : "Welcome Back!"}
        subtitle={
          showOTPForm
            ? "Please verify your email to complete the login process."
            : "Enter your credentials to access your account."
        }
      />
    </div>
  );
};

export default LoginPage;

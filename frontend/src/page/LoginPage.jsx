import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Code, Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";
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
          setError("email", { message: "You must register your account before logging in." });
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
                  Sign in to your account
                </p>
              </div>
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

              {/* Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-base-content/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={`input input-bordered w-full pl-10 pr-10 ${
                      errors.password ? "input-error" : ""
                    }`}
                    placeholder="Enter your password"
                    disabled={isLoggingIn}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3.5 text-base-content/40 hover:text-base-content"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoggingIn}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
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
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center space-y-2">
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
              <p className="text-base-content/60">
                <Link
                  to="/forgot-password"
                  className="link link-primary"
                  tabIndex={isLoggingIn ? -1 : 0}
                >
                  Forgot Password?
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
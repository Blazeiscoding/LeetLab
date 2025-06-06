import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Mail, Loader2, Send } from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern";
import { useAuthStore } from "../store/useAuthStore";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

const ForgotPasswordPage = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { forgotPassword, isSendingResetEmail } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      const result = await forgotPassword(data.email);
      if (result.success) {
        setIsEmailSent(true);
      }
    } catch (error) {
      console.error("Error in forgot password", error);
    }
  };

  if (isEmailSent) {
    return (
      <div className="h-screen grid lg:grid-cols-2">
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8 text-center">
            {/* Success Icon */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <Send className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold">Check Your Email</h1>
              <p className="text-base-content/60 text-center">
                We've sent a password reset link to{" "}
                <span className="font-medium text-primary">
                  {getValues("email")}
                </span>
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-base-200 rounded-lg p-6 text-left">
              <h3 className="font-semibold mb-3">What's next?</h3>
              <ol className="space-y-2 text-sm text-base-content/70">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  Check your email inbox (and spam folder)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  Click the reset password link
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  Create a new secure password
                </li>
              </ol>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={() => setIsEmailSent(false)}
                className="btn btn-outline w-full"
              >
                Try Different Email
              </button>
              <Link to="/login" className="btn btn-primary w-full">
                Back to Login
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Image/Pattern */}
        <AuthImagePattern
          title="Check Your Email"
          subtitle="We've sent you a secure link to reset your password."
        />
      </div>
    );
  }

  return (
    <div className="h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Forgot Password?</h1>
              <p className="text-base-content/60 text-center">
                No worries! Enter your email and we'll send you a reset link.
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
              disabled={isSendingResetEmail}
            >
              {isSendingResetEmail ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center space-y-4">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-base-content/60 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>

            <p className="text-base-content/60 text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="link link-primary">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title="Reset Your Password"
        subtitle="We'll help you get back into your account securely."
      />
    </div>
  );
};

export default ForgotPasswordPage;

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  KeyRound,
  Loader2,
  ArrowLeft,
  Timer,
  RefreshCw,
} from "lucide-react";
import { z } from "zod";
import { useAuthStore } from "../store/useAuthStore";

// Validation schemas
const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

const OTPLogin = ({ email: initialEmail, onBackToLogin, onSuccess }) => {
  const [step, setStep] = useState(initialEmail ? "otp" : "email");
  const [email, setEmail] = useState(initialEmail || "");
  const [timer, setTimer] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [otpExpiry, setOtpExpiry] = useState(null);

  const { sendOTP, verifyOTP, isSendingOTP, isVerifyingOTP } = useAuthStore();

  // Email form
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
    setError: setEmailError,
  } = useForm({
    resolver: zodResolver(emailSchema),
  });

  // OTP form
  const {
    register: registerOTP,
    handleSubmit: handleOTPSubmit,
    formState: { errors: otpErrors },
    setError: setOTPError,
    reset: resetOTP,
  } = useForm({
    resolver: zodResolver(otpSchema),
  });

  // If email is provided, immediately set up OTP form
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      setStep("otp");
      setTimer(600); // 10 minutes
    }
  }, [initialEmail]);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async (data) => {
    try {
      const result = await sendOTP(data.email);

      if (result.success) {
        setEmail(data.email);
        setStep("otp");
        setTimer(600); // 10 minutes countdown
        setRemainingAttempts(result.remainingAttempts);
        setOtpExpiry(result.expiresAt);
      } else {
        if (result.error.includes("not found")) {
          setEmailError("email", {
            message: "You must register your account before logging in.",
          });
        } else if (result.error.includes("verify")) {
          setEmailError("email", {
            message:
              "Please verify your email first. We'll send you a verification OTP.",
          });
        } else if (result.error.includes("Too many")) {
          setEmailError("email", {
            message: "Too many OTP requests. Please try again later.",
          });
        } else {
          setEmailError("email", { message: result.error });
        }
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setEmailError("email", {
        message: "Failed to send OTP. Please try again.",
      });
    }
  };

  const handleVerifyOTP = async (data) => {
    try {
      const result = await verifyOTP(email, data.otp);

      if (result.success) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        if (result.error.includes("Invalid or expired")) {
          setOTPError("otp", {
            message: "Invalid or expired OTP. Please try again.",
          });
        } else if (result.error.includes("Many attempts")) {
          setOTPError("otp", {
            message: "Too many attempts. Please request a new OTP.",
          });
        } else {
          setOTPError("otp", { message: result.error });
        }
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setOTPError("otp", {
        message: "Failed to verify OTP. Please try again.",
      });
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;

    try {
      const result = await sendOTP(email);

      if (result.success) {
        setTimer(600); // Reset 10 minutes countdown
        setRemainingAttempts(result.remainingAttempts);
        setOtpExpiry(result.expiresAt);
        resetOTP();
      } else {
        setOTPError("otp", {
          message: result.error || "Failed to resend OTP",
        });
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setOTPError("otp", {
        message: "Failed to resend OTP. Please try again.",
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleBackToEmail = () => {
    setStep("email");
    setTimer(0);
    setRemainingAttempts(5);
    resetOTP();
  };

  if (step === "email") {
    return (
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={onBackToLogin}
              className="btn btn-ghost btn-circle btn-sm"
              disabled={isSendingOTP}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-2xl font-bold">Login with OTP</h1>
          </div>
          <p className="text-base-content/60">
            Enter your email to receive a one-time password
          </p>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit(handleSendOTP)} className="space-y-6">
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
                {...registerEmail("email")}
                className={`input input-bordered w-full pl-10 ${
                  emailErrors.email ? "input-error" : ""
                }`}
                placeholder="you@example.com"
                disabled={isSendingOTP}
              />
            </div>
            {emailErrors.email && (
              <p className="text-red-500 text-sm mt-1">
                {emailErrors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isSendingOTP}
          >
            {isSendingOTP ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending OTP...
              </>
            ) : (
              "Send OTP"
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-base-content/60">
            Remember your password?{" "}
            <button
              onClick={onBackToLogin}
              className="link link-primary"
              disabled={isSendingOTP}
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={onBackToLogin ? onBackToLogin : handleBackToEmail}
            className="btn btn-ghost btn-circle btn-sm"
            disabled={isVerifyingOTP}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-2xl font-bold">Enter OTP</h1>
        </div>
        <p className="text-base-content/60">
          We've sent a 6-digit code to{" "}
          <span className="font-medium">{email}</span>
        </p>
      </div>

      {/* Timer and Attempts Info */}
      <div className="bg-base-200 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Time remaining:</span>
          <div className="flex items-center gap-1 text-primary">
            <Timer className="h-4 w-4" />
            <span className="font-mono text-sm">{formatTime(timer)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Remaining attempts:</span>
          <span className="text-sm font-bold">{remainingAttempts}</span>
        </div>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleOTPSubmit(handleVerifyOTP)} className="space-y-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Enter 6-digit OTP</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyRound className="h-5 w-5 text-base-content/40" />
            </div>
            <input
              type="text"
              {...registerOTP("otp")}
              className={`input input-bordered w-full pl-10 text-center text-lg tracking-widest font-mono ${
                otpErrors.otp ? "input-error" : ""
              }`}
              placeholder="123456"
              maxLength={6}
              disabled={isVerifyingOTP}
              autoComplete="one-time-code"
            />
          </div>
          {otpErrors.otp && (
            <p className="text-red-500 text-sm mt-1">{otpErrors.otp.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isVerifyingOTP}
        >
          {isVerifyingOTP ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </button>
      </form>

      {/* Resend OTP */}
      <div className="text-center">
        <p className="text-base-content/60 text-sm mb-2">
          Didn't receive the code?
        </p>
        <button
          onClick={handleResendOTP}
          className="btn btn-link btn-sm"
          disabled={timer > 0 || isSendingOTP || remainingAttempts <= 0}
        >
          {timer > 0 ? (
            <>
              <Timer className="h-4 w-4 mr-1" />
              Resend in {formatTime(timer)}
            </>
          ) : remainingAttempts <= 0 ? (
            "No more attempts"
          ) : isSendingOTP ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              Resending...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-1" />
              Resend OTP
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OTPLogin;

import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  RefreshCw,
} from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern";
import { useAuthStore } from "../store/useAuthStore";

const VerifyEmailPage = () => {
  const [verificationStatus, setVerificationStatus] = useState("loading"); // loading, success, error
  const [errorMessage, setErrorMessage] = useState("");

  const {
    verifyEmail,
    resendVerification,
    isVerifyingEmail,
    isResendingVerification,
    authUser,
  } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      handleVerification();
    } else {
      setVerificationStatus("error");
      setErrorMessage("Invalid or missing verification token");
    }
  }, [token]);

  const handleVerification = async () => {
    try {
      const result = await verifyEmail(token);
      if (result.success) {
        setVerificationStatus("success");
        // Redirect to profile or dashboard after 3 seconds
        setTimeout(() => {
          navigate("/profile");
        }, 3000);
      } else {
        setVerificationStatus("error");
        setErrorMessage(result.message || "Verification failed");
      }
    } catch (error) {
      setVerificationStatus("error");
      setErrorMessage("An error occurred during verification");
    }
  };

  const handleResendVerification = async () => {
    if (!authUser?.email) {
      setErrorMessage("User email not found. Please login again.");
      return;
    }

    try {
      const result = await resendVerification(authUser.email);
      if (result.success) {
        setVerificationStatus("resent");
      }
    } catch (error) {
      console.error("Error resending verification:", error);
    }
  };

  // Loading state
  if (verificationStatus === "loading") {
    return (
      <div className="h-screen grid lg:grid-cols-2">
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold">Verifying Your Email</h1>
              <p className="text-base-content/60">
                Please wait while we verify your email address...
              </p>
            </div>
          </div>
        </div>

        <AuthImagePattern
          title="Email Verification"
          subtitle="We're verifying your email address."
        />
      </div>
    );
  }

  // Success state
  if (verificationStatus === "success") {
    return (
      <div className="h-screen grid lg:grid-cols-2">
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold">Email Verified!</h1>
              <p className="text-base-content/60">
                Your email has been successfully verified. You now have full
                access to your account.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">
                Redirecting to your profile in 3 seconds...
              </p>
            </div>

            <div className="space-y-3">
              <Link to="/profile" className="btn btn-primary w-full">
                Go to Profile
              </Link>
              <Link to="/problems" className="btn btn-outline w-full">
                Start Solving Problems
              </Link>
            </div>
          </div>
        </div>

        <AuthImagePattern
          title="Welcome!"
          subtitle="Your email is verified and you're ready to go."
        />
      </div>
    );
  }

  // Resent state
  if (verificationStatus === "resent") {
    return (
      <div className="h-screen grid lg:grid-cols-2">
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold">Verification Email Sent</h1>
              <p className="text-base-content/60">
                We've sent a new verification email to your inbox. Please check
                your email and click the verification link.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-blue-900">Next Steps:</h4>
              <ol className="text-sm text-blue-700 text-left space-y-1">
                <li>1. Check your email inbox (and spam folder)</li>
                <li>2. Click the verification link in the email</li>
                <li>3. Return here to access your account</li>
              </ol>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                className="btn btn-outline w-full"
                disabled={isResendingVerification}
              >
                {isResendingVerification ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Send Another Email
                  </>
                )}
              </button>
              <Link to="/login" className="btn btn-ghost w-full">
                Back to Login
              </Link>
            </div>
          </div>
        </div>

        <AuthImagePattern
          title="Check Your Email"
          subtitle="A new verification email is on its way."
        />
      </div>
    );
  }

  // Error state
  return (
    <div className="h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold">Verification Failed</h1>
            <p className="text-base-content/60">
              {errorMessage ||
                "There was an issue verifying your email address."}
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-red-900">What to do next:</h4>
            <ul className="text-sm text-red-700 text-left space-y-1">
              <li>• Check if the verification link has expired</li>
              <li>• Request a new verification email</li>
              <li>• Contact support if the problem persists</li>
            </ul>
          </div>

          <div className="space-y-3">
            {authUser?.email && (
              <button
                onClick={handleResendVerification}
                className="btn btn-primary w-full"
                disabled={isResendingVerification}
              >
                {isResendingVerification ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Send New Verification Email
                  </>
                )}
              </button>
            )}
            <Link to="/login" className="btn btn-outline w-full">
              Back to Login
            </Link>
            <Link to="/signup" className="btn btn-ghost w-full">
              Create New Account
            </Link>
          </div>
        </div>
      </div>

      <AuthImagePattern
        title="Verification Error"
        subtitle="Don't worry, we can help you get verified."
      />
    </div>
  );
};

export default VerifyEmailPage;

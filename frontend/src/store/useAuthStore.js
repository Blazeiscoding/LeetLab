import { create } from "zustand";
import { axiosInstance } from "../util/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigninUp: false,
  isLoggingIn: false,
  isCheckingAuth: false,
  isSendingResetEmail: false,
  isResettingPassword: false,
  isResendingVerification: false,
  isVerifyingEmail: false,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/me");
      console.log("check response data", res.data);
      set({ authUser: res.data.user });
    } catch (error) {
      console.log("Error in checking auth", error);
      // Don't show error for auth check as user might not be logged in
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigninUp: true });
    try {
      console.log("Attempting signup with:", data);
      const res = await axiosInstance.post("/auth/register", data);

      if (!res || !res.data) {
        throw new Error("No response received from server");
      }

      console.log("Signup response:", res.data);
      set({ authUser: res.data.user });
      toast.success(res.data.message);
    } catch (error) {
      console.log("Error in signup", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      set({ isSigninUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      console.log("Attempting login with:", data);
      const res = await axiosInstance.post("/auth/login", data);

      if (!res || !res.data) {
        throw new Error("No response received from server");
      }

      console.log("Login response:", res.data);
      set({ authUser: res.data.user });
      toast.success(res.data.message);
    } catch (error) {
      console.log("Error in login", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      const res = await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success(res.data.message || "Logged out successfully");
    } catch (error) {
      console.log("Error in logout", error);
      // Even if logout fails on server, clear local state
      set({ authUser: null });
      const errorMessage =
        error?.response?.data?.message || error?.message || "Logout completed";
      toast.success(errorMessage);
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    set({ isSendingResetEmail: true });
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });

      if (!res || !res.data) {
        throw new Error("No response received from server");
      }

      toast.success(res.data.message || "Reset link sent to your email");
      return { success: true, message: res.data.message };
    } catch (error) {
      console.log("Error in forgot password", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send reset email";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      set({ isSendingResetEmail: false });
    }
  },

  // Reset Password
  resetPassword: async (token, password) => {
    set({ isResettingPassword: true });
    try {
      const res = await axiosInstance.post("/auth/reset-password", {
        token,
        password,
      });

      if (!res || !res.data) {
        throw new Error("No response received from server");
      }

      toast.success(res.data.message || "Password reset successfully");
      return { success: true, message: res.data.message };
    } catch (error) {
      console.log("Error in reset password", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reset password";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      set({ isResettingPassword: false });
    }
  },

  // Verify Email
  verifyEmail: async (token) => {
    set({ isVerifyingEmail: true });
    try {
      const res = await axiosInstance.post("/auth/verify-email", { token });

      if (!res || !res.data) {
        throw new Error("No response received from server");
      }

      toast.success(res.data.message || "Email verified successfully");
      // Update user verification status
      set((state) => ({
        authUser: state.authUser
          ? { ...state.authUser, isVerified: true }
          : null,
      }));
      return { success: true, message: res.data.message };
    } catch (error) {
      console.log("Error in email verification", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to verify email";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      set({ isVerifyingEmail: false });
    }
  },

  // Resend Verification Email
  resendVerification: async (email) => {
    set({ isResendingVerification: true });
    try {
      const res = await axiosInstance.post("/auth/resend-verification", {
        email,
      });

      if (!res || !res.data) {
        throw new Error("No response received from server");
      }

      toast.success(res.data.message || "Verification email sent");
      return { success: true, message: res.data.message };
    } catch (error) {
      console.log("Error in resending verification", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send verification email";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      set({ isResendingVerification: false });
    }
  },
}));

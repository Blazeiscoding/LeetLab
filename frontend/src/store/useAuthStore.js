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
      console.log("check resposne data", res.data);
      set({ authUser: res.data.user });
    } catch (error) {
      console.log("Error in checking auth", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigninUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);
      set({ authUser: res.data.user });
      toast.success(res.data.message);
    } catch (error) {
      console.log("Error in signup", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isSigninUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user });
      toast.success(res.data.message);
    } catch (error) {
      console.log("Error in login", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      const res = await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success(res.data.message);
    } catch (error) {
      console.log("Error in logout", error);
      toast.error(error.response.data.message);
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    set({ isSendingResetEmail: true });
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      toast.success(res.data.message || "Reset link sent to your email");
      return { success: true, message: res.data.message };
    } catch (error) {
      console.log("Error in forgot password", error);
      const errorMessage =
        error.response?.data?.message || "Failed to send reset email";
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
      toast.success(res.data.message || "Password reset successfully");
      return { success: true, message: res.data.message };
    } catch (error) {
      console.log("Error in reset password", error);
      const errorMessage =
        error.response?.data?.message || "Failed to reset password";
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
        error.response?.data?.message || "Failed to verify email";
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
      toast.success(res.data.message || "Verification email sent");
      return { success: true, message: res.data.message };
    } catch (error) {
      console.log("Error in resending verification", error);
      const errorMessage =
        error.response?.data?.message || "Failed to send verification email";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      set({ isResendingVerification: false });
    }
  },
}));

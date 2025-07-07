import { create } from "zustand";
import { axiosInstance } from "../util/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: false,
  isSendingOTP: false,
  isVerifyingOTP: false,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/me");
      set({ authUser: res.data.user });
      return res.data.user;
    } catch (error) {
      console.log("Error in checking auth:", error);
      if (error.response?.status === 401) {
        set({ authUser: null });
      }
      return null;
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);
      toast.success(
        res.data.message || "Registration successful! Please login."
      );
      return { success: true, user: res.data.user };
    } catch (error) {
      console.log("Error in signup:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Signup failed";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user });
      toast.success(res.data.message || "Login successful!");
      return { success: true, user: res.data.user };
    } catch (error) {
      console.log("Error in login:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Send OTP to user's email
  sendOTP: async (email) => {
    set({ isSendingOTP: true });
    try {
      const res = await axiosInstance.post("/auth/send-otp", { email });
      toast.success(res.data.message || "OTP sent successfully!");
      return {
        success: true,
        email: res.data.email,
        expiresAt: res.data.expiresAt,
        remainingAttempts: res.data.remainingAttempts,
      };
    } catch (error) {
      console.log("Error sending OTP:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to send OTP";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      set({ isSendingOTP: false });
    }
  },

  // Verify OTP and login user
  verifyOTP: async (email, otp) => {
    set({ isVerifyingOTP: true });
    try {
      const res = await axiosInstance.post("/auth/verify-otp", { email, otp });
      set({ authUser: res.data.user });
      toast.success(res.data.message || "OTP verified successfully!");
      return { success: true, user: res.data.user };
    } catch (error) {
      console.log("Error verifying OTP:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to verify OTP";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      set({ isVerifyingOTP: false });
    }
  },

  logout: async () => {
    try {
      const res = await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success(res.data.message || "Logout successful!");
      return { success: true };
    } catch (error) {
      console.log("Error in logout:", error);
      set({ authUser: null });
      const errorMessage =
        error.response?.data?.message || error.message || "Logout failed";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  // Helper method to clear auth state
  clearAuth: () => {
    set({ authUser: null });
  },
}));

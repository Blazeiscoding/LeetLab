import { create } from "zustand";
import { axiosInstance } from "../util/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  isSendingOTP: false,
  isVerifyingOTP: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      set({ authUser: res.data.user, isCheckingAuth: false });
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null, isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);
      toast.success(
        "Registration successful! Please check your email for verification."
      );
      return { success: true, data: res.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Something went wrong";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      set({ isSigningUp: false });
    }
  },

  // Updated login function to handle both verified and unverified accounts
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      console.log("LOGIN RESPONSE", res.data); // Debug log
      // Check if user is verified
      if (res.data.user && res.data.user.isEmailVerified) {
        // User is verified, direct login
        set({ authUser: res.data.user });
        // Force checkAuth to sync state with backend (fixes login without refresh)
        await get().checkAuth();
        toast.success("Login successful!");
        return { success: true, user: res.data.user };
      } else {
        // User is not verified, need OTP verification
        toast.info("Please verify your email to complete login.");
        return {
          success: true,
          requiresOTP: true,
          email: data.email,
          expiresAt: res.data.expiresAt,
          remainingAttempts: res.data.remainingAttempts,
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Send OTP to email
  sendOTP: async (email) => {
    set({ isSendingOTP: true });
    try {
      const res = await axiosInstance.post("/auth/send-otp", { email });
      toast.success("OTP sent to your email!");
      return {
        success: true,
        email: email,
        expiresAt: res.data.expiresAt,
        remainingAttempts: res.data.remainingAttempts,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send OTP";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      set({ isSendingOTP: false });
    }
  },

  // Verify OTP and complete login/registration
  verifyOTP: async (email, otp) => {
    set({ isVerifyingOTP: true });
    try {
      const res = await axiosInstance.post("/auth/verify-otp", { email, otp });
      set({ authUser: res.data.user });
      // Force checkAuth to sync state with backend (fixes login without refresh)
      await get().checkAuth();
      toast.success("Email verified successfully!");
      return { success: true, user: res.data.user };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "OTP verification failed";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      set({ isVerifyingOTP: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      console.log("Error in logout:", error);
      // Even if logout fails on backend, clear the frontend state
      set({ authUser: null });
      toast.error("Error logging out");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data.user });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in updateProfile:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
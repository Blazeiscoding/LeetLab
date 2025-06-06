import { create } from "zustand";
import { axiosInstance } from "../util/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false, // Fixed typo: was isSigninUp
  isLoggingIn: false,
  isCheckingAuth: false,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/me");
      console.log("Check auth response:", res.data);
      set({ authUser: res.data.user });
      return res.data.user;
    } catch (error) {
      console.log("Error in checking auth:", error);
      // If token is invalid, clear auth state
      if (error.response?.status === 401) {
        set({ authUser: null });
      }
      return null;
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true }); // Fixed typo
    try {
      console.log("Signup data being sent:", data);
      console.log(
        "Request URL:",
        axiosInstance.defaults.baseURL + "/auth/register"
      );

      const res = await axiosInstance.post("/auth/register", data);

      // Note: Backend returns user data but doesn't set JWT cookie on registration
      // User needs to login after registration
      toast.success(
        res.data.message || "Registration successful! Please login."
      );

      return { success: true, user: res.data.user };
    } catch (error) {
      console.log("Error in signup:", error);
      console.log("Error status:", error.response?.status);
      console.log("Error data:", error.response?.data);

      const errorMessage =
        error.response?.data?.message || error.message || "Signup failed";
      toast.error(errorMessage);

      return { success: false, error: errorMessage };
    } finally {
      set({ isSigningUp: false }); // Fixed typo
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      console.log("Login data being sent:", data);
      console.log(
        "Request URL:",
        axiosInstance.defaults.baseURL + "/auth/login"
      );

      const res = await axiosInstance.post("/auth/login", data);

      // Backend sets JWT cookie and returns user data
      set({ authUser: res.data.user });
      toast.success(res.data.message || "Login successful!");

      return { success: true, user: res.data.user };
    } catch (error) {
      console.log("Error in login:", error);
      console.log("Error status:", error.response?.status);
      console.log("Error data:", error.response?.data);

      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);

      return { success: false, error: errorMessage };
    } finally {
      set({ isLoggingIn: false });
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

      // Even if logout fails on backend, clear local state
      set({ authUser: null });

      const errorMessage =
        error.response?.data?.message || error.message || "Logout failed";
      toast.error(errorMessage);

      return { success: false, error: errorMessage };
    }
  },

  // Helper method to clear auth state (useful for token expiration)
  clearAuth: () => {
    set({ authUser: null });
  },
}));

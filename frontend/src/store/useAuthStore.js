import { create } from "zustand";

import { axiosInstance } from "../util/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigninUp: false,
  isLoggingIn: false,
  isCheckingAuth: false,

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
      // Safe error handling - check if response exists
      const errorMessage =
        error.response?.data?.message || error.message || "Signup failed";
      toast.error(errorMessage);
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
      // Safe error handling - check if response exists
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);
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
      const errorMessage =
        error.response?.data?.message || error.message || "Logout failed";
      toast.error(errorMessage);
    }
  },
}));

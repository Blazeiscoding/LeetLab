import { create } from 'zustand';
import { isAxiosError } from 'axios';
import { axiosInstance } from '../utils/axios';
import toast from 'react-hot-toast';
import { User, AuthResponse, OTPResponse } from '../types';

interface ErrorResponse {
  message?: string;
  error?: string;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<ErrorResponse>(error)) {
    return error.response?.data?.message ?? error.response?.data?.error ?? fallback;
  }

  return fallback;
};

interface AuthState {
  authUser: User | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  isSendingOTP: boolean;
  isVerifyingOTP: boolean;
  checkAuth: () => Promise<void>;
  signup: (data: { email: string; password: string; name: string }) => Promise<AuthResponse>;
  login: (data: { email: string; password: string }) => Promise<AuthResponse>;
  sendOTP: (email: string) => Promise<OTPResponse>;
  verifyOTP: (email: string, otp: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; image?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  isSendingOTP: false,
  isVerifyingOTP: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/me');
      set({ authUser: res.data.user, isCheckingAuth: false });
    } catch (error) {
      console.log('Error in checkAuth:', error);
      set({ authUser: null, isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/auth/register', data);
      toast.success(
        'Registration successful! Please check your email for verification.'
      );
      return { success: true, data: res.data };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Something went wrong');
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/auth/login', {
        email: data.email,
        password: data.password,
      });
      if (res.data.user && res.data.user.isEmailVerified) {
        set({ authUser: res.data.user });
        await get().checkAuth();
        toast.success('Login successful!');
        return { success: true, user: res.data.user };
      } else {
        toast('Please verify your email to complete login.', { icon: 'ℹ️' });
        return {
          success: true,
          requiresOTP: true,
          email: data.email,
          expiresAt: res.data.expiresAt,
          remainingAttempts: res.data.remainingAttempts,
        };
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Login failed');
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  sendOTP: async (email) => {
    set({ isSendingOTP: true });
    try {
      const res = await axiosInstance.post('/auth/send-otp', { email });
      toast.success('OTP sent to your email!');
      return {
        success: true,
        email: email,
        expiresAt: res.data.expiresAt,
        remainingAttempts: res.data.remainingAttempts,
      };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to send OTP');
      toast.error(errorMessage);
      return { success: false, error: errorMessage, email: '', expiresAt: '', remainingAttempts: 0 };
    } finally {
      set({ isSendingOTP: false });
    }
  },

  verifyOTP: async (email, otp) => {
    set({ isVerifyingOTP: true });
    try {
      const res = await axiosInstance.post('/auth/verify-otp', { email, otp });
      set({ authUser: res.data.user });
      await get().checkAuth();
      toast.success('Email verified successfully!');
      return { success: true, user: res.data.user };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'OTP verification failed');
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      set({ isVerifyingOTP: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null });
      toast.success('Logged out successfully');
    } catch (error) {
      console.log('Error in logout:', error);
      set({ authUser: null });
      toast.error('Error logging out');
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put('/auth/update-profile', data);
      set({ authUser: res.data.user });
      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      console.log('Error in updateProfile:', error);
      toast.error(getErrorMessage(error, 'Something went wrong'));
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));

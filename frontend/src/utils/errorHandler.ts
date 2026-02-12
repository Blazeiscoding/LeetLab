import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const handleApiError = (
  error: Error | AxiosError<ApiErrorResponse>,
  fallbackMessage = 'Something went wrong'
): string => {
  let message = fallbackMessage;

  if (error instanceof AxiosError) {
    message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallbackMessage;
  } else {
    message = error.message || fallbackMessage;
  }

  toast.error(message);
  console.error('API Error:', error);

  return message;
};

export const handleSuccess = (message: string): void => {
  toast.success(message);
};

export const handleInfo = (message: string): void => {
  toast(message, { icon: 'ℹ️' });
};

export const getErrorMessage = (
  error: Error | AxiosError<ApiErrorResponse>,
  fallbackMessage = 'Something went wrong'
): string => {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallbackMessage
    );
  }
  return error.message || fallbackMessage;
};

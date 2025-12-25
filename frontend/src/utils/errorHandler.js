import toast from 'react-hot-toast';

/**
 * Centralized error handling utilities
 * Provides consistent error messaging across the application
 */

/**
 * Handle API errors with toast notification
 * @param {Error} error - Error object from axios or other source
 * @param {string} fallbackMessage - Message to show if no specific error found
 * @returns {string} The error message that was displayed
 */
export const handleApiError = (error, fallbackMessage = 'Something went wrong') => {
  const message = error.response?.data?.message
    || error.response?.data?.error
    || error.message
    || fallbackMessage;

  toast.error(message);
  console.error('API Error:', error);

  return message;
};

/**
 * Handle success with toast notification
 * @param {string} message - Success message to display
 */
export const handleSuccess = (message) => {
  toast.success(message);
};

/**
 * Handle info notification
 * @param {string} message - Info message to display
 */
export const handleInfo = (message) => {
  toast(message, { icon: 'ℹ️' });
};

/**
 * Extract error message from error object without showing toast
 * @param {Error} error - Error object
 * @param {string} fallbackMessage - Fallback message
 * @returns {string} Error message
 */
export const getErrorMessage = (error, fallbackMessage = 'Something went wrong') => {
  return error.response?.data?.message
    || error.response?.data?.error
    || error.message
    || fallbackMessage;
};

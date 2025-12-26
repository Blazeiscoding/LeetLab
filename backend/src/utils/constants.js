// Application constants
export const STATUS_CODES = {
  ACCEPTED: 3,
  IN_QUEUE: 1,
  PROCESSING: 2,
};

export const LANGUAGE_IDS = {
  PYTHON: 71,
  JAVA: 62,
  JAVASCRIPT: 63,
};

export const LANGUAGE_NAMES = {
  71: "PYTHON",
  62: "JAVA",
  63: "JAVASCRIPT",
};

export const OTP_CONFIG = {
  EXPIRY_MINUTES: 10,
  EXPIRY_MS: 10 * 60 * 1000,
  MAX_ATTEMPTS: 5,
  LENGTH: 6,
  MIN_VALUE: 100000,
  MAX_VALUE: 999999,
};

export const JWT_CONFIG = {
  EXPIRES_IN: "7d",
  COOKIE_MAX_AGE: 60 * 60 * 24 * 7 * 1000, // 7 days
};

export const POLLING_CONFIG = {
  MAX_ATTEMPTS: 30,
  INTERVAL_MS: 1000,
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

import { EMAIL_REGEX } from "./constants.js";

/**
 * Validates email format
 */
export const isValidEmail = (email: unknown): email is string => {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email);
};

interface ValidationResult {
  isValid: boolean;
  missing?: string[];
  error?: string;
}

/**
 * Validates required fields in request body
 */
export const validateRequired = (
  data: Record<string, unknown>,
  requiredFields: string[]
): ValidationResult => {
  const missing: string[] = [];
  for (const field of requiredFields) {
    if (
      data[field] === undefined ||
      data[field] === null ||
      data[field] === ""
    ) {
      missing.push(field);
    }
  }
  return {
    isValid: missing.length === 0,
    missing,
  };
};

/**
 * Validates test cases array format
 */
export const validateTestCases = (
  stdin: unknown,
  expected_outputs: unknown
): ValidationResult => {
  if (!Array.isArray(stdin) || stdin.length === 0) {
    return { isValid: false, error: "stdin must be a non-empty array" };
  }
  if (!Array.isArray(expected_outputs)) {
    return { isValid: false, error: "expected_outputs must be an array" };
  }
  if (expected_outputs.length !== stdin.length) {
    return {
      isValid: false,
      error: "expected_outputs length must match stdin length",
    };
  }
  return { isValid: true };
};


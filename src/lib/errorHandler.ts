import { AxiosError } from "axios";

// Error types enum
export enum ErrorType {
  NETWORK = "NETWORK",
  AUTH = "AUTH",
  VALIDATION = "VALIDATION",
  SERVER = "SERVER",
  UNKNOWN = "UNKNOWN",
}

// Structured error object
export interface HandledError {
  type: ErrorType;
  statusCode?: number;
  message: string;
  userMessage: string;
  originalError: any;
  timestamp: string;
}

/**
 * Detect error type based on status code and error properties
 */
export const getErrorType = (error: any): ErrorType => {
  // Network errors (no response)
  if (!error.response) {
    if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
      return ErrorType.NETWORK;
    }
    return ErrorType.UNKNOWN;
  }

  const status = error.response.status;

  // Authentication errors
  if (status === 401 || status === 403) {
    return ErrorType.AUTH;
  }

  // Validation errors
  if (status === 400 || status === 422) {
    return ErrorType.VALIDATION;
  }

  // Server errors
  if (status >= 500) {
    return ErrorType.SERVER;
  }

  return ErrorType.UNKNOWN;
};

/**
 * Get user-friendly error message based on error type
 */
export const getUserMessage = (error: HandledError): string => {
  switch (error.type) {
    case ErrorType.AUTH:
      return "Your session has expired. Please log in again.";
    case ErrorType.VALIDATION:
      return (
        error.originalError?.response?.data?.message ||
        "Please check your input and try again."
      );
    case ErrorType.SERVER:
      return "Something went wrong on our end. Please try again later.";
    case ErrorType.NETWORK:
      return (
        "Network error. Please check your connection and try again."
      );
    default:
      return error.message || "An unexpected error occurred.";
  }
};

/**
 * Main error handler - converts errors to structured format
 */
export const handleApiError = (error: any): HandledError => {
  const type = getErrorType(error);
  const statusCode = error.response?.status;
  const timestamp = new Date().toISOString();

  let message = "";
  if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.message) {
    message = error.message;
  } else {
    message = "Unknown error occurred";
  }

  const handledError: HandledError = {
    type,
    statusCode,
    message,
    userMessage: "", // Will be set below
    originalError: error,
    timestamp,
  };

  handledError.userMessage = getUserMessage(handledError);

  return handledError;
};

/**
 * Check if error is authentication error (401/403)
 */
export const isAuthError = (error: HandledError): boolean => {
  return error.type === ErrorType.AUTH;
};

/**
 * Check if error is validation error (400/422)
 */
export const isValidationError = (error: HandledError): boolean => {
  return error.type === ErrorType.VALIDATION;
};

/**
 * Check if error is network error
 */
export const isNetworkError = (error: HandledError): boolean => {
  return error.type === ErrorType.NETWORK;
};

/**
 * Check if error is server error (5xx)
 */
export const isServerError = (error: HandledError): boolean => {
  return error.type === ErrorType.SERVER;
};

/**
 * Extract field-specific validation errors
 */
export const getFieldErrors = (
  error: HandledError
): Record<string, string> => {
  if (!isValidationError(error)) {
    return {};
  }

  const errors = error.originalError?.response?.data?.errors;
  if (typeof errors === "object" && errors !== null) {
    return errors;
  }

  return {};
};

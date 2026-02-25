import { useCallback } from "react";
import { useToast } from "./use-toast";
import {
  handleApiError,
  HandledError,
  isAuthError,
} from "@/lib/errorHandler";
import { logError } from "@/lib/logger";

/**
 * Custom hook for handling API errors in components
 * Provides consistent error handling, logging, and user feedback
 */
export const useApiError = () => {
  const { toast } = useToast();

  /**
   * Handle API error and show toast notification
   * Also logs error for debugging
   */
  const handleError = useCallback(
    (error: any, context?: string) => {
      try {
        const handledError = handleApiError(error);

        // Log the error
        logError(
          `${context || "API Error"}: ${handledError.message}`,
          {
            type: handledError.type,
            statusCode: handledError.statusCode,
            context,
          },
          error
        );

        // Show user-friendly toast notification
        toast({
          title: "Error",
          description: handledError.userMessage,
          variant: "destructive",
        });

        // Return handled error for further processing if needed
        return handledError;
      } catch (e) {
        // Fallback error handling
        logError("Failed to handle error", { originalError: error }, e as Error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );

  /**
   * Handle error and trigger auth logout if needed
   */
  const handleErrorWithAuth = useCallback(
    (error: any, context?: string) => {
      const handledError = handleError(error, context);

      if (handledError && isAuthError(handledError)) {
        // Clear auth tokens and redirect to login
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        
        // Redirect to login page
        window.location.href = "/login";
      }

      return handledError;
    },
    [handleError]
  );

  /**
   * Show a custom error toast
   */
  const showError = useCallback(
    (
      title: string,
      description: string,
      context?: string
    ) => {
      if (context) {
        logError(`${title}: ${description}`, { context });
      }
      toast({
        title,
        description,
        variant: "destructive",
      });
    },
    [toast]
  );

  /**
   * Show success toast
   */
  const showSuccess = useCallback(
    (title: string, description?: string) => {
      toast({
        title,
        description: description || "",
        variant: "default",
      });
    },
    [toast]
  );

  return {
    handleError,
    handleErrorWithAuth,
    showError,
    showSuccess,
  };
};

/**
 * Structured error interface for consistent error handling
 */
export interface StructuredErrorData {
  code: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Custom error class for structured error handling
 */
export class StructuredError extends Error {
  public readonly code: string;
  public readonly data: Record<string, unknown> | undefined;

  constructor({ code, message, data }: StructuredErrorData) {
    super(message);
    this.name = 'StructuredError';
    this.code = code;
    this.data = data;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, StructuredError.prototype);
  }
} 
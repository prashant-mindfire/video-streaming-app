export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    
    // Fix the prototype chain explicitly for custom errors in TS
    Object.setPrototypeOf(this, new.target.prototype);
    
    // Capture the stack trace (excludes the constructor call from the stack)
    Error.captureStackTrace(this, this.constructor);
  }
}

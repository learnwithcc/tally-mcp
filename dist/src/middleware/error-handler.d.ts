import { Request, Response } from 'express';
import { ErrorCategory, StructuredError } from '../server';
export interface MCPErrorResponse {
    error: {
        code: string;
        message: string;
        category: ErrorCategory;
        requestId?: string;
        timestamp: string;
        details?: Record<string, any>;
    };
}
export declare function globalErrorHandler(error: Error | StructuredError, req: Request, res: Response, _next: Function): void;
export declare function asyncErrorHandler(fn: (req: Request, res: Response, next: Function) => Promise<any>): (req: Request, res: Response, next: Function) => void;
export declare function notFoundHandler(req: Request, _res: Response, next: Function): void;
export declare function setupProcessErrorHandlers(logger?: (level: string, message: string, error?: Error) => void): void;
//# sourceMappingURL=error-handler.d.ts.map
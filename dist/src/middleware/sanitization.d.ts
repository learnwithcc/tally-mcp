import { Request, Response, NextFunction } from 'express';
import { SanitizationOptions } from '../utils/input-sanitizer';
export interface SanitizationMiddlewareOptions {
    bodyOptions?: SanitizationOptions;
    queryOptions?: SanitizationOptions;
    paramsOptions?: SanitizationOptions;
    skipRoutes?: RegExp[];
    customSanitizers?: Record<string, (value: any) => any>;
}
export declare function createSanitizationMiddleware(options?: SanitizationMiddlewareOptions): (req: Request, res: Response, next: NextFunction) => void;
export declare const SanitizationMiddleware: {
    apiParams: (req: Request, res: Response, next: NextFunction) => void;
    formInput: (req: Request, res: Response, next: NextFunction) => void;
    richText: (req: Request, res: Response, next: NextFunction) => void;
    mcpTools: (req: Request, res: Response, next: NextFunction) => void;
};
export declare const ManualSanitization: {
    formData: (data: Record<string, any>) => Record<string, any>;
    apiResponse: (data: Record<string, any>) => Record<string, any>;
    userProfile: (data: Record<string, any>) => Record<string, any>;
    logMessage: (message: string) => string;
};
//# sourceMappingURL=sanitization.d.ts.map
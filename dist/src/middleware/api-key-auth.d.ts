import { Request, Response, NextFunction } from 'express';
import { ApiKeyScope } from '../models/api-key';
export interface AuthenticatedRequest extends Request {
    apiKey?: {
        id: string;
        name: string;
        scopes: ApiKeyScope[];
        usageCount: number;
        remainingUsage?: number;
        expiresIn?: number;
    };
}
export interface ApiKeyAuthOptions {
    requiredScopes?: ApiKeyScope[];
    optional?: boolean;
    errorMessages?: {
        missing?: string;
        invalid?: string;
        insufficientScopes?: string;
        expired?: string;
        revoked?: string;
        usageLimitExceeded?: string;
        ipNotWhitelisted?: string;
    };
    headerName?: string;
    logAttempts?: boolean;
}
export declare function apiKeyAuth(options?: ApiKeyAuthOptions): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireScopes: (scopes: ApiKeyScope[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireReadAccess: () => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireWriteAccess: () => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireAdminAccess: () => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireFormsReadAccess: () => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireFormsWriteAccess: () => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireSubmissionsReadAccess: () => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireSubmissionsWriteAccess: () => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalApiKeyAuth: () => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare function isAuthenticated(req: Request): boolean;
export declare function getApiKeyInfo(req: Request): AuthenticatedRequest['apiKey'] | undefined;
//# sourceMappingURL=api-key-auth.d.ts.map
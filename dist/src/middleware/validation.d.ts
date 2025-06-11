import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
interface ValidationError {
    field: string;
    message: string;
    code: string;
    value?: any;
}
export interface ValidationOptions {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
    headers?: ZodSchema;
    stripUnknown?: boolean;
    partial?: boolean;
    errorMessage?: string;
    securityChecks?: boolean;
    sanitize?: boolean;
}
export declare const CommonSchemas: {
    pagination: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        offset: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        offset?: number | undefined;
    }, {
        page?: number | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
    }>;
    formId: z.ZodObject<{
        formId: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        formId: string;
    }, {
        formId: string;
    }>;
    workspaceId: z.ZodObject<{
        workspaceId: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        workspaceId: string;
    }, {
        workspaceId: string;
    }>;
    userId: z.ZodObject<{
        userId: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
    }, {
        userId: string;
    }>;
    submissionId: z.ZodObject<{
        submissionId: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        submissionId: string;
    }, {
        submissionId: string;
    }>;
    dateRange: z.ZodEffects<z.ZodObject<{
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
        timezone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        startDate?: string | undefined;
        endDate?: string | undefined;
        timezone?: string | undefined;
    }, {
        startDate?: string | undefined;
        endDate?: string | undefined;
        timezone?: string | undefined;
    }>, {
        startDate?: string | undefined;
        endDate?: string | undefined;
        timezone?: string | undefined;
    }, {
        startDate?: string | undefined;
        endDate?: string | undefined;
        timezone?: string | undefined;
    }>;
    fileUpload: z.ZodObject<{
        filename: z.ZodString;
        mimetype: z.ZodEffects<z.ZodString, string, string>;
        size: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        size: number;
        filename: string;
        mimetype: string;
    }, {
        size: number;
        filename: string;
        mimetype: string;
    }>;
    apiKey: z.ZodObject<{
        apiKey: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        apiKey: string;
    }, {
        apiKey: string;
    }>;
    email: z.ZodObject<{
        email: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        email: string;
    }, {
        email: string;
    }>;
    url: z.ZodObject<{
        url: z.ZodEffects<z.ZodString, string, string>;
    }, "strip", z.ZodTypeAny, {
        url: string;
    }, {
        url: string;
    }>;
    search: z.ZodObject<{
        q: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
        fields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        sort: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        q: string;
        sort?: "asc" | "desc" | undefined;
        fields?: string[] | undefined;
    }, {
        q: string;
        sort?: "asc" | "desc" | undefined;
        fields?: string[] | undefined;
    }>;
};
export declare function createValidationMiddleware(options: ValidationOptions): (req: Request, res: Response, next: NextFunction) => void;
export declare const ValidationMiddleware: {
    pagination: (req: Request, res: Response, next: NextFunction) => void;
    formParams: (req: Request, res: Response, next: NextFunction) => void;
    workspaceParams: (req: Request, res: Response, next: NextFunction) => void;
    userParams: (req: Request, res: Response, next: NextFunction) => void;
    submissionParams: (req: Request, res: Response, next: NextFunction) => void;
    search: (req: Request, res: Response, next: NextFunction) => void;
    fileUpload: (req: Request, res: Response, next: NextFunction) => void;
    apiKey: (req: Request, res: Response, next: NextFunction) => void;
    mcpRequest: (req: Request, res: Response, next: NextFunction) => void;
};
export declare function validateWithSchema<T>(data: unknown, schema: ZodSchema<T>, options?: {
    stripUnknown?: boolean;
    partial?: boolean;
}): {
    success: true;
    data: T;
} | {
    success: false;
    errors: ValidationError[];
};
export declare function createTypedValidator<T>(schema: ZodSchema<T>): (data: unknown) => data is T;
export declare function formatValidationError(errors: ValidationError[]): {
    error: string;
    message: string;
    details: {
        field: string;
        message: string;
        code: string;
    }[];
};
export {};
//# sourceMappingURL=validation.d.ts.map
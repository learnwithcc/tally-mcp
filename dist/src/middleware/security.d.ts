import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
export declare function securityLogger(req: Request, _res: Response, next: NextFunction): void;
export declare function configureCORS(): (req: cors.CorsRequest, res: {
    statusCode?: number | undefined;
    setHeader(key: string, value: string): any;
    end(): any;
}, next: (err?: any) => any) => void;
export declare function configureSecurityHeaders(): (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
export declare function customSecurityMiddleware(req: Request, res: Response, next: NextFunction): void;
export declare function securityValidation(req: Request, res: Response, next: NextFunction): void;
export declare function applySecurityMiddleware(): (((req: cors.CorsRequest, res: {
    statusCode?: number | undefined;
    setHeader(key: string, value: string): any;
    end(): any;
}, next: (err?: any) => any) => void) | typeof securityLogger)[];
declare const _default: {
    configureCORS: typeof configureCORS;
    configureSecurityHeaders: typeof configureSecurityHeaders;
    customSecurityMiddleware: typeof customSecurityMiddleware;
    securityLogger: typeof securityLogger;
    securityValidation: typeof securityValidation;
    applySecurityMiddleware: typeof applySecurityMiddleware;
};
export default _default;
//# sourceMappingURL=security.d.ts.map
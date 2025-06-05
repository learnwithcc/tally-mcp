export interface Config {
    tally: {
        apiKey: string;
        apiBaseUrl: string;
        oauth: {
            clientId: string;
            clientSecret: string;
            redirectUri: string;
        };
    };
    server: {
        port: number;
        host: string;
        logLevel: string;
    };
    security: {
        jwtSecret: string;
        sessionSecret: string;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    development: {
        nodeEnv: string;
        debug: boolean;
    };
}
export declare const config: Config;
export declare function validateConfig(): void;
export default config;
//# sourceMappingURL=config.d.ts.map
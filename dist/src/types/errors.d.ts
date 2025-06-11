export interface StructuredErrorData {
    code: string;
    message: string;
    data?: Record<string, unknown>;
}
export declare class StructuredError extends Error {
    readonly code: string;
    readonly data: Record<string, unknown> | undefined;
    constructor({ code, message, data }: StructuredErrorData);
}
//# sourceMappingURL=errors.d.ts.map
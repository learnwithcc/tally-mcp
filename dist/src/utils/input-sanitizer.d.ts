export interface SanitizationOptions {
    allowedTags?: string[];
    allowedAttr?: string[];
    allowDataAttr?: boolean;
    allowUnknownProtocols?: boolean;
    stripAllHtml?: boolean;
    allowBasicFormatting?: boolean;
    allowLinks?: boolean;
}
export declare function sanitizeString(input: any, options?: SanitizationOptions): string;
export declare function sanitizeObject<T extends Record<string, any>>(obj: T, options?: SanitizationOptions): T;
export declare function sanitizeArray(arr: any[], options?: SanitizationOptions): any[];
export declare class InputValidator {
    static isValidId(input: string): boolean;
    static isValidEmail(input: string): boolean;
    static isValidUrl(input: string): boolean;
    static containsOnlySafeChars(input: string): boolean;
    static containsSqlInjectionPatterns(input: string): boolean;
    static containsXssPatterns(input: string): boolean;
}
export declare const SanitizationPresets: {
    readonly STRICT: {
        readonly allowBasicFormatting: false;
        readonly allowLinks: false;
        readonly stripAllHtml: true;
    };
    readonly FORM_INPUT: {
        readonly allowBasicFormatting: true;
        readonly allowLinks: false;
        readonly stripAllHtml: false;
    };
    readonly RICH_TEXT: {
        readonly allowBasicFormatting: true;
        readonly allowLinks: true;
        readonly stripAllHtml: false;
    };
    readonly API_PARAM: {
        readonly stripAllHtml: true;
        readonly allowBasicFormatting: false;
        readonly allowLinks: false;
    };
};
//# sourceMappingURL=input-sanitizer.d.ts.map
export interface SanitizationOptions {
    allowBasicFormatting?: boolean;
    allowLinks?: boolean;
    allowedTags?: string[];
    allowedAttributes?: string[];
    stripAllHtml?: boolean;
}
export declare function sanitizeString(input: string, options?: SanitizationOptions): string;
export declare function sanitizeObject<T extends Record<string, any>>(obj: T, options?: SanitizationOptions): Record<string, any>;
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
    readonly STRICT: SanitizationOptions;
    readonly FORM_INPUT: SanitizationOptions;
    readonly RICH_TEXT: SanitizationOptions;
    readonly API_PARAM: SanitizationOptions;
};
//# sourceMappingURL=input-sanitizer.d.ts.map
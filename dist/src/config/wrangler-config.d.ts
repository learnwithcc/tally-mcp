import { z } from 'zod';
declare const wranglerConfigSchema: z.ZodObject<{
    name: z.ZodString;
    compatibility_date: z.ZodString;
    node_compat: z.ZodOptional<z.ZodBoolean>;
    kv_namespaces: z.ZodOptional<z.ZodArray<z.ZodObject<{
        binding: z.ZodString;
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        binding: string;
    }, {
        id: string;
        binding: string;
    }>, "many">>;
    vars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    secrets: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    compatibility_date: string;
    node_compat?: boolean | undefined;
    kv_namespaces?: {
        id: string;
        binding: string;
    }[] | undefined;
    vars?: Record<string, string> | undefined;
    secrets?: string[] | undefined;
}, {
    name: string;
    compatibility_date: string;
    node_compat?: boolean | undefined;
    kv_namespaces?: {
        id: string;
        binding: string;
    }[] | undefined;
    vars?: Record<string, string> | undefined;
    secrets?: string[] | undefined;
}>;
export type WranglerConfig = z.infer<typeof wranglerConfigSchema>;
export declare function getWranglerConfig(path?: string): WranglerConfig;
export {};
//# sourceMappingURL=wrangler-config.d.ts.map
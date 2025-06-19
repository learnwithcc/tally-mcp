import { z } from 'zod';
const envSchema = z.object({
    TALLY_API_KEY: z.string().min(1, 'TALLY_API_KEY is required.'),
    CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
    CLOUDFLARE_API_TOKEN: z.string().optional(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});
const refinedEnvSchema = envSchema.refine((data) => {
    if (data.NODE_ENV === 'production') {
        return !!data.CLOUDFLARE_ACCOUNT_ID && !!data.CLOUDFLARE_API_TOKEN;
    }
    return true;
}, {
    message: 'CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required in production.',
    path: ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN'],
});
export const env = refinedEnvSchema.parse(process.env);
//# sourceMappingURL=env.js.map
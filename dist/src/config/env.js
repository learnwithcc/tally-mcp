import { z } from 'zod';
const envSchema = z.object({
    TALLY_API_KEY: z.string().min(1, 'TALLY_API_KEY is required.'),
    CLOUDFLARE_ACCOUNT_ID: z.string().min(1, 'CLOUDFLARE_ACCOUNT_ID is required for deployment.'),
    CLOUDFLARE_API_TOKEN: z.string().min(1, 'CLOUDFLARE_API_TOKEN is required for deployment.'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});
export const env = envSchema.parse(process.env);
//# sourceMappingURL=env.js.map
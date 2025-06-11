import { z } from 'zod';

/**
 * Define the schema for environment variables.
 * This ensures that all required environment variables are present and correctly typed.
 */
const envSchema = z.object({
  // Tally API Key - required for all environments
  TALLY_API_KEY: z.string().min(1, 'TALLY_API_KEY is required.'),

  // Cloudflare Account ID - required for deployment
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1, 'CLOUDFLARE_ACCOUNT_ID is required for deployment.'),

  // Cloudflare API Token - required for deployment
  CLOUDFLARE_API_TOKEN: z.string().min(1, 'CLOUDFLARE_API_TOKEN is required for deployment.'),

  // Node environment - determines which environment-specific variables to use
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Parse and validate the environment variables.
 * 
 * If validation fails, this will throw a ZodError with a detailed message
 * indicating which variables are missing or invalid. This will prevent the
 * application from starting with an invalid configuration.
 * 
 * For Cloudflare Workers, environment variables are accessed via `process.env`
 * during local development (from .dev.vars) and are provided by the environment
 * in production.
 */
export const env = envSchema.parse(process.env); 
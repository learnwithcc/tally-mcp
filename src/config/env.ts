import { z } from 'zod';

/**
 * Define the schema for environment variables.
 * This ensures that all required environment variables are present and correctly typed.
 */
const envSchema = z.object({
  // Tally API Key - required for all environments
  TALLY_API_KEY: z.string().min(1, 'TALLY_API_KEY is required.'),

  // Cloudflare Account ID - optional for development and test
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),

  // Cloudflare API Token - optional for development and test
  CLOUDFLARE_API_TOKEN: z.string().optional(),

  // Node environment - determines which environment-specific variables to use
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Refine the schema to make Cloudflare variables required only in production
const refinedEnvSchema = envSchema.refine(
  (data) => {
    if (data.NODE_ENV === 'production') {
      return !!data.CLOUDFLARE_ACCOUNT_ID && !!data.CLOUDFLARE_API_TOKEN;
    }
    return true;
  },
  {
    message: 'CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required in production.',
    path: ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN'],
  }
);

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
export const env = refinedEnvSchema.parse(process.env); 
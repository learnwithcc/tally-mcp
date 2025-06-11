import { z } from 'zod';
import fs from 'fs';
import toml from 'toml';
import { env } from './env';

// Zod schema for a single KV namespace binding
const kvNamespaceBindingSchema = z.object({
  binding: z.string(),
  id: z.string(),
});

// Zod schema for the main wrangler.toml configuration
const wranglerConfigSchema = z.object({
  name: z.string().min(1),
  compatibility_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Compatibility date must be in YYYY-MM-DD format.'),
  node_compat: z.boolean().optional(),
  kv_namespaces: z.array(kvNamespaceBindingSchema).optional(),
  vars: z.record(z.string()).optional(),
  // Add other wrangler.toml fields as needed
  secrets: z.array(z.string()).optional(),
});

export type WranglerConfig = z.infer<typeof wranglerConfigSchema>;

/**
 * Reads and validates the wrangler.toml file.
 *
 * @param path - The path to the wrangler.toml file.
 * @returns The parsed and validated configuration object.
 * @throws An error if the file cannot be read, parsed, or validated.
 */
export function getWranglerConfig(path: string = 'wrangler.toml'): WranglerConfig {
  let fileContent: string;

  try {
    fileContent = fs.readFileSync(path, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read wrangler.toml from ${path}: ${(error as Error).message}`);
  }

  let parsedToml: any;
  try {
    parsedToml = toml.parse(fileContent);
  } catch (error: any) {
    throw new Error(`Failed to parse wrangler.toml: ${error.message} at line ${error.line}, column ${error.column}`);
  }

  const validationResult = wranglerConfigSchema.safeParse(parsedToml);

  if (!validationResult.success) {
    throw new Error(`Invalid wrangler.toml configuration: ${validationResult.error.flatten().fieldErrors}`);
  }

  // Check for secrets defined in plaintext
  const plaintextSecrets = Object.keys(env).filter(key => 
    validationResult.data.vars && validationResult.data.vars[key]
  );

  if (plaintextSecrets.length > 0) {
    console.warn(`Warning: The following secrets are defined in plaintext in wrangler.toml: ${plaintextSecrets.join(', ')}. It is recommended to use secrets for sensitive data.`);
  }

  return validationResult.data;
} 
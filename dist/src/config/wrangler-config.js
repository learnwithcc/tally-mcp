import { z } from 'zod';
import fs from 'fs';
import toml from 'toml';
import { env } from './env';
const kvNamespaceBindingSchema = z.object({
    binding: z.string(),
    id: z.string(),
});
const wranglerConfigSchema = z.object({
    name: z.string().min(1),
    compatibility_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Compatibility date must be in YYYY-MM-DD format.'),
    node_compat: z.boolean().optional(),
    kv_namespaces: z.array(kvNamespaceBindingSchema).optional(),
    vars: z.record(z.string()).optional(),
    secrets: z.array(z.string()).optional(),
});
export function getWranglerConfig(path = 'wrangler.toml') {
    let fileContent;
    try {
        fileContent = fs.readFileSync(path, 'utf-8');
    }
    catch (error) {
        throw new Error(`Failed to read wrangler.toml from ${path}: ${error.message}`);
    }
    let parsedToml;
    try {
        parsedToml = toml.parse(fileContent);
    }
    catch (error) {
        throw new Error(`Failed to parse wrangler.toml: ${error.message} at line ${error.line}, column ${error.column}`);
    }
    const validationResult = wranglerConfigSchema.safeParse(parsedToml);
    if (!validationResult.success) {
        throw new Error(`Invalid wrangler.toml configuration: ${validationResult.error.flatten().fieldErrors}`);
    }
    const plaintextSecrets = Object.keys(env).filter(key => validationResult.data.vars && validationResult.data.vars[key]);
    if (plaintextSecrets.length > 0) {
        console.warn(`Warning: The following secrets are defined in plaintext in wrangler.toml: ${plaintextSecrets.join(', ')}. It is recommended to use secrets for sensitive data.`);
    }
    return validationResult.data;
}
//# sourceMappingURL=wrangler-config.js.map
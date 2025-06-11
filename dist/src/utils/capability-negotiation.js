import { DEFAULT_SERVER_CAPABILITIES } from '../types/capabilities';
import { StructuredError } from '../types/errors';
function areVersionsCompatible(serverVersion, clientVersion) {
    return serverVersion === clientVersion;
}
export function negotiateCapabilities(clientCapabilities) {
    const negotiatedCapabilities = {
        protocolVersion: DEFAULT_SERVER_CAPABILITIES.protocolVersion
    };
    if (!clientCapabilities) {
        if (DEFAULT_SERVER_CAPABILITIES.tools) {
            negotiatedCapabilities.tools = { ...DEFAULT_SERVER_CAPABILITIES.tools };
        }
        if (DEFAULT_SERVER_CAPABILITIES.resources) {
            negotiatedCapabilities.resources = { ...DEFAULT_SERVER_CAPABILITIES.resources };
        }
        if (DEFAULT_SERVER_CAPABILITIES.prompts) {
            negotiatedCapabilities.prompts = { ...DEFAULT_SERVER_CAPABILITIES.prompts };
        }
        if (DEFAULT_SERVER_CAPABILITIES.logging) {
            negotiatedCapabilities.logging = { ...DEFAULT_SERVER_CAPABILITIES.logging };
        }
        return negotiatedCapabilities;
    }
    if (!areVersionsCompatible(DEFAULT_SERVER_CAPABILITIES.protocolVersion, clientCapabilities.protocolVersion)) {
        throw new StructuredError({
            code: 'INCOMPATIBLE_PROTOCOL_VERSION',
            message: `Protocol version mismatch. Server: ${DEFAULT_SERVER_CAPABILITIES.protocolVersion}, Client: ${clientCapabilities.protocolVersion}`,
            data: {
                serverVersion: DEFAULT_SERVER_CAPABILITIES.protocolVersion,
                clientVersion: clientCapabilities.protocolVersion
            }
        });
    }
    if (clientCapabilities.tools && DEFAULT_SERVER_CAPABILITIES.tools) {
        negotiatedCapabilities.tools = {
            call: clientCapabilities.tools.call ?? DEFAULT_SERVER_CAPABILITIES.tools.call ?? false,
            list: clientCapabilities.tools.list ?? DEFAULT_SERVER_CAPABILITIES.tools.list ?? false,
            listChanged: clientCapabilities.tools.listChanged ?? DEFAULT_SERVER_CAPABILITIES.tools.listChanged ?? false,
            subscribe: clientCapabilities.tools.subscribe ?? DEFAULT_SERVER_CAPABILITIES.tools.subscribe ?? false
        };
    }
    if (clientCapabilities.resources && DEFAULT_SERVER_CAPABILITIES.resources) {
        negotiatedCapabilities.resources = {
            get: clientCapabilities.resources.get ?? DEFAULT_SERVER_CAPABILITIES.resources.get ?? false,
            put: clientCapabilities.resources.put ?? DEFAULT_SERVER_CAPABILITIES.resources.put ?? false,
            delete: clientCapabilities.resources.delete ?? DEFAULT_SERVER_CAPABILITIES.resources.delete ?? false,
            listChanged: clientCapabilities.resources.listChanged ?? DEFAULT_SERVER_CAPABILITIES.resources.listChanged ?? false,
            subscribe: clientCapabilities.resources.subscribe ?? DEFAULT_SERVER_CAPABILITIES.resources.subscribe ?? false
        };
    }
    if (clientCapabilities.prompts && DEFAULT_SERVER_CAPABILITIES.prompts) {
        negotiatedCapabilities.prompts = {
            get: clientCapabilities.prompts.get ?? DEFAULT_SERVER_CAPABILITIES.prompts.get ?? false,
            list: clientCapabilities.prompts.list ?? DEFAULT_SERVER_CAPABILITIES.prompts.list ?? false,
            listChanged: clientCapabilities.prompts.listChanged ?? DEFAULT_SERVER_CAPABILITIES.prompts.listChanged ?? false,
            subscribe: clientCapabilities.prompts.subscribe ?? DEFAULT_SERVER_CAPABILITIES.prompts.subscribe ?? false
        };
    }
    if (clientCapabilities.logging && DEFAULT_SERVER_CAPABILITIES.logging) {
        negotiatedCapabilities.logging = {
            level: clientCapabilities.logging.level ?? DEFAULT_SERVER_CAPABILITIES.logging.level ?? 'info',
            subscribe: clientCapabilities.logging.subscribe ?? DEFAULT_SERVER_CAPABILITIES.logging.subscribe ?? false
        };
    }
    return negotiatedCapabilities;
}
export function validateClientCapabilities(capabilities) {
    if (!capabilities || typeof capabilities !== 'object') {
        return false;
    }
    const capObj = capabilities;
    const validCategories = ['tools', 'resources', 'prompts', 'logging'];
    const hasInvalidCategory = Object.keys(capObj).some(key => !validCategories.includes(key));
    if (hasInvalidCategory) {
        return false;
    }
    if (capObj.tools && typeof capObj.tools !== 'object') {
        return false;
    }
    if (capObj.resources && typeof capObj.resources !== 'object') {
        return false;
    }
    if (capObj.prompts && typeof capObj.prompts !== 'object') {
        return false;
    }
    if (capObj.logging) {
        if (typeof capObj.logging !== 'object') {
            return false;
        }
        const logging = capObj.logging;
        if (logging.level && !['debug', 'info', 'warn', 'error'].includes(logging.level)) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=capability-negotiation.js.map
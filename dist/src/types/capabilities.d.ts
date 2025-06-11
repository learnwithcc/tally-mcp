interface BaseCapability {
    listChanged?: boolean;
    subscribe?: boolean;
}
interface ToolsCapability extends BaseCapability {
    call?: boolean;
    list?: boolean;
}
interface ResourcesCapability extends BaseCapability {
    get?: boolean;
    put?: boolean;
    delete?: boolean;
}
interface PromptsCapability extends BaseCapability {
    get?: boolean;
    list?: boolean;
}
interface LoggingCapability {
    level?: 'debug' | 'info' | 'warn' | 'error';
    subscribe?: boolean;
}
export interface ServerCapabilities {
    protocolVersion: string;
    tools?: ToolsCapability;
    resources?: ResourcesCapability;
    prompts?: PromptsCapability;
    logging?: LoggingCapability;
}
export interface ClientCapabilities {
    protocolVersion: string;
    tools?: Partial<ToolsCapability>;
    resources?: Partial<ResourcesCapability>;
    prompts?: Partial<PromptsCapability>;
    logging?: Partial<LoggingCapability>;
}
export interface NegotiatedCapabilities {
    protocolVersion: string;
    tools?: ToolsCapability;
    resources?: ResourcesCapability;
    prompts?: PromptsCapability;
    logging?: LoggingCapability;
}
export declare const DEFAULT_SERVER_CAPABILITIES: ServerCapabilities;
export {};
//# sourceMappingURL=capabilities.d.ts.map
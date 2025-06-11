export const DEFAULT_SERVER_CAPABILITIES = {
    protocolVersion: '2024-11-05',
    tools: {
        call: true,
        list: true,
        listChanged: true,
        subscribe: true
    },
    resources: {
        get: true,
        put: true,
        delete: true,
        listChanged: true,
        subscribe: true
    },
    prompts: {
        get: true,
        list: true,
        listChanged: true,
        subscribe: true
    },
    logging: {
        level: 'info',
        subscribe: true
    }
};
//# sourceMappingURL=capabilities.js.map
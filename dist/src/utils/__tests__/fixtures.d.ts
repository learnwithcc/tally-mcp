export declare const dangerousStrings: {
    scriptTag: string;
    javascriptProtocol: string;
    eventHandler: string;
    iframeTag: string;
    unclosedTag: string;
};
export declare const safeStrings: {
    plainText: string;
    withFormatting: string;
    withLinks: string;
    textWithNumbers: string;
};
export declare const cryptoTestData: {
    shortText: string;
    longText: string;
    objectToEncrypt: {
        id: string;
        name: string;
        permissions: string[];
    };
};
export declare const temporaryTokenTestCases: ({
    description: string;
    payload: {
        userId: string;
    };
    durationSeconds: number;
    expectedValid: boolean;
    secret?: never;
} | {
    description: string;
    payload: {
        userId: string;
    };
    durationSeconds: number;
    secret: string;
    expectedValid: boolean;
})[];
export declare const getMockClientCapabilities: (overrides?: {}) => {
    tools: {
        list: boolean;
        execute: boolean;
        versions: string[];
    };
    authentication: {
        supported: string[];
        required: boolean;
    };
};
export declare const capabilityNegotiationTestCases: ({
    description: string;
    clientCaps: {
        tools: {
            list: boolean;
            execute: boolean;
            versions: string[];
        };
        authentication: {
            supported: string[];
            required: boolean;
        };
    };
    expected: {
        negotiated: boolean;
        authentication: {
            scheme: string;
            required: boolean;
        };
        tools: {
            version: string;
        };
        reason?: never;
    };
} | {
    description: string;
    clientCaps: {
        tools: {
            list: boolean;
            execute: boolean;
            versions: string[];
        };
        authentication: {
            supported: string[];
            required: boolean;
        };
    };
    expected: {
        negotiated: boolean;
        reason: string;
        authentication?: never;
        tools?: never;
    };
})[];
//# sourceMappingURL=fixtures.d.ts.map
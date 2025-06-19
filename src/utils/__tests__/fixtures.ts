export const dangerousStrings = {
  scriptTag: '<script>alert("XSS")</script>',
  javascriptProtocol: '<a href="javascript:alert(\'XSS\')">Click me</a>',
  eventHandler: '<img src="x" onerror="alert(\'XSS\');">',
  iframeTag: '<iframe src="http://example.com"></iframe>',
  unclosedTag: '<b>hello',
};

export const safeStrings = {
  plainText: 'This is a safe string.',
  withFormatting: '<b>This is bold</b> and <i>this is italic</i>.',
  withLinks: '<a href="https://example.com" title="Example">Example Link</a>',
  textWithNumbers: 'Here are some numbers 12345',
};

export const cryptoTestData = {
  shortText: 'Hello, World!',
  longText: 'This is a longer piece of text that will be used for testing encryption and decryption functions to ensure they work correctly with larger data blocks.',
  objectToEncrypt: {
    id: 'user-123',
    name: 'John Doe',
    permissions: ['read', 'write'],
  },
};

export const temporaryTokenTestCases = [
  {
    description: 'should generate and validate a standard token',
    payload: { userId: 'abc' },
    durationSeconds: 60,
    expectedValid: true,
  },
  {
    description: 'should fail validation for an expired token',
    payload: { userId: 'def' },
    durationSeconds: -1, 
    expectedValid: false,
  },
  {
    description: 'should fail validation for a token with wrong secret',
    payload: { userId: 'ghi' },
    durationSeconds: 60,
    secret: 'wrong-secret',
    expectedValid: false,
  },
];

export const getMockClientCapabilities = (overrides = {}) => ({
  tools: {
    list: true,
    execute: true,
    versions: ['1.0', '2.0-alpha'],
  },
  authentication: {
    supported: ['oauth2', 'apiKey'],
    required: true,
  },
  ...overrides,
});

export const capabilityNegotiationTestCases = [
  {
    description: 'should accept client with exact same capabilities',
    clientCaps: getMockClientCapabilities(),
    expected: {
      negotiated: true,
      authentication: { scheme: 'apiKey', required: true },
      tools: { version: '1.0' },
    },
  },
  {
    description: 'should reject client with unsupported auth',
    clientCaps: getMockClientCapabilities({ authentication: { supported: ['none'] } }),
    expected: {
      negotiated: false,
      reason: 'No common authentication method found. Server supports: oauth2, apiKey. Client supports: none.',
    },
  },
  {
    description: 'should select highest common tool version',
    clientCaps: getMockClientCapabilities({ tools: { versions: ['0.5', '1.0', '1.5-beta'] } }),
    expected: {
      negotiated: true,
      authentication: { scheme: 'apiKey', required: true },
      tools: { version: '1.0' },
    },
  },
]; 
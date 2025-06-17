import { negotiateCapabilities, validateClientCapabilities } from '../capability-negotiation';
import { DEFAULT_SERVER_CAPABILITIES } from '../../types/capabilities';
import { StructuredError } from '../../types/errors';
import { capabilityNegotiationTestCases, getMockClientCapabilities } from './fixtures';
describe('Capability Negotiation', () => {
    describe('negotiateCapabilities', () => {
        it('should return server defaults when no client capabilities are provided', () => {
            const negotiated = negotiateCapabilities();
            expect(negotiated).toEqual(DEFAULT_SERVER_CAPABILITIES);
        });
        it('should throw an error for incompatible protocol versions', () => {
            const clientCaps = {
                protocolVersion: '0.1.0',
            };
            expect(() => negotiateCapabilities(clientCaps)).toThrow(StructuredError);
            try {
                negotiateCapabilities(clientCaps);
            }
            catch (e) {
                const error = e;
                expect(error.code).toBe('INCOMPATIBLE_PROTOCOL_VERSION');
                expect(error.data).toEqual({
                    serverVersion: DEFAULT_SERVER_CAPABILITIES.protocolVersion,
                    clientVersion: clientCaps.protocolVersion,
                });
                expect(error).toMatchSnapshot();
            }
        });
        test.each(capabilityNegotiationTestCases)('$description', ({ clientCaps, expected }) => {
            const negotiated = negotiateCapabilities(clientCaps);
            expect(negotiated).toEqual(expected);
        });
        it('should use server default when a client capability is not specified', () => {
            const clientCaps = getMockClientCapabilities({
                tools: {},
            });
            const negotiated = negotiateCapabilities(clientCaps);
            expect(negotiated.tools?.call).toBe(DEFAULT_SERVER_CAPABILITIES.tools?.call);
            expect(negotiated).toMatchSnapshot();
        });
    });
    describe('validateClientCapabilities', () => {
        const validCases = [
            ['full capabilities', { tools: { call: true }, logging: { level: 'warn', subscribe: false } }],
            ['partial capabilities', { tools: { call: true } }],
            ['empty capabilities', {}],
        ];
        test.each(validCases)('should return true for valid capabilities: %s', (_, caps) => {
            expect(validateClientCapabilities(caps)).toBe(true);
        });
        const invalidCases = [
            ['null', null],
            ['string', 'string'],
            ['number', 123],
            ['unknown category', { unknownCategory: { read: true } }],
            ['category not an object', { tools: 'not-an-object' }],
            ['invalid logging level', { logging: { level: 'invalid-level' } }],
        ];
        test.each(invalidCases)('should return false for invalid capabilities: %s', (_, caps) => {
            expect(validateClientCapabilities(caps)).toBe(false);
        });
    });
});
//# sourceMappingURL=capability-negotiation.test.js.map
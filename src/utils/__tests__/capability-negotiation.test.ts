import { negotiateCapabilities, validateClientCapabilities } from '../capability-negotiation';
import { ClientCapabilities, DEFAULT_SERVER_CAPABILITIES } from '../../types/capabilities';
import { StructuredError } from '../../types/errors';
import { capabilityNegotiationTestCases, getMockClientCapabilities } from './fixtures';

describe('Capability Negotiation', () => {

  describe('negotiateCapabilities', () => {
    
    it('should return server defaults when no client capabilities are provided', () => {
      const negotiated = negotiateCapabilities();
      expect(negotiated).toEqual(DEFAULT_SERVER_CAPABILITIES);
    });

    it('should throw an error for incompatible protocol versions', () => {
      const clientCaps: ClientCapabilities = {
        protocolVersion: '0.1.0', // Different from server default
      };
      expect(() => negotiateCapabilities(clientCaps)).toThrow(StructuredError);
      try {
        negotiateCapabilities(clientCaps);
      } catch (e) {
        const error = e as StructuredError;
        expect(error.code).toBe('INCOMPATIBLE_PROTOCOL_VERSION');
        expect(error.data).toEqual({
          serverVersion: DEFAULT_SERVER_CAPABILITIES.protocolVersion,
          clientVersion: clientCaps.protocolVersion,
        });
        expect(error).toMatchSnapshot();
      }
    });

    test.each(capabilityNegotiationTestCases)(
      '$description',
      ({ clientCaps, expected }) => {
        const negotiated = negotiateCapabilities(clientCaps);
        expect(negotiated).toEqual(expected);
      },
    );

    it('should use server default when a client capability is not specified', () => {
      const clientCaps: ClientCapabilities = getMockClientCapabilities({
        tools: {}, // Providing the category but not the specific capability
      });

      const negotiated = negotiateCapabilities(clientCaps);
      // It should fallback to the server's default for 'call'
      expect(negotiated.tools?.call).toBe(DEFAULT_SERVER_CAPABILITIES.tools?.call);
      expect(negotiated).toMatchSnapshot();
    });

  });

  describe('validateClientCapabilities', () => {
    
    const validCases: [string, object][] = [
      ['full capabilities', { tools: { call: true }, logging: { level: 'warn', subscribe: false } }],
      ['partial capabilities', { tools: { call: true } }],
      ['empty capabilities', {}],
    ];

    test.each(validCases)('should return true for valid capabilities: %s', (_, caps) => {
      expect(validateClientCapabilities(caps)).toBe(true);
    });

    const invalidCases: [string, unknown][] = [
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
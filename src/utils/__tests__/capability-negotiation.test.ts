import { negotiateCapabilities, validateClientCapabilities } from '../capability-negotiation';
import { ClientCapabilities, DEFAULT_SERVER_CAPABILITIES, NegotiatedCapabilities } from '../../types/capabilities';
import { StructuredError } from '../../types/errors';

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
      }
    });

    it('should successfully negotiate capabilities when versions match', () => {
      const clientCaps: ClientCapabilities = {
        protocolVersion: DEFAULT_SERVER_CAPABILITIES.protocolVersion,
        tools: { call: true, list: false },
        logging: { level: 'debug' },
      };
      
      const negotiated = negotiateCapabilities(clientCaps);
      
      // Check negotiated protocol version
      expect(negotiated.protocolVersion).toBe(DEFAULT_SERVER_CAPABILITIES.protocolVersion);

      // Check negotiated tools (client specified)
      expect(negotiated.tools?.call).toBe(true);
      expect(negotiated.tools?.list).toBe(false);
      // Check a tool capability the client didn't specify (should be server default)
      expect(negotiated.tools?.subscribe).toBe(DEFAULT_SERVER_CAPABILITIES.tools?.subscribe);

      // Check negotiated logging (client specified)
      expect(negotiated.logging?.level).toBe('debug');

      // Check resources (client didn't specify, should be server default)
      expect(negotiated.resources).toEqual(DEFAULT_SERVER_CAPABILITIES.resources);
    });

    it('should use server default when a client capability is not specified', () => {
        const clientCaps: ClientCapabilities = {
            protocolVersion: DEFAULT_SERVER_CAPABILITIES.protocolVersion,
            tools: {} // Providing the category but not the specific capability
        };

        const negotiated = negotiateCapabilities(clientCaps);
        // It should fallback to the server's default for 'call'
        expect(negotiated.tools?.call).toBe(DEFAULT_SERVER_CAPABILITIES.tools?.call);
    });

  });

  describe('validateClientCapabilities', () => {
    
    it('should return true for valid client capabilities', () => {
      const validCaps: Partial<ClientCapabilities> = {
        tools: { call: true },
        logging: { level: 'warn', subscribe: false },
      };
      expect(validateClientCapabilities(validCaps)).toBe(true);
    });

    it('should return false for non-object capabilities', () => {
      expect(validateClientCapabilities(null)).toBe(false);
      expect(validateClientCapabilities('string')).toBe(false);
      expect(validateClientCapabilities(123)).toBe(false);
    });

    it('should return false for an unknown capability category', () => {
      const invalidCaps = {
        unknownCategory: { read: true },
      };
      expect(validateClientCapabilities(invalidCaps)).toBe(false);
    });

    it('should return false if a capability category is not an object', () => {
      const invalidCaps = {
        tools: 'not-an-object',
      };
      expect(validateClientCapabilities(invalidCaps)).toBe(false);
    });

    it('should return false for an invalid logging level', () => {
      const invalidCaps = {
        logging: { level: 'invalid-level' },
      };
      expect(validateClientCapabilities(invalidCaps)).toBe(false);
    });

    it('should return true for valid capabilities with missing categories', () => {
        const validCaps: Partial<ClientCapabilities> = {
          tools: { call: true },
        };
        expect(validateClientCapabilities(validCaps)).toBe(true);
    });

  });
}); 
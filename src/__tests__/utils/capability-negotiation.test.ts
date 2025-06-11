import { negotiateCapabilities } from '../../utils/capability-negotiation';
import { ClientCapabilities, DEFAULT_SERVER_CAPABILITIES } from '../../types/capabilities';
import { StructuredError } from '../../types/errors';

describe('capability-negotiation', () => {
  describe('negotiateCapabilities', () => {
    it('should return server defaults when no client capabilities provided', () => {
      const result = negotiateCapabilities();
      expect(result).toEqual(DEFAULT_SERVER_CAPABILITIES);
    });

    it('should throw StructuredError on protocol version mismatch', () => {
      const clientCapabilities: ClientCapabilities = {
        protocolVersion: '2024-11-04', // Different version
        tools: {
          call: true,
          list: true
        }
      };

      expect(() => negotiateCapabilities(clientCapabilities)).toThrow(StructuredError);
      expect(() => negotiateCapabilities(clientCapabilities)).toThrow('Protocol version mismatch');

      try {
        negotiateCapabilities(clientCapabilities);
      } catch (error) {
        if (error instanceof StructuredError) {
          expect(error.code).toBe('INCOMPATIBLE_PROTOCOL_VERSION');
          expect(error.data).toEqual({
            serverVersion: DEFAULT_SERVER_CAPABILITIES.protocolVersion,
            clientVersion: '2024-11-04'
          });
        } else {
          throw error; // Re-throw if it's not a StructuredError
        }
      }
    });

    it('should negotiate tools capabilities correctly', () => {
      const clientCapabilities: ClientCapabilities = {
        protocolVersion: DEFAULT_SERVER_CAPABILITIES.protocolVersion,
        tools: {
          call: true,
          list: false,
          listChanged: true,
          subscribe: false
        }
      };

      const result = negotiateCapabilities(clientCapabilities);
      expect(result.tools).toEqual({
        call: true,
        list: false,
        listChanged: true,
        subscribe: false
      });
    });

    it('should negotiate resources capabilities correctly', () => {
      const clientCapabilities: ClientCapabilities = {
        protocolVersion: DEFAULT_SERVER_CAPABILITIES.protocolVersion,
        resources: {
          get: true,
          put: false,
          delete: true,
          listChanged: false,
          subscribe: true
        }
      };

      const result = negotiateCapabilities(clientCapabilities);
      expect(result.resources).toEqual({
        get: true,
        put: false,
        delete: true,
        listChanged: false,
        subscribe: true
      });
    });

    it('should negotiate prompts capabilities correctly', () => {
      const clientCapabilities: ClientCapabilities = {
        protocolVersion: DEFAULT_SERVER_CAPABILITIES.protocolVersion,
        prompts: {
          get: false,
          list: true,
          listChanged: true,
          subscribe: false
        }
      };

      const result = negotiateCapabilities(clientCapabilities);
      expect(result.prompts).toEqual({
        get: false,
        list: true,
        listChanged: true,
        subscribe: false
      });
    });

    it('should negotiate logging capabilities correctly', () => {
      const clientCapabilities: ClientCapabilities = {
        protocolVersion: DEFAULT_SERVER_CAPABILITIES.protocolVersion,
        logging: {
          level: 'debug',
          subscribe: true
        }
      };

      const result = negotiateCapabilities(clientCapabilities);
      expect(result.logging).toEqual({
        level: 'debug',
        subscribe: true
      });
    });

    it('should handle partial client capabilities', () => {
      const clientCapabilities: ClientCapabilities = {
        protocolVersion: DEFAULT_SERVER_CAPABILITIES.protocolVersion,
        tools: {
          call: true
        },
        resources: {
          get: false
        }
      };

      const result = negotiateCapabilities(clientCapabilities);
      
      // Tools: only call is true, rest inherit from server defaults
      expect(result.tools?.call).toBe(true);
      expect(result.tools?.list).toBe(DEFAULT_SERVER_CAPABILITIES.tools?.list);
      expect(result.tools?.listChanged).toBe(DEFAULT_SERVER_CAPABILITIES.tools?.listChanged);
      expect(result.tools?.subscribe).toBe(DEFAULT_SERVER_CAPABILITIES.tools?.subscribe);

      // Resources: only get is false, rest inherit from server defaults
      expect(result.resources?.get).toBe(false);
      expect(result.resources?.put).toBe(DEFAULT_SERVER_CAPABILITIES.resources?.put);
      expect(result.resources?.delete).toBe(DEFAULT_SERVER_CAPABILITIES.resources?.delete);
      expect(result.resources?.listChanged).toBe(DEFAULT_SERVER_CAPABILITIES.resources?.listChanged);
      expect(result.resources?.subscribe).toBe(DEFAULT_SERVER_CAPABILITIES.resources?.subscribe);

      // Prompts and logging should inherit server defaults
      expect(result.prompts).toEqual(DEFAULT_SERVER_CAPABILITIES.prompts);
      expect(result.logging).toEqual(DEFAULT_SERVER_CAPABILITIES.logging);
    });

    it('should handle all capabilities disabled by client', () => {
      const clientCapabilities: ClientCapabilities = {
        protocolVersion: DEFAULT_SERVER_CAPABILITIES.protocolVersion,
        tools: {
          call: false,
          list: false,
          listChanged: false,
          subscribe: false
        },
        resources: {
          get: false,
          put: false,
          delete: false,
          listChanged: false,
          subscribe: false
        },
        prompts: {
          get: false,
          list: false,
          listChanged: false,
          subscribe: false
        },
        logging: {
          level: 'error',
          subscribe: false
        }
      };

      const result = negotiateCapabilities(clientCapabilities);
      
      expect(result.tools).toEqual({
        call: false,
        list: false,
        listChanged: false,
        subscribe: false
      });

      expect(result.resources).toEqual({
        get: false,
        put: false,
        delete: false,
        listChanged: false,
        subscribe: false
      });

      expect(result.prompts).toEqual({
        get: false,
        list: false,
        listChanged: false,
        subscribe: false
      });

      expect(result.logging).toEqual({
        level: 'error',
        subscribe: false
      });
    });
  });
}); 
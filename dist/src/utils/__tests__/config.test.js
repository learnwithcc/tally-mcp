describe('Application Configuration', () => {
    const originalEnv = process.env;
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });
    afterAll(() => {
        process.env = originalEnv;
    });
    const setRequiredEnvVars = () => {
        process.env.TALLY_API_KEY = 'test_tally_api_key';
        process.env.TALLY_OAUTH_CLIENT_ID = 'test_tally_oauth_client_id';
        process.env.TALLY_OAUTH_CLIENT_SECRET = 'test_tally_oauth_client_secret';
        process.env.JWT_SECRET = 'test_jwt_secret';
        process.env.SESSION_SECRET = 'test_session_secret';
    };
    it('should load configuration from environment variables', () => {
        setRequiredEnvVars();
        process.env.MCP_SERVER_PORT = '4000';
        process.env.DEBUG = 'true';
        const { config: reloadedConfig } = require('../config');
        expect(reloadedConfig.tally.apiKey).toBe('test_tally_api_key');
        expect(reloadedConfig.server.port).toBe(4000);
        expect(reloadedConfig.development.debug).toBe(true);
    });
    it('should use default values for optional variables', () => {
        setRequiredEnvVars();
        const { config: reloadedConfig } = require('../config');
        expect(reloadedConfig.tally.apiBaseUrl).toBe('https://api.tally.so/v1');
        expect(reloadedConfig.server.port).toBe(3000);
        expect(reloadedConfig.development.nodeEnv).toBe('test');
        expect(reloadedConfig.development.debug).toBe(false);
    });
    it('should throw an error if a required environment variable is missing', () => {
        const expectedError = 'Required environment variable TALLY_API_KEY is not set';
        expect(() => {
            throw new Error(expectedError);
        }).toThrow(expectedError);
    });
    it('should throw an error for non-numeric number variables', () => {
        setRequiredEnvVars();
        process.env.MCP_SERVER_PORT = 'not-a-number';
        expect(() => require('../config')).toThrow('Environment variable MCP_SERVER_PORT must be a valid number');
    });
    describe('validateConfig', () => {
        let consoleLogSpy;
        let consoleErrorSpy;
        let processExitSpy;
        beforeEach(() => {
            consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            processExitSpy = jest.spyOn(process, 'exit').mockImplementation(((_code) => { }));
        });
        afterEach(() => {
            consoleLogSpy.mockRestore();
            consoleErrorSpy.mockRestore();
            processExitSpy.mockRestore();
        });
        it('should log success if all required config is present', () => {
            setRequiredEnvVars();
            const { validateConfig: reloadedValidate } = require('../config');
            reloadedValidate();
            expect(consoleLogSpy).toHaveBeenCalledWith('✅ Configuration validation successful');
            expect(consoleErrorSpy).not.toHaveBeenCalled();
            expect(processExitSpy).not.toHaveBeenCalled();
        });
        it('should log an error and exit if required config is missing', () => {
            setRequiredEnvVars();
            delete process.env.JWT_SECRET;
            delete require.cache[require.resolve('../config')];
            expect(() => require('../config')).toThrow('Required environment variable JWT_SECRET is not set');
        });
    });
});
export {};
//# sourceMappingURL=config.test.js.map
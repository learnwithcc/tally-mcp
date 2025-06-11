import { TallyApiClient } from '../../services/TallyApiClient';
import { env } from '../../config/env';
import { AuthenticationError, NotFoundError, RateLimitError, ServerError, BadRequestError } from '../../models';
import axios from 'axios';
jest.mock('axios');
const mockedAxios = axios;
describe('Tally API Client - Error Handling', () => {
    let client;
    const setupClient = (retryConfig = {}) => {
        const mock = {
            request: jest.fn(),
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            patch: jest.fn(),
            interceptors: {
                request: { use: jest.fn(val => val), eject: jest.fn() },
                response: { use: jest.fn((res, rej) => rej), eject: jest.fn() },
            },
            defaults: { headers: { common: {} } },
        };
        mockedAxios.create.mockReturnValue(mock);
        client = new TallyApiClient({ accessToken: env.TALLY_API_KEY, retryConfig });
    };
    beforeEach(() => {
        setupClient();
    });
    const testError = async (status, expectedError) => {
        const error = { isAxiosError: true, response: { status } };
        mockedAxios.create().request.mockRejectedValue(error);
        const rej = mockedAxios.create().interceptors.response.use.mock.calls[0][1];
        await expect(rej(error)).rejects.toThrow(expectedError);
    };
    it('should handle 401 Unauthorized errors', async () => {
        await testError(401, AuthenticationError);
    });
    it('should handle 403 Forbidden errors', async () => {
        await testError(403, AuthenticationError);
    });
    it('should handle 404 Not Found errors', async () => {
        await testError(404, NotFoundError);
    });
    it('should handle 422 Unprocessable Entity errors', async () => {
        await testError(422, BadRequestError);
    });
    it('should handle 429 Rate Limit errors', async () => {
        setupClient({ maxAttempts: 0 });
        await testError(429, RateLimitError);
    });
    it('should handle 500 Server errors', async () => {
        setupClient({ maxAttempts: 0 });
        await testError(500, ServerError);
    });
});
//# sourceMappingURL=errors.test.js.map
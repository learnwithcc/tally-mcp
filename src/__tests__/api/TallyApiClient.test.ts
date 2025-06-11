import { TallyApiClient } from '../../services/TallyApiClient';
import { env } from '../../config/env';
import { AuthenticationError } from '../../models';
import axios from 'axios';

jest.mock('axios');
const mockedCreate = axios.create as jest.Mock;

describe('TallyApiClient', () => {
  let client: TallyApiClient;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    mockedCreate.mockReturnValue({ defaults: { headers: { common: {} } }, interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } } });
    client = new TallyApiClient({ accessToken: env.TALLY_API_KEY });
    expect(client).toBeDefined();
  });

  describe('Authentication', () => {
    beforeEach(() => {
      mockedCreate.mockReturnValue({ defaults: { headers: { common: {} } }, interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } } });
      client = new TallyApiClient({ accessToken: env.TALLY_API_KEY });
    });
    it('should throw an error when getting authorization URL without OAuth2 config', () => {
      expect(() => client.getAuthorizationUrl()).toThrow('OAuth 2.0 configuration is required to get authorization URL');
    });

    it('should throw an error when exchanging code for token without OAuth2 config', async () => {
      await expect(client.exchangeCodeForToken('test-code')).rejects.toThrow(AuthenticationError);
    });

    it('should be authenticated if access token is provided', async () => {
      expect(await client.isAuthenticated()).toBe(true);
    });

    it('should not be authenticated if access token is not provided', async () => {
      const unauthenticatedClient = new TallyApiClient();
      expect(await unauthenticatedClient.isAuthenticated()).toBe(false);
    });

    it('should throw an error when refreshing token without OAuth2 config', async () => {
      await expect(client.refreshToken()).rejects.toThrow('OAuth 2.0 configuration is required to refresh token');
    });

    it('should clear the access token', async () => {
      await client.clearAuthentication();
      expect(await client.isAuthenticated()).toBe(false);
    });

    it('should set the access token', () => {
      client.setAccessToken('new-token');
      expect(client.getAccessToken()).toBe('new-token');
    });

    it('should get the access token', () => {
      expect(client.getAccessToken()).toBe(env.TALLY_API_KEY);
    });

    it('should get the current token', async () => {
      const token = await client.getCurrentToken();
      expect(token).toBeNull();
    });
  });

  describe('Request Handling', () => {
    it('should handle a successful GET request', async () => {
      const responseData = { id: 'user-123', name: 'Test User' };
      const mockRequest = jest.fn().mockResolvedValue({ data: responseData, status: 200 });
      mockedCreate.mockReturnValue({ request: mockRequest, defaults: { headers: { common: {} } }, interceptors: { request: { use: jest.fn((fn) => fn) }, response: { use: jest.fn((fn) => fn) } } });

      client = new TallyApiClient({ accessToken: env.TALLY_API_KEY });
      const response = await client.get('/me');

      expect(mockRequest).toHaveBeenCalledWith({ method: 'GET', url: '/me', data: undefined });
      expect(response.status).toBe(200);
      expect(response.data).toEqual(responseData);
    });

    it('should handle a 404 Not Found error', async () => {
      const error = { isAxiosError: true, response: { status: 404, data: { message: 'Not Found' } } };
      const mockRequest = jest.fn().mockRejectedValue(error);
      const mockInterceptor = (res: any, rej: any) => { rej(error); return Promise.reject(error) };
      mockedCreate.mockReturnValue({ request: mockRequest, defaults: { headers: { common: {} } }, interceptors: { request: { use: jest.fn((fn) => fn) }, response: { use: mockInterceptor } } });

      client = new TallyApiClient({ accessToken: env.TALLY_API_KEY });
      
      await expect(client.get('/non-existent-endpoint')).rejects.toThrow('Not Found');
    });

    it('should handle a 401 Unauthorized error', async () => {
      mockedCreate.mockReturnValue({ defaults: { headers: { common: {} } }, interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } } });
      client = new TallyApiClient(); // No access token
      await expect(client.get('/me')).rejects.toThrow('No valid authentication found. Please authenticate first.');
    });
  });
}); 
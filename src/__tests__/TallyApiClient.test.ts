/**
 * Unit tests for TallyApiClient
 * Tests the base API client functionality with mocked Axios responses
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { TallyApiClient, TallyApiClientConfig, ApiResponse } from '../services/TallyApiClient';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TallyApiClient', () => {
  let client: TallyApiClient;
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create a mock axios instance
    mockAxiosInstance = {
      request: jest.fn(),
      defaults: {
        headers: {
          common: {},
        },
      },
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn(),
        },
      },
    } as any;

    // Mock axios.create to return our mock instance
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  describe('Constructor and Configuration', () => {
    it('should create a client with default configuration', () => {
      client = new TallyApiClient();

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.tally.so',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        responseType: 'json',
      });

      const config = client.getConfig();
      expect(config.baseURL).toBe('https://api.tally.so');
      expect(config.timeout).toBe(30000);
      expect(config.debug).toBe(false);
      expect(config.accessToken).toBe('');
    });

    it('should create a client with custom configuration', () => {
      const customConfig: TallyApiClientConfig = {
        baseURL: 'https://custom-api.example.com',
        timeout: 5000,
        defaultHeaders: {
          'Custom-Header': 'custom-value',
        },
        accessToken: 'test-token',
        debug: true,
      };

      client = new TallyApiClient(customConfig);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://custom-api.example.com',
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Custom-Header': 'custom-value',
        },
        responseType: 'json',
      });

      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });

    it('should not set Authorization header if no access token is provided', () => {
      client = new TallyApiClient();

      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('Access Token Management', () => {
    beforeEach(() => {
      client = new TallyApiClient();
    });

    it('should set access token and update Authorization header', () => {
      const token = 'new-access-token';
      client.setAccessToken(token);

      expect(client.getAccessToken()).toBe(token);
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
    });

    it('should remove Authorization header when setting empty token', () => {
      // First set a token
      client.setAccessToken('some-token');
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer some-token');

      // Then remove it
      client.setAccessToken('');
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
    });

    it('should return current access token', () => {
      expect(client.getAccessToken()).toBe('');

      client.setAccessToken('test-token');
      expect(client.getAccessToken()).toBe('test-token');
    });
  });

  describe('HTTP Methods', () => {
    beforeEach(() => {
      client = new TallyApiClient({ accessToken: 'test-token' });
    });

    const mockResponseData = { id: 1, name: 'Test Data' };
    const mockAxiosResponse: AxiosResponse = {
      data: mockResponseData,
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      config: {
        headers: {} as any,
      },
    };

    it('should make a GET request', async () => {
      mockAxiosInstance.request.mockResolvedValue(mockAxiosResponse);

      const response: ApiResponse = await client.get('/test-endpoint');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/test-endpoint',
        data: undefined,
      });

      expect(response).toEqual({
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
      });
    });

    it('should make a GET request with custom config', async () => {
      mockAxiosInstance.request.mockResolvedValue(mockAxiosResponse);

      const customConfig = { params: { limit: 10 } };
      await client.get('/test-endpoint', customConfig);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/test-endpoint',
        data: undefined,
        params: { limit: 10 },
      });
    });

    it('should make a POST request with data', async () => {
      mockAxiosInstance.request.mockResolvedValue(mockAxiosResponse);

      const postData = { name: 'Test Form' };
      await client.post('/forms', postData);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/forms',
        data: postData,
      });
    });

    it('should make a PUT request with data', async () => {
      mockAxiosInstance.request.mockResolvedValue(mockAxiosResponse);

      const putData = { name: 'Updated Form' };
      await client.put('/forms/123', putData);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/forms/123',
        data: putData,
      });
    });

    it('should make a DELETE request', async () => {
      mockAxiosInstance.request.mockResolvedValue(mockAxiosResponse);

      await client.delete('/forms/123');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/forms/123',
        data: undefined,
      });
    });

    it('should make a PATCH request with data', async () => {
      mockAxiosInstance.request.mockResolvedValue(mockAxiosResponse);

      const patchData = { enabled: false };
      await client.patch('/forms/123', patchData);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: '/forms/123',
        data: patchData,
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      client = new TallyApiClient({ accessToken: 'test-token' });
    });

    it('should propagate axios errors', async () => {
      const axiosError = new Error('Network Error');
      mockAxiosInstance.request.mockRejectedValue(axiosError);

      await expect(client.get('/test-endpoint')).rejects.toThrow('Network Error');
    });

    it('should propagate HTTP error responses', async () => {
      const httpError = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { error: 'Resource not found' },
        },
      };
      mockAxiosInstance.request.mockRejectedValue(httpError);

      await expect(client.get('/non-existent')).rejects.toEqual(httpError);
    });
  });

  describe('Utility Methods', () => {
    beforeEach(() => {
      client = new TallyApiClient();
    });

    it('should return the axios instance', () => {
      const axiosInstance = client.getAxiosInstance();
      expect(axiosInstance).toBe(mockAxiosInstance);
    });

    it('should return readonly configuration', () => {
      const config = client.getConfig();
      expect(config).toEqual({
        baseURL: 'https://api.tally.so',
        timeout: 30000,
        defaultHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        accessToken: '',
        debug: false,
      });

      // Verify it's readonly by attempting to modify (should not affect original)
      try {
        (config as any).baseURL = 'https://malicious.example.com';
      } catch (error) {
        // Expected in strict mode
      }

      const freshConfig = client.getConfig();
      expect(freshConfig.baseURL).toBe('https://api.tally.so');
    });
  });

  describe('Interceptors', () => {
    it('should always setup interceptors for authentication and error handling', () => {
      client = new TallyApiClient({ debug: false });

      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });

    it('should setup interceptors with debug logging when debug is enabled', () => {
      client = new TallyApiClient({ debug: true });

      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('Type Safety', () => {
    beforeEach(() => {
      client = new TallyApiClient({ accessToken: 'test-token' });
    });

    it('should maintain type safety with generic responses', async () => {
      interface TestResponse {
        id: number;
        name: string;
      }

             const mockResponse: AxiosResponse<TestResponse> = {
         data: { id: 1, name: 'Test' },
         status: 200,
         statusText: 'OK',
         headers: {},
         config: {
           headers: {} as any,
         },
       };

      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const response: ApiResponse<TestResponse> = await client.get<TestResponse>('/test');

      expect(response.data.id).toBe(1);
      expect(response.data.name).toBe('Test');
    });
  });
}); 
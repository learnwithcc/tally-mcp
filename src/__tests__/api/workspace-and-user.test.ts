import { TallyApiClient } from '../../services/TallyApiClient';
import { env } from '../../config/env';
import { TallyWorkspacesResponseSchema, TallyWorkspaceSchema } from '../../models';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Tally API Client - Workspaces and User', () => {
  let client: TallyApiClient;

  beforeEach(() => {
    const mock = {
      request: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
      defaults: { headers: { common: {} } },
    };
    mockedAxios.create.mockReturnValue(mock as any);
    client = new TallyApiClient({ accessToken: env.TALLY_API_KEY });
  });

  it('should fetch workspaces and validate the response', async () => {
    const mockWorkspacesResponse = {
      workspaces: [
        { id: 'ws1', name: 'Workspace 1', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      ],
    };
    jest.spyOn(client, 'getWorkspaces').mockResolvedValue(mockWorkspacesResponse);
    const workspaces = await client.getWorkspaces();
    expect(TallyWorkspacesResponseSchema.safeParse(workspaces).success).toBe(true);
    expect(workspaces).toEqual(mockWorkspacesResponse);
  });

  it('should fetch a single workspace and validate the response', async () => {
    const mockWorkspaceResponse = { id: 'ws1', name: 'Workspace 1', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' };
    jest.spyOn(client, 'getWorkspace').mockResolvedValue(mockWorkspaceResponse);
    const workspace = await client.getWorkspace('ws1');
    expect(TallyWorkspaceSchema.safeParse(workspace).success).toBe(true);
    expect(workspace).toEqual(mockWorkspaceResponse);
  });
}); 
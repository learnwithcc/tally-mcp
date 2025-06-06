import { TallyApiClient, TallyApiClientConfig } from './TallyApiClient';
import { TallyWorkspace, TallyWorkspacesResponse, TallyWorkspacesResponseSchema, TallyWorkspaceSchema, UserRole } from '../models';

export class WorkspaceService {
  private apiClient: TallyApiClient;

  constructor(config: TallyApiClientConfig = {}) {
    this.apiClient = new TallyApiClient(config);
  }

  public async getWorkspaces(options: { page?: number; limit?: number } = {}): Promise<TallyWorkspacesResponse> {
    return this.apiClient.getWorkspaces(options);
  }

  public async getWorkspace(workspaceId: string): Promise<TallyWorkspace> {
    return this.apiClient.getWorkspace(workspaceId);
  }

  public async inviteUser(workspaceId: string, email: string, role: UserRole): Promise<any> {
    return this.apiClient.inviteUserToWorkspace(workspaceId, email, role);
  }

  public async removeUser(workspaceId: string, userId: string): Promise<any> {
    return this.apiClient.removeUserFromWorkspace(workspaceId, userId);
  }

  public async updateUserRole(workspaceId: string, userId: string, role: UserRole): Promise<any> {
    return this.apiClient.updateUserRole(workspaceId, userId, role);
  }
} 
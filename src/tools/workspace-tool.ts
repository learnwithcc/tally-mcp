import { WorkspaceService } from '../services';
import { TallyWorkspace, TallyWorkspacesResponse, UserRole } from '../models';
import { TallyApiClientConfig } from '../services/TallyApiClient';

export class WorkspaceManagementTool {
  private workspaceService: WorkspaceService;

  constructor(apiClientConfig: TallyApiClientConfig = {}) {
    this.workspaceService = new WorkspaceService(apiClientConfig);
  }

  public async listWorkspaces(options: { page?: number; limit?: number } = {}): Promise<TallyWorkspacesResponse> {
    return this.workspaceService.getWorkspaces(options);
  }

  public async getWorkspaceDetails(workspaceId: string): Promise<TallyWorkspace> {
    return this.workspaceService.getWorkspace(workspaceId);
  }

  public async inviteUserToWorkspace(workspaceId: string, email: string, role: UserRole): Promise<any> {
    return this.workspaceService.inviteUser(workspaceId, email, role);
  }

  public async removeUserFromWorkspace(workspaceId: string, userId: string): Promise<any> {
    return this.workspaceService.removeUser(workspaceId, userId);
  }

  public async updateUserRoleInWorkspace(workspaceId: string, userId: string, role: UserRole): Promise<any> {
    return this.workspaceService.updateUserRole(workspaceId, userId, role);
  }
} 
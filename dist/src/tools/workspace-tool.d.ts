import { TallyWorkspace, TallyWorkspacesResponse, UserRole } from '../models';
import { TallyApiClientConfig } from '../services/TallyApiClient';
export declare class WorkspaceManagementTool {
    private workspaceService;
    constructor(apiClientConfig?: TallyApiClientConfig);
    listWorkspaces(options?: {
        page?: number;
        limit?: number;
    }): Promise<TallyWorkspacesResponse>;
    getWorkspaceDetails(workspaceId: string): Promise<TallyWorkspace>;
    inviteUserToWorkspace(workspaceId: string, email: string, role: UserRole): Promise<any>;
    removeUserFromWorkspace(workspaceId: string, userId: string): Promise<any>;
    updateUserRoleInWorkspace(workspaceId: string, userId: string, role: UserRole): Promise<any>;
}
//# sourceMappingURL=workspace-tool.d.ts.map
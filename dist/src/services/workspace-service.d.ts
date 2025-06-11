import { TallyApiClientConfig } from './TallyApiClient';
import { TallyWorkspace, TallyWorkspacesResponse, UserRole } from '../models';
export declare class WorkspaceService {
    private apiClient;
    constructor(config?: TallyApiClientConfig);
    getWorkspaces(options?: {
        page?: number;
        limit?: number;
    }): Promise<TallyWorkspacesResponse>;
    getWorkspace(workspaceId: string): Promise<TallyWorkspace>;
    inviteUser(workspaceId: string, email: string, role: UserRole): Promise<any>;
    removeUser(workspaceId: string, userId: string): Promise<any>;
    updateUserRole(workspaceId: string, userId: string, role: UserRole): Promise<any>;
}
//# sourceMappingURL=workspace-service.d.ts.map
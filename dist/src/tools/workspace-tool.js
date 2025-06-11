import { WorkspaceService } from '../services';
export class WorkspaceManagementTool {
    constructor(apiClientConfig = {}) {
        this.workspaceService = new WorkspaceService(apiClientConfig);
    }
    async listWorkspaces(options = {}) {
        return this.workspaceService.getWorkspaces(options);
    }
    async getWorkspaceDetails(workspaceId) {
        return this.workspaceService.getWorkspace(workspaceId);
    }
    async inviteUserToWorkspace(workspaceId, email, role) {
        return this.workspaceService.inviteUser(workspaceId, email, role);
    }
    async removeUserFromWorkspace(workspaceId, userId) {
        return this.workspaceService.removeUser(workspaceId, userId);
    }
    async updateUserRoleInWorkspace(workspaceId, userId, role) {
        return this.workspaceService.updateUserRole(workspaceId, userId, role);
    }
}
//# sourceMappingURL=workspace-tool.js.map
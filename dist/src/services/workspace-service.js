import { TallyApiClient } from './TallyApiClient';
export class WorkspaceService {
    constructor(config = {}) {
        this.apiClient = new TallyApiClient(config);
    }
    async getWorkspaces(options = {}) {
        return this.apiClient.getWorkspaces(options);
    }
    async getWorkspace(workspaceId) {
        return this.apiClient.getWorkspace(workspaceId);
    }
    async inviteUser(workspaceId, email, role) {
        return this.apiClient.inviteUserToWorkspace(workspaceId, email, role);
    }
    async removeUser(workspaceId, userId) {
        return this.apiClient.removeUserFromWorkspace(workspaceId, userId);
    }
    async updateUserRole(workspaceId, userId, role) {
        return this.apiClient.updateUserRole(workspaceId, userId, role);
    }
}
//# sourceMappingURL=workspace-service.js.map
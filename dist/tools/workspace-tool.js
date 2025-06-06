"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceManagementTool = void 0;
const services_1 = require("../services");
class WorkspaceManagementTool {
    constructor(apiClientConfig = {}) {
        this.workspaceService = new services_1.WorkspaceService(apiClientConfig);
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
exports.WorkspaceManagementTool = WorkspaceManagementTool;
//# sourceMappingURL=workspace-tool.js.map
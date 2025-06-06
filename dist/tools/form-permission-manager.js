"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormPermissionManager = void 0;
const workspace_tool_1 = require("./workspace-tool");
const form_permission_service_1 = require("../services/form-permission-service");
class FormPermissionManager {
    constructor(apiClientConfig = {}) {
        this.workspaceTool = new workspace_tool_1.WorkspaceManagementTool(apiClientConfig);
        this.permissionService = new form_permission_service_1.FormPermissionService(apiClientConfig);
    }
    async setFormPermission(formId, userId, accessLevel, inheritFromWorkspace = true, grantedBy) {
        return this.permissionService.setFormPermission(formId, userId, accessLevel, inheritFromWorkspace, grantedBy);
    }
    async updateFormPermission(formId, userId, accessLevel, inheritFromWorkspace = true) {
        return this.permissionService.updateFormPermission(formId, userId, accessLevel, inheritFromWorkspace);
    }
    async removeFormPermission(formId, userId) {
        const result = await this.permissionService.removeFormPermission(formId, userId);
        return { success: result.success || false };
    }
    async getFormPermissions(formId) {
        return this.permissionService.getFormPermissions(formId);
    }
    async setBulkFormPermissions(userId, formIds, accessLevel, inheritFromWorkspace = true) {
        const bulkPermission = {
            userId,
            formIds,
            accessLevel,
            inheritFromWorkspace,
        };
        return this.permissionService.setBulkFormPermissions(bulkPermission);
    }
    async getEffectivePermission(formId, userId, workspaceId) {
        const workspace = await this.workspaceTool.getWorkspaceDetails(workspaceId);
        const member = workspace.members?.find(m => m.id === userId);
        const workspaceRole = member?.role;
        return this.permissionService.getEffectivePermission(formId, userId, workspaceRole);
    }
    async validateAccess(formId, userId, requiredAccessLevel) {
        return this.permissionService.validateAccess(formId, userId, requiredAccessLevel);
    }
    async getUserFormAccess(workspaceId, userId, minAccessLevel = 'view') {
        return this.permissionService.getUserFormAccess(workspaceId, userId, minAccessLevel);
    }
    async getFormPermissionSettings(formId) {
        return this.permissionService.getFormPermissionSettings(formId);
    }
    async updateFormPermissionSettings(formId, settings) {
        return this.permissionService.updateFormPermissionSettings(formId, settings);
    }
    async copyFormPermissions(sourceFormId, targetFormId, includeSettings = true) {
        return this.permissionService.copyFormPermissions(sourceFormId, targetFormId, includeSettings);
    }
    async inheritWorkspacePermissions(workspaceId, userId, workspaceRole) {
        const accessLevelMap = {
            'owner': 'admin',
            'admin': 'manage',
            'member': 'view',
        };
        const accessLevel = accessLevelMap[workspaceRole];
        return {
            success: true,
            formsUpdated: 0,
        };
    }
    async overrideWorkspaceInheritance(formId, userId, accessLevel, grantedBy) {
        return this.setFormPermission(formId, userId, accessLevel, false, grantedBy);
    }
    async canPerformAction(formId, userId, action) {
        const accessLevelHierarchy = ['view', 'edit', 'manage', 'admin'];
        const requiredLevel = action;
        const result = await this.validateAccess(formId, userId, requiredLevel);
        return result.hasAccess;
    }
    async getFormPermissionSummary(formId) {
        const permissions = await this.getFormPermissions(formId);
        const settings = await this.getFormPermissionSettings(formId);
        return {
            formId,
            totalPermissions: permissions.permissions.length,
            defaultAccessLevel: settings.defaultAccessLevel,
            allowsInheritance: settings.allowWorkspaceInheritance,
            permissions: permissions.permissions.map(p => ({
                userId: p.userId,
                accessLevel: p.accessLevel,
                inheritFromWorkspace: p.inheritFromWorkspace,
                grantedAt: p.grantedAt,
            })),
        };
    }
}
exports.FormPermissionManager = FormPermissionManager;
//# sourceMappingURL=form-permission-manager.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormPermissionService = void 0;
const TallyApiClient_1 = require("./TallyApiClient");
const models_1 = require("../models");
class FormPermissionService {
    constructor(config = {}) {
        this.apiClient = new TallyApiClient_1.TallyApiClient(config);
    }
    async getFormPermissions(formId) {
        return this.apiClient.requestWithValidation('GET', `/forms/${formId}/permissions`, models_1.FormPermissionsResponseSchema);
    }
    async setFormPermission(formId, userId, accessLevel, inheritFromWorkspace = true, grantedBy) {
        const permissionInput = {
            userId,
            formId,
            accessLevel,
            inheritFromWorkspace,
            grantedBy,
            grantedAt: new Date().toISOString(),
        };
        return this.apiClient.requestWithValidation('POST', `/forms/${formId}/permissions`, models_1.FormPermissionSchema, permissionInput);
    }
    async updateFormPermission(formId, userId, accessLevel, inheritFromWorkspace = true) {
        const updateInput = {
            userId,
            formId,
            accessLevel,
            inheritFromWorkspace,
            grantedAt: new Date().toISOString(),
            grantedBy: 'system',
        };
        return this.apiClient.requestWithValidation('PATCH', `/forms/${formId}/permissions/${userId}`, models_1.FormPermissionSchema, updateInput);
    }
    async removeFormPermission(formId, userId) {
        return this.apiClient.requestWithValidation('DELETE', `/forms/${formId}/permissions/${userId}`, models_1.TallySuccessResponseSchema);
    }
    async setBulkFormPermissions(bulkPermission) {
        return this.apiClient.requestWithValidation('POST', '/forms/permissions/bulk', models_1.BulkPermissionResponseSchema, bulkPermission);
    }
    async getFormPermissionSettings(formId) {
        return this.apiClient.requestWithValidation('GET', `/forms/${formId}/settings/permissions`, models_1.FormPermissionSettingsResponseSchema);
    }
    async updateFormPermissionSettings(formId, settings) {
        const settingsForApi = {
            formId,
            workspaceId: settings.workspaceId || '',
            defaultAccessLevel: settings.defaultAccessLevel || 'view',
            allowWorkspaceInheritance: settings.allowWorkspaceInheritance ?? true,
            permissions: (settings.permissions || []).map(p => ({
                userId: p.userId,
                formId: p.formId,
                accessLevel: p.accessLevel,
                inheritFromWorkspace: p.inheritFromWorkspace ?? true,
                grantedAt: p.grantedAt,
                grantedBy: p.grantedBy
            }))
        };
        return this.apiClient.requestWithValidation('PATCH', `/forms/${formId}/settings/permissions`, models_1.FormPermissionSettingsSchema, settingsForApi);
    }
    async getEffectivePermission(formId, userId, workspaceRole) {
        const queryParams = workspaceRole ? `?workspaceRole=${workspaceRole}` : '';
        return this.apiClient.get(`/forms/${formId}/permissions/${userId}/effective${queryParams}`)
            .then(response => response.data);
    }
    async validateAccess(formId, userId, requiredAccessLevel) {
        const payload = { requiredAccessLevel };
        return this.apiClient.post(`/forms/${formId}/permissions/${userId}/validate`, payload)
            .then(response => response.data);
    }
    async getUserFormAccess(workspaceId, userId, minAccessLevel = 'view') {
        const queryParams = `?minAccessLevel=${minAccessLevel}`;
        return this.apiClient.get(`/workspaces/${workspaceId}/users/${userId}/form-access${queryParams}`)
            .then(response => response.data);
    }
    async copyFormPermissions(sourceFormId, targetFormId, includeSettings = true) {
        const payload = { targetFormId, includeSettings };
        return this.apiClient.requestWithValidation('POST', `/forms/${sourceFormId}/permissions/copy`, models_1.BulkPermissionResponseSchema, payload);
    }
}
exports.FormPermissionService = FormPermissionService;
//# sourceMappingURL=form-permission-service.js.map
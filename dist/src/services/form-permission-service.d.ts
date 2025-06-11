import { TallyApiClientConfig } from './TallyApiClient';
import { FormAccessLevel, FormPermission, BulkFormPermission, FormPermissionSettings, FormPermissionSettingsResponse, FormPermissionsResponse, BulkPermissionResponse, UserRole, TallySuccessResponse } from '../models';
export declare class FormPermissionService {
    private apiClient;
    constructor(config?: TallyApiClientConfig);
    getFormPermissions(formId: string): Promise<FormPermissionsResponse>;
    setFormPermission(formId: string, userId: string, accessLevel: FormAccessLevel, inheritFromWorkspace: boolean | undefined, grantedBy: string): Promise<FormPermission>;
    updateFormPermission(formId: string, userId: string, accessLevel: FormAccessLevel, inheritFromWorkspace?: boolean): Promise<FormPermission>;
    removeFormPermission(formId: string, userId: string): Promise<TallySuccessResponse>;
    setBulkFormPermissions(bulkPermission: BulkFormPermission): Promise<BulkPermissionResponse>;
    getFormPermissionSettings(formId: string): Promise<FormPermissionSettingsResponse>;
    updateFormPermissionSettings(formId: string, settings: Partial<FormPermissionSettings>): Promise<FormPermissionSettings>;
    getEffectivePermission(formId: string, userId: string, workspaceRole?: UserRole): Promise<{
        accessLevel: FormAccessLevel;
        source: 'form' | 'workspace' | 'default';
    }>;
    validateAccess(formId: string, userId: string, requiredAccessLevel: FormAccessLevel): Promise<{
        hasAccess: boolean;
        currentLevel: FormAccessLevel;
    }>;
    getUserFormAccess(workspaceId: string, userId: string, minAccessLevel?: FormAccessLevel): Promise<{
        formId: string;
        accessLevel: FormAccessLevel;
    }[]>;
    copyFormPermissions(sourceFormId: string, targetFormId: string, includeSettings?: boolean): Promise<BulkPermissionResponse>;
}
//# sourceMappingURL=form-permission-service.d.ts.map
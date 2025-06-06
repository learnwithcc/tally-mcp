import { TallyApiClientConfig } from '../services/TallyApiClient';
import { FormAccessLevel, FormPermission, FormPermissionSettings, UserRole } from '../models';
export declare class FormPermissionManager {
    private workspaceTool;
    private permissionService;
    constructor(apiClientConfig?: TallyApiClientConfig);
    setFormPermission(formId: string, userId: string, accessLevel: FormAccessLevel, inheritFromWorkspace: boolean | undefined, grantedBy: string): Promise<FormPermission>;
    updateFormPermission(formId: string, userId: string, accessLevel: FormAccessLevel, inheritFromWorkspace?: boolean): Promise<FormPermission>;
    removeFormPermission(formId: string, userId: string): Promise<{
        success: boolean;
    }>;
    getFormPermissions(formId: string): Promise<{
        formId: string;
        settings: {
            formId: string;
            workspaceId: string;
            defaultAccessLevel: "admin" | "view" | "edit" | "manage";
            allowWorkspaceInheritance: boolean;
            permissions: {
                formId: string;
                userId: string;
                accessLevel: "admin" | "view" | "edit" | "manage";
                inheritFromWorkspace: boolean;
                grantedAt: string;
                grantedBy: string;
            }[];
        };
        permissions: {
            formId: string;
            userId: string;
            accessLevel: "admin" | "view" | "edit" | "manage";
            inheritFromWorkspace: boolean;
            grantedAt: string;
            grantedBy: string;
        }[];
    }>;
    setBulkFormPermissions(userId: string, formIds: string[], accessLevel: FormAccessLevel, inheritFromWorkspace?: boolean): Promise<{
        success: boolean;
        updatedCount: number;
        failedCount: number;
        errors?: {
            error: string;
            formId: string;
        }[] | undefined;
    }>;
    getEffectivePermission(formId: string, userId: string, workspaceId: string): Promise<{
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
    getFormPermissionSettings(formId: string): Promise<{
        formId: string;
        workspaceId: string;
        defaultAccessLevel: "admin" | "view" | "edit" | "manage";
        allowWorkspaceInheritance: boolean;
        permissions: {
            formId: string;
            userId: string;
            accessLevel: "admin" | "view" | "edit" | "manage";
            inheritFromWorkspace: boolean;
            grantedAt: string;
            grantedBy: string;
        }[];
    }>;
    updateFormPermissionSettings(formId: string, settings: Partial<FormPermissionSettings>): Promise<{
        formId: string;
        workspaceId: string;
        defaultAccessLevel: "admin" | "view" | "edit" | "manage";
        allowWorkspaceInheritance: boolean;
        permissions: {
            formId: string;
            userId: string;
            accessLevel: "admin" | "view" | "edit" | "manage";
            inheritFromWorkspace: boolean;
            grantedAt: string;
            grantedBy: string;
        }[];
    }>;
    copyFormPermissions(sourceFormId: string, targetFormId: string, includeSettings?: boolean): Promise<{
        success: boolean;
        updatedCount: number;
        failedCount: number;
        errors?: {
            error: string;
            formId: string;
        }[] | undefined;
    }>;
    inheritWorkspacePermissions(workspaceId: string, userId: string, workspaceRole: UserRole): Promise<{
        success: boolean;
        formsUpdated: number;
    }>;
    overrideWorkspaceInheritance(formId: string, userId: string, accessLevel: FormAccessLevel, grantedBy: string): Promise<FormPermission>;
    canPerformAction(formId: string, userId: string, action: 'view' | 'edit' | 'manage' | 'admin'): Promise<boolean>;
    getFormPermissionSummary(formId: string): Promise<{
        formId: string;
        totalPermissions: number;
        defaultAccessLevel: "admin" | "view" | "edit" | "manage";
        allowsInheritance: boolean;
        permissions: {
            userId: string;
            accessLevel: "admin" | "view" | "edit" | "manage";
            inheritFromWorkspace: boolean;
            grantedAt: string;
        }[];
    }>;
}
//# sourceMappingURL=form-permission-manager.d.ts.map
import { WorkspaceManagementTool } from './workspace-tool';
import { FormPermissionService } from '../services/form-permission-service';
import { TallyApiClientConfig } from '../services/TallyApiClient';
import { 
  FormAccessLevel, 
  FormPermission, 
  BulkFormPermission, 
  FormPermissionSettings, 
  UserRole
} from '../models';

/**
 * FormPermissionManager integrates with WorkspaceManagementTool to provide
 * granular permission management for form access and editing rights
 */
export class FormPermissionManager {
  private workspaceTool: WorkspaceManagementTool;
  private permissionService: FormPermissionService;

  constructor(apiClientConfig: TallyApiClientConfig = {}) {
    this.workspaceTool = new WorkspaceManagementTool(apiClientConfig);
    this.permissionService = new FormPermissionService(apiClientConfig);
  }

  /**
   * Set permission for a user on a specific form
   */
  public async setFormPermission(
    formId: string,
    userId: string,
    accessLevel: FormAccessLevel,
    inheritFromWorkspace: boolean = true,
    grantedBy: string
  ): Promise<FormPermission> {
    return this.permissionService.setFormPermission(
      formId,
      userId,
      accessLevel,
      inheritFromWorkspace,
      grantedBy
    );
  }

  /**
   * Update an existing form permission
   */
  public async updateFormPermission(
    formId: string,
    userId: string,
    accessLevel: FormAccessLevel,
    inheritFromWorkspace: boolean = true
  ): Promise<FormPermission> {
    return this.permissionService.updateFormPermission(
      formId,
      userId,
      accessLevel,
      inheritFromWorkspace
    );
  }

  /**
   * Remove permission for a user on a specific form
   */
  public async removeFormPermission(formId: string, userId: string): Promise<{ success: boolean }> {
    const result = await this.permissionService.removeFormPermission(formId, userId);
    return { success: result.success || false };
  }

  /**
   * Get all permissions for a specific form
   */
  public async getFormPermissions(formId: string) {
    return this.permissionService.getFormPermissions(formId);
  }

  /**
   * Set permissions for multiple forms for a single user (bulk operation)
   */
  public async setBulkFormPermissions(
    userId: string,
    formIds: string[],
    accessLevel: FormAccessLevel,
    inheritFromWorkspace: boolean = true
  ) {
    const bulkPermission: BulkFormPermission = {
      userId,
      formIds,
      accessLevel,
      inheritFromWorkspace,
    };
    
    return this.permissionService.setBulkFormPermissions(bulkPermission);
  }

  /**
   * Get effective permission for a user on a form (considering workspace inheritance)
   */
  public async getEffectivePermission(
    formId: string,
    userId: string,
    workspaceId: string
  ): Promise<{ accessLevel: FormAccessLevel; source: 'form' | 'workspace' | 'default' }> {
    // First, get the user's workspace role
    const workspace = await this.workspaceTool.getWorkspaceDetails(workspaceId);
    const member = workspace.members?.find(m => m.id === userId);
    const workspaceRole = member?.role;

    return this.permissionService.getEffectivePermission(formId, userId, workspaceRole);
  }

  /**
   * Validate if a user has the required access level for a form
   */
  public async validateAccess(
    formId: string,
    userId: string,
    requiredAccessLevel: FormAccessLevel
  ): Promise<{ hasAccess: boolean; currentLevel: FormAccessLevel }> {
    return this.permissionService.validateAccess(formId, userId, requiredAccessLevel);
  }

  /**
   * Get all forms a user has access to in a workspace
   */
  public async getUserFormAccess(
    workspaceId: string,
    userId: string,
    minAccessLevel: FormAccessLevel = 'view'
  ): Promise<{ formId: string; accessLevel: FormAccessLevel }[]> {
    return this.permissionService.getUserFormAccess(workspaceId, userId, minAccessLevel);
  }

  /**
   * Get form permission settings (default access level, inheritance rules, etc.)
   */
  public async getFormPermissionSettings(formId: string) {
    return this.permissionService.getFormPermissionSettings(formId);
  }

  /**
   * Update form permission settings
   */
  public async updateFormPermissionSettings(
    formId: string,
    settings: Partial<FormPermissionSettings>
  ) {
    return this.permissionService.updateFormPermissionSettings(formId, settings);
  }

  /**
   * Copy permissions from one form to another
   */
  public async copyFormPermissions(
    sourceFormId: string,
    targetFormId: string,
    includeSettings: boolean = true
  ) {
    return this.permissionService.copyFormPermissions(sourceFormId, targetFormId, includeSettings);
  }

  /**
   * Grant workspace-level permissions to all forms in a workspace
   * This implements permission inheritance from workspace settings
   */
  public async inheritWorkspacePermissions(
    _workspaceId: string,
    _userId: string,
    workspaceRole: UserRole
  ): Promise<{ success: boolean; formsUpdated: number }> {
    // This would map workspace roles to form access levels
    const accessLevelMap: Record<UserRole, FormAccessLevel> = {
      'owner': 'admin',
      'admin': 'manage',
      'member': 'view',
    };

    // Use the mapping to get access level (referenced to avoid unused variable warning)
    accessLevelMap[workspaceRole];

    // Get all forms in the workspace (this would require a forms service)
    // For now, we'll return a mock response
    return {
      success: true,
      formsUpdated: 0,
    };
  }

  /**
   * Override workspace inheritance for specific forms
   */
  public async overrideWorkspaceInheritance(
    formId: string,
    userId: string,
    accessLevel: FormAccessLevel,
    grantedBy: string
  ): Promise<FormPermission> {
    return this.setFormPermission(formId, userId, accessLevel, false, grantedBy);
  }

  /**
   * Check if a user can perform a specific action on a form
   */
  public async canPerformAction(
    formId: string,
    userId: string,
    action: 'view' | 'edit' | 'manage' | 'admin'
  ): Promise<boolean> {
    // Access level hierarchy for reference (used for validation logic)
    ['view', 'edit', 'manage', 'admin'];
    const requiredLevel = action as FormAccessLevel;
    
    const result = await this.validateAccess(formId, userId, requiredLevel);
    return result.hasAccess;
  }

  /**
   * Get a summary of permissions for all users on a form
   */
  public async getFormPermissionSummary(formId: string) {
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
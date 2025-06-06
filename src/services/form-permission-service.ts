import { TallyApiClient, TallyApiClientConfig } from './TallyApiClient';
import { 
  FormAccessLevel, 
  FormPermission, 
  BulkFormPermission, 
  FormPermissionSettings, 
  FormPermissionsResponse,
  BulkPermissionResponse,
  FormPermissionsResponseSchema,
  FormPermissionSchema,
  FormPermissionSettingsSchema,
  BulkPermissionResponseSchema,
  UserRole,
  TallySuccessResponse,
  TallySuccessResponseSchema
} from '../models';

export class FormPermissionService {
  private apiClient: TallyApiClient;

  constructor(config: TallyApiClientConfig = {}) {
    this.apiClient = new TallyApiClient(config);
  }

  /**
   * Get all permissions for a specific form
   */
  public async getFormPermissions(formId: string): Promise<FormPermissionsResponse> {
    return this.apiClient.requestWithValidation(
      'GET', 
      `/forms/${formId}/permissions`, 
      FormPermissionsResponseSchema
    );
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
    const permission = {
      userId,
      formId,
      accessLevel,
      inheritFromWorkspace,
      grantedBy,
      grantedAt: new Date().toISOString(),
    };
    
    return this.apiClient.requestWithValidation(
      'POST', 
      `/forms/${formId}/permissions`, 
      FormPermissionSchema, 
      permission
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
    const updates = {
      userId,
      formId,
      accessLevel,
      inheritFromWorkspace,
      grantedAt: new Date().toISOString(),
      grantedBy: 'system', // In a real implementation, this would be the current user
    };
    
    return this.apiClient.requestWithValidation(
      'PATCH', 
      `/forms/${formId}/permissions/${userId}`, 
      FormPermissionSchema, 
      updates
    );
  }

  /**
   * Remove permission for a user on a specific form
   */
  public async removeFormPermission(formId: string, userId: string): Promise<TallySuccessResponse> {
    return this.apiClient.requestWithValidation(
      'DELETE', 
      `/forms/${formId}/permissions/${userId}`, 
      TallySuccessResponseSchema
    );
  }

  /**
   * Set permissions for multiple forms for a single user (bulk operation)
   */
  public async setBulkFormPermissions(bulkPermission: BulkFormPermission): Promise<BulkPermissionResponse> {
    return this.apiClient.requestWithValidation(
      'POST', 
      '/forms/permissions/bulk', 
      BulkPermissionResponseSchema, 
      bulkPermission
    );
  }

  /**
   * Get form permission settings (default access level, inheritance rules, etc.)
   */
  public async getFormPermissionSettings(formId: string): Promise<FormPermissionSettings> {
    return this.apiClient.requestWithValidation(
      'GET', 
      `/forms/${formId}/settings/permissions`, 
      FormPermissionSettingsSchema
    );
  }

  /**
   * Update form permission settings
   */
  public async updateFormPermissionSettings(
    formId: string,
    settings: Partial<FormPermissionSettings>
  ): Promise<FormPermissionSettings> {
    return this.apiClient.requestWithValidation(
      'PATCH', 
      `/forms/${formId}/settings/permissions`, 
      FormPermissionSettingsSchema, 
      settings
    );
  }

  /**
   * Get effective permission for a user on a form (considering workspace inheritance)
   */
  public async getEffectivePermission(
    formId: string, 
    userId: string, 
    workspaceRole?: UserRole
  ): Promise<{ accessLevel: FormAccessLevel; source: 'form' | 'workspace' | 'default' }> {
    const queryParams = workspaceRole ? `?workspaceRole=${workspaceRole}` : '';
    
    // For now, we'll use a simple response structure - in a real implementation,
    // we'd need a proper schema for this response
    return this.apiClient.get(`/forms/${formId}/permissions/${userId}/effective${queryParams}`)
      .then(response => response.data);
  }

  /**
   * Validate if a user has the required access level for a form
   */
  public async validateAccess(
    formId: string,
    userId: string,
    requiredAccessLevel: FormAccessLevel
  ): Promise<{ hasAccess: boolean; currentLevel: FormAccessLevel }> {
    const payload = { requiredAccessLevel };
    
    // For now, we'll use a simple response structure - in a real implementation,
    // we'd need a proper schema for this response
    return this.apiClient.post(`/forms/${formId}/permissions/${userId}/validate`, payload)
      .then(response => response.data);
  }

  /**
   * Get all forms a user has access to in a workspace
   */
  public async getUserFormAccess(
    workspaceId: string,
    userId: string,
    minAccessLevel: FormAccessLevel = 'view'
  ): Promise<{ formId: string; accessLevel: FormAccessLevel }[]> {
    const queryParams = `?minAccessLevel=${minAccessLevel}`;
    
    // For now, we'll use a simple response structure - in a real implementation,
    // we'd need a proper schema for this response
    return this.apiClient.get(`/workspaces/${workspaceId}/users/${userId}/form-access${queryParams}`)
      .then(response => response.data);
  }

  /**
   * Copy permissions from one form to another
   */
  public async copyFormPermissions(
    sourceFormId: string,
    targetFormId: string,
    includeSettings: boolean = true
  ): Promise<BulkPermissionResponse> {
    const payload = { targetFormId, includeSettings };
    
    return this.apiClient.requestWithValidation(
      'POST', 
      `/forms/${sourceFormId}/permissions/copy`, 
      BulkPermissionResponseSchema, 
      payload
    );
  }
} 
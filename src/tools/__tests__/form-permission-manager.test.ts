import { FormPermissionManager } from '../form-permission-manager';
import { WorkspaceManagementTool } from '../workspace-tool';
import { FormPermissionService } from '../../services/form-permission-service';
import { FormAccessLevel, UserRole } from '../../models';

// Mock the dependencies
jest.mock('../workspace-tool');
jest.mock('../../services/form-permission-service');

describe('FormPermissionManager', () => {
  let manager: FormPermissionManager;
  let mockWorkspaceTool: jest.Mocked<WorkspaceManagementTool>;
  let mockPermissionService: jest.Mocked<FormPermissionService>;

  beforeEach(() => {
    manager = new FormPermissionManager();
    mockWorkspaceTool = (manager as any).workspaceTool;
    mockPermissionService = (manager as any).permissionService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setFormPermission', () => {
    it('should call FormPermissionService.setFormPermission with correct parameters', async () => {
      const formId = 'form123';
      const userId = 'user456';
      const accessLevel: FormAccessLevel = 'edit';
      const inheritFromWorkspace = true;
      const grantedBy = 'admin789';

      const mockPermission = {
        userId,
        formId,
        accessLevel,
        inheritFromWorkspace,
        grantedAt: '2023-01-01T00:00:00Z',
        grantedBy,
      };

      mockPermissionService.setFormPermission.mockResolvedValue(mockPermission);

      const result = await manager.setFormPermission(formId, userId, accessLevel, inheritFromWorkspace, grantedBy);

      expect(mockPermissionService.setFormPermission).toHaveBeenCalledWith(
        formId,
        userId,
        accessLevel,
        inheritFromWorkspace,
        grantedBy
      );
      expect(result).toEqual(mockPermission);
    });
  });

  describe('updateFormPermission', () => {
    it('should call FormPermissionService.updateFormPermission with correct parameters', async () => {
      const formId = 'form123';
      const userId = 'user456';
      const accessLevel: FormAccessLevel = 'manage';
      const inheritFromWorkspace = false;

      const mockPermission = {
        userId,
        formId,
        accessLevel,
        inheritFromWorkspace,
        grantedAt: '2023-01-01T00:00:00Z',
        grantedBy: 'system',
      };

      mockPermissionService.updateFormPermission.mockResolvedValue(mockPermission);

      const result = await manager.updateFormPermission(formId, userId, accessLevel, inheritFromWorkspace);

      expect(mockPermissionService.updateFormPermission).toHaveBeenCalledWith(
        formId,
        userId,
        accessLevel,
        inheritFromWorkspace
      );
      expect(result).toEqual(mockPermission);
    });
  });

  describe('removeFormPermission', () => {
    it('should call FormPermissionService.removeFormPermission and return success status', async () => {
      const formId = 'form123';
      const userId = 'user456';

      mockPermissionService.removeFormPermission.mockResolvedValue({
        success: true,
        message: 'Permission removed successfully',
      });

      const result = await manager.removeFormPermission(formId, userId);

      expect(mockPermissionService.removeFormPermission).toHaveBeenCalledWith(formId, userId);
      expect(result).toEqual({ success: true });
    });
  });

  describe('setBulkFormPermissions', () => {
    it('should create bulk permission object and call service', async () => {
      const userId = 'user456';
      const formIds = ['form1', 'form2', 'form3'];
      const accessLevel: FormAccessLevel = 'view';
      const inheritFromWorkspace = true;

      const mockResponse = {
        success: true,
        updatedCount: 3,
        failedCount: 0,
      };

      mockPermissionService.setBulkFormPermissions.mockResolvedValue(mockResponse);

      const result = await manager.setBulkFormPermissions(userId, formIds, accessLevel, inheritFromWorkspace);

      expect(mockPermissionService.setBulkFormPermissions).toHaveBeenCalledWith({
        userId,
        formIds,
        accessLevel,
        inheritFromWorkspace,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getEffectivePermission', () => {
    it('should get workspace details and call service with workspace role', async () => {
      const formId = 'form123';
      const userId = 'user456';
      const workspaceId = 'workspace789';

      const mockWorkspace = {
        id: workspaceId,
        name: 'Test Workspace',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        members: [
          {
            id: userId,
            email: 'user@example.com',
            role: 'admin' as UserRole,
            joinedAt: '2023-01-01T00:00:00Z',
          },
        ],
      };

      const mockEffectivePermission = {
        accessLevel: 'manage' as FormAccessLevel,
        source: 'workspace' as const,
      };

      mockWorkspaceTool.getWorkspaceDetails.mockResolvedValue(mockWorkspace);
      mockPermissionService.getEffectivePermission.mockResolvedValue(mockEffectivePermission);

      const result = await manager.getEffectivePermission(formId, userId, workspaceId);

      expect(mockWorkspaceTool.getWorkspaceDetails).toHaveBeenCalledWith(workspaceId);
      expect(mockPermissionService.getEffectivePermission).toHaveBeenCalledWith(formId, userId, 'admin');
      expect(result).toEqual(mockEffectivePermission);
    });
  });

  describe('canPerformAction', () => {
    it('should validate access and return boolean result', async () => {
      const formId = 'form123';
      const userId = 'user456';
      const action = 'edit';

      mockPermissionService.validateAccess.mockResolvedValue({
        hasAccess: true,
        currentLevel: 'manage',
      });

      const result = await manager.canPerformAction(formId, userId, action);

      expect(mockPermissionService.validateAccess).toHaveBeenCalledWith(formId, userId, 'edit');
      expect(result).toBe(true);
    });
  });

  describe('inheritWorkspacePermissions', () => {
    it('should map workspace role to access level', async () => {
      const workspaceId = 'workspace789';
      const userId = 'user456';
      const workspaceRole: UserRole = 'admin';

      const result = await manager.inheritWorkspacePermissions(workspaceId, userId, workspaceRole);

      expect(result).toEqual({
        success: true,
        formsUpdated: 0,
      });
    });
  });

  describe('overrideWorkspaceInheritance', () => {
    it('should set form permission with inheritFromWorkspace false', async () => {
      const formId = 'form123';
      const userId = 'user456';
      const accessLevel: FormAccessLevel = 'admin';
      const grantedBy = 'admin789';

      const mockPermission = {
        userId,
        formId,
        accessLevel,
        inheritFromWorkspace: false,
        grantedAt: '2023-01-01T00:00:00Z',
        grantedBy,
      };

      mockPermissionService.setFormPermission.mockResolvedValue(mockPermission);

      const result = await manager.overrideWorkspaceInheritance(formId, userId, accessLevel, grantedBy);

      expect(mockPermissionService.setFormPermission).toHaveBeenCalledWith(
        formId,
        userId,
        accessLevel,
        false,
        grantedBy
      );
      expect(result).toEqual(mockPermission);
    });
  });

  describe('getFormPermissionSummary', () => {
    it('should combine permissions and settings into a summary', async () => {
      const formId = 'form123';

      const mockPermissions = {
        formId,
        permissions: [
          {
            userId: 'user1',
            formId,
            accessLevel: 'edit' as FormAccessLevel,
            inheritFromWorkspace: true,
            grantedAt: '2023-01-01T00:00:00Z',
            grantedBy: 'admin',
          },
        ],
        settings: {
          formId,
          workspaceId: 'workspace789',
          defaultAccessLevel: 'view' as FormAccessLevel,
          allowWorkspaceInheritance: true,
          permissions: [],
        },
      };

      const mockSettings = {
        formId,
        workspaceId: 'workspace789',
        defaultAccessLevel: 'view' as FormAccessLevel,
        allowWorkspaceInheritance: true,
        permissions: [],
      };

      mockPermissionService.getFormPermissions.mockResolvedValue(mockPermissions);
      mockPermissionService.getFormPermissionSettings.mockResolvedValue(mockSettings);

      const result = await manager.getFormPermissionSummary(formId);

      expect(result).toEqual({
        formId,
        totalPermissions: 1,
        defaultAccessLevel: 'view',
        allowsInheritance: true,
        permissions: [
          {
            userId: 'user1',
            accessLevel: 'edit',
            inheritFromWorkspace: true,
            grantedAt: '2023-01-01T00:00:00Z',
          },
        ],
      });
    });
  });
}); 
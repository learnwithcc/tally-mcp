import { TeamManager } from '../team-manager';
import { WorkspaceManagementTool } from '../workspace-tool';
import { TeamService } from '../../services/team-service';
import { TallyApiClientConfig } from '../../services/TallyApiClient';
import { 
  CreateTeamRequest,
  UpdateTeamRequest,
  BulkMembershipUpdate,
  TeamMembershipUpdate,
  TeamPermission,
  BulkTeamOperation,
  TeamResponse,
  TeamListResponse,
  TeamMember,
  BulkOperationResponse,
  OrganizationStructure,
  TeamAccessSummary,
  TeamAnalytics,
  TallySuccessResponse,
  TeamRole
} from '../../models';

// Mock the dependencies
jest.mock('../workspace-tool');
jest.mock('../../services/team-service');

describe('TeamManager', () => {
  let teamManager: TeamManager;
  let mockWorkspaceTool: jest.Mocked<WorkspaceManagementTool>;
  let mockTeamService: jest.Mocked<TeamService>;
  let mockApiClientConfig: TallyApiClientConfig;

  const mockTeamResponse: TeamResponse = {
    team: {
      id: 'team-123',
      name: 'Test Team',
      description: 'A test team',
      workspaceId: 'workspace-123',
      parentTeamId: undefined,
      childTeams: [],
      members: [
        {
          id: 'member-1',
          userId: 'user-1',
          email: 'user1@example.com',
          role: 'team_lead' as TeamRole,
          permissions: ['read', 'write'],
          joinedAt: '2023-01-01T00:00:00Z'
        }
      ],
      settings: {
        isPrivate: false,
        allowSelfJoin: false,
        inheritPermissions: true
      },
      metadata: {
        tags: []
      },
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      createdBy: 'creator-1'
    },
    memberCount: 1,
    childTeamCount: 0
  };

  const mockTeamMember: TeamMember = {
    id: 'member-2',
    userId: 'user-2',
    email: 'user2@example.com',
    role: 'member' as TeamRole,
    permissions: ['read'],
    joinedAt: '2023-01-01T00:00:00Z'
  };

  const mockSuccessResponse: TallySuccessResponse = {
    success: true,
    message: 'Operation completed successfully'
  };

  beforeEach(() => {
    mockApiClientConfig = {
      accessToken: 'test-token',
      baseURL: 'https://api.tally.so'
    };

    // Clear all mocks
    jest.clearAllMocks();

    // Create TeamManager instance
    teamManager = new TeamManager(mockApiClientConfig);

    // Get mocked instances
    mockWorkspaceTool = (teamManager as any).workspaceTool as jest.Mocked<WorkspaceManagementTool>;
    mockTeamService = (teamManager as any).teamService as jest.Mocked<TeamService>;
  });

  describe('constructor', () => {
    it('should create an instance with required dependencies', () => {
      expect(teamManager).toBeInstanceOf(TeamManager);
      expect(WorkspaceManagementTool).toHaveBeenCalledWith(mockApiClientConfig);
      expect(TeamService).toHaveBeenCalledWith(mockApiClientConfig);
    });

    it('should create an instance with default config when none provided', () => {
      const defaultTeamManager = new TeamManager();
      expect(defaultTeamManager).toBeInstanceOf(TeamManager);
      expect(WorkspaceManagementTool).toHaveBeenCalledWith({});
      expect(TeamService).toHaveBeenCalledWith({});
    });
  });

  describe('createTeam', () => {
    const createRequest: CreateTeamRequest = {
      workspaceId: 'workspace-123',
      name: 'New Team',
      description: 'A new team'
    };

    it('should create a team successfully after validating workspace', async () => {
      // Arrange
      mockWorkspaceTool.getWorkspaceDetails.mockResolvedValue({} as any);
      mockTeamService.createTeam.mockResolvedValue(mockTeamResponse);

      // Act
      const result = await teamManager.createTeam(createRequest);

      // Assert
      expect(mockWorkspaceTool.getWorkspaceDetails).toHaveBeenCalledWith('workspace-123');
      expect(mockTeamService.createTeam).toHaveBeenCalledWith(createRequest);
      expect(result).toEqual(mockTeamResponse);
    });

    it('should throw error if workspace validation fails', async () => {
      // Arrange
      const workspaceError = new Error('Workspace not found');
      mockWorkspaceTool.getWorkspaceDetails.mockRejectedValue(workspaceError);

      // Act & Assert
      await expect(teamManager.createTeam(createRequest)).rejects.toThrow('Workspace not found');
      expect(mockTeamService.createTeam).not.toHaveBeenCalled();
    });
  });

  describe('getTeam', () => {
    it('should get team details successfully', async () => {
      // Arrange
      mockTeamService.getTeam.mockResolvedValue(mockTeamResponse);

      // Act
      const result = await teamManager.getTeam('team-123');

      // Assert
      expect(mockTeamService.getTeam).toHaveBeenCalledWith('team-123');
      expect(result).toEqual(mockTeamResponse);
    });

    it('should propagate service errors', async () => {
      // Arrange
      const serviceError = new Error('Team not found');
      mockTeamService.getTeam.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(teamManager.getTeam('team-123')).rejects.toThrow('Team not found');
    });
  });

  describe('updateTeam', () => {
    const updateRequest: UpdateTeamRequest = {
      name: 'Updated Team',
      description: 'Updated description'
    };

    it('should update team without parent change', async () => {
      // Arrange
      mockTeamService.updateTeam.mockResolvedValue(mockTeamResponse);

      // Act
      const result = await teamManager.updateTeam('team-123', updateRequest);

      // Assert
      expect(mockTeamService.updateTeam).toHaveBeenCalledWith('team-123', updateRequest);
      expect(result).toEqual(mockTeamResponse);
    });

    it('should validate hierarchy when changing parent team', async () => {
      // Arrange
      const updateWithParent = { ...updateRequest, parentTeamId: 'parent-team' };
      const validateSpy = jest.spyOn(teamManager as any, 'validateTeamHierarchy').mockResolvedValue(undefined);
      mockTeamService.updateTeam.mockResolvedValue(mockTeamResponse);

      // Act
      const result = await teamManager.updateTeam('team-123', updateWithParent);

      // Assert
      expect(validateSpy).toHaveBeenCalledWith('team-123', 'parent-team');
      expect(mockTeamService.updateTeam).toHaveBeenCalledWith('team-123', updateWithParent);
      expect(result).toEqual(mockTeamResponse);
    });

    it('should handle setting parentTeamId to undefined', async () => {
      // Arrange
      const updateWithUndefinedParent = { ...updateRequest, parentTeamId: undefined };
      const validateSpy = jest.spyOn(teamManager as any, 'validateTeamHierarchy').mockResolvedValue(undefined);
      mockTeamService.updateTeam.mockResolvedValue(mockTeamResponse);

      // Act
      await teamManager.updateTeam('team-123', updateWithUndefinedParent);

      // Assert
      expect(validateSpy).toHaveBeenCalledWith('team-123', undefined);
    });
  });

  describe('deleteTeam', () => {
    const teamWithMembers: TeamResponse = {
      team: {
        ...mockTeamResponse.team,
        members: [mockTeamMember],
        childTeams: ['child-team-1', 'child-team-2']
      },
      memberCount: 1,
      childTeamCount: 2
    };

    it('should delete team without options', async () => {
      // Arrange
      mockTeamService.getTeam.mockResolvedValue(mockTeamResponse);
      mockTeamService.deleteTeam.mockResolvedValue(mockSuccessResponse);

      // Act
      const result = await teamManager.deleteTeam('team-123');

      // Assert
      expect(mockTeamService.getTeam).toHaveBeenCalledWith('team-123');
      expect(mockTeamService.deleteTeam).toHaveBeenCalledWith('team-123');
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should reassign members when reassignMembersTo option provided', async () => {
      // Arrange
      mockTeamService.getTeam.mockResolvedValue(teamWithMembers);
      mockTeamService.addTeamMember.mockResolvedValue(mockTeamMember);
      mockTeamService.deleteTeam.mockResolvedValue(mockSuccessResponse);

      // Act
      await teamManager.deleteTeam('team-123', { reassignMembersTo: 'new-team' });

      // Assert
      expect(mockTeamService.addTeamMember).toHaveBeenCalledWith(
        'new-team',
        'user-2',
        'member',
        ['read']
      );
    });

    it('should delete child teams when deleteChildTeams option is true', async () => {
      // Arrange
      const childTeam1: TeamResponse = {
        team: { ...mockTeamResponse.team, id: 'child-team-1', childTeams: [] },
        memberCount: 0,
        childTeamCount: 0
      };
      const childTeam2: TeamResponse = {
        team: { ...mockTeamResponse.team, id: 'child-team-2', childTeams: [] },
        memberCount: 0,
        childTeamCount: 0
      };
      
      // Set up different responses for different team IDs
      mockTeamService.getTeam
        .mockImplementation((teamId: string) => {
          if (teamId === 'team-123') return Promise.resolve(teamWithMembers);
          if (teamId === 'child-team-1') return Promise.resolve(childTeam1);
          if (teamId === 'child-team-2') return Promise.resolve(childTeam2);
          return Promise.reject(new Error('Team not found'));
        });
      
      const deleteSpy = jest.spyOn(teamManager, 'deleteTeam');
      mockTeamService.deleteTeam.mockResolvedValue(mockSuccessResponse);

      // Act
      await teamManager.deleteTeam('team-123', { deleteChildTeams: true });

      // Assert
      expect(deleteSpy).toHaveBeenCalledWith('child-team-1', { deleteChildTeams: true });
      expect(deleteSpy).toHaveBeenCalledWith('child-team-2', { deleteChildTeams: true });
      expect(deleteSpy).toHaveBeenCalledTimes(3); // original call + 2 child calls
    });

    it('should move child teams to parent when deleteChildTeams is false', async () => {
      // Arrange
      const teamWithParent = {
        team: { ...teamWithMembers.team, parentTeamId: 'parent-team' }
      };
      mockTeamService.getTeam.mockResolvedValue(teamWithParent);
      const moveSpy = jest.spyOn(teamManager, 'moveTeam').mockResolvedValue(mockTeamResponse);
      mockTeamService.deleteTeam.mockResolvedValue(mockSuccessResponse);

      // Act
      await teamManager.deleteTeam('team-123', { deleteChildTeams: false });

      // Assert
      expect(moveSpy).toHaveBeenCalledWith('child-team-1', 'parent-team');
      expect(moveSpy).toHaveBeenCalledWith('child-team-2', 'parent-team');
    });
  });

  describe('getTeams', () => {
    const mockTeamListResponse: TeamListResponse = {
      teams: [mockTeamResponse.team],
      totalCount: 1,
      page: 1,
      limit: 10,
      hasMore: false
    };

    it('should get teams list successfully', async () => {
      // Arrange
      mockWorkspaceTool.getWorkspaceDetails.mockResolvedValue({} as any);
      mockTeamService.getTeams.mockResolvedValue(mockTeamListResponse);

      // Act
      const result = await teamManager.getTeams('workspace-123');

      // Assert
      expect(mockWorkspaceTool.getWorkspaceDetails).toHaveBeenCalledWith('workspace-123');
      expect(mockTeamService.getTeams).toHaveBeenCalledWith('workspace-123', {});
      expect(result).toEqual(mockTeamListResponse);
    });

    it('should pass all options to service', async () => {
      // Arrange
      const options = {
        page: 2,
        limit: 20,
        parentTeamId: 'parent-123',
        includeSubteams: true,
        sortBy: 'name' as const,
        sortOrder: 'desc' as const
      };
      mockWorkspaceTool.getWorkspaceDetails.mockResolvedValue({} as any);
      mockTeamService.getTeams.mockResolvedValue(mockTeamListResponse);

      // Act
      await teamManager.getTeams('workspace-123', options);

      // Assert
      expect(mockTeamService.getTeams).toHaveBeenCalledWith('workspace-123', options);
    });
  });

  describe('addTeamMember', () => {
    it('should add team member with default role and permissions', async () => {
      // Arrange
      mockTeamService.getTeam.mockResolvedValue(mockTeamResponse);
      mockTeamService.addTeamMember.mockResolvedValue(mockTeamMember);

      // Act
      const result = await teamManager.addTeamMember('team-123', 'user-123');

      // Assert
      expect(mockTeamService.getTeam).toHaveBeenCalledWith('team-123');
      expect(mockTeamService.addTeamMember).toHaveBeenCalledWith('team-123', 'user-123', 'member', []);
      expect(result).toEqual(mockTeamMember);
    });

    it('should add team member with custom role and permissions', async () => {
      // Arrange
      mockTeamService.getTeam.mockResolvedValue(mockTeamResponse);
      mockTeamService.addTeamMember.mockResolvedValue(mockTeamMember);

      // Act
      const result = await teamManager.addTeamMember('team-123', 'user-123', 'manager', ['read', 'write', 'admin']);

      // Assert
      expect(mockTeamService.addTeamMember).toHaveBeenCalledWith('team-123', 'user-123', 'manager', ['read', 'write', 'admin']);
      expect(result).toEqual(mockTeamMember);
    });

    it('should throw error if team validation fails', async () => {
      // Arrange
      const teamError = new Error('Team not found');
      mockTeamService.getTeam.mockRejectedValue(teamError);

      // Act & Assert
      await expect(teamManager.addTeamMember('team-123', 'user-123')).rejects.toThrow('Team not found');
      expect(mockTeamService.addTeamMember).not.toHaveBeenCalled();
    });
  });

  describe('removeTeamMember', () => {
    it('should remove team member successfully', async () => {
      // Arrange
      mockTeamService.removeTeamMember.mockResolvedValue(mockSuccessResponse);

      // Act
      const result = await teamManager.removeTeamMember('team-123', 'user-123');

      // Assert
      expect(mockTeamService.removeTeamMember).toHaveBeenCalledWith('team-123', 'user-123');
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('updateTeamMember', () => {
    it('should update team member role and permissions', async () => {
      // Arrange
      const updates = { role: 'manager' as TeamRole, permissions: ['read', 'write'] };
      mockTeamService.updateTeamMember.mockResolvedValue(mockTeamMember);

      // Act
      const result = await teamManager.updateTeamMember('team-123', 'user-123', updates);

      // Assert
      expect(mockTeamService.updateTeamMember).toHaveBeenCalledWith('team-123', 'user-123', updates);
      expect(result).toEqual(mockTeamMember);
    });

    it('should update only role when permissions not provided', async () => {
      // Arrange
      const updates = { role: 'admin' as TeamRole };
      mockTeamService.updateTeamMember.mockResolvedValue(mockTeamMember);

      // Act
      await teamManager.updateTeamMember('team-123', 'user-123', updates);

      // Assert
      expect(mockTeamService.updateTeamMember).toHaveBeenCalledWith('team-123', 'user-123', updates);
    });
  });

  describe('bulkUpdateMemberships', () => {
    it('should perform bulk membership updates', async () => {
      // Arrange
      const bulkUpdate: BulkMembershipUpdate = {
        teamId: 'team-123',
        updates: [
          { userId: 'user-1', action: 'add', role: 'member' },
          { userId: 'user-2', action: 'remove' }
        ]
      };
      const mockBulkResponse: BulkOperationResponse = {
        success: true,
        processedCount: 2,
        errorCount: 0,
        errors: []
      };
      mockTeamService.bulkUpdateMemberships.mockResolvedValue(mockBulkResponse);

      // Act
      const result = await teamManager.bulkUpdateMemberships(bulkUpdate);

      // Assert
      expect(mockTeamService.bulkUpdateMemberships).toHaveBeenCalledWith(bulkUpdate);
      expect(result).toEqual(mockBulkResponse);
    });
  });

  describe('moveUsersBetweenTeams', () => {
    it('should move users between teams successfully', async () => {
      // Arrange
      const userIds = ['user-1', 'user-2'];
      const mockBulkResponse: BulkOperationResponse = {
        success: true,
        processedCount: 2,
        errorCount: 0,
        errors: []
      };
      mockTeamService.bulkUpdateMemberships.mockResolvedValue(mockBulkResponse);

      // Act
      const result = await teamManager.moveUsersBetweenTeams(userIds, 'from-team', 'to-team', 'manager');

      // Assert
      expect(mockTeamService.bulkUpdateMemberships).toHaveBeenCalledTimes(2);
      
      // First call - remove from source team
      expect(mockTeamService.bulkUpdateMemberships).toHaveBeenNthCalledWith(1, {
        teamId: 'from-team',
        updates: [
          { userId: 'user-1', action: 'remove' },
          { userId: 'user-2', action: 'remove' }
        ]
      });

      // Second call - add to destination team
      expect(mockTeamService.bulkUpdateMemberships).toHaveBeenNthCalledWith(2, {
        teamId: 'to-team',
        updates: [
          { userId: 'user-1', role: 'manager', action: 'add' },
          { userId: 'user-2', role: 'manager', action: 'add' }
        ]
      });

      expect(result).toEqual(mockBulkResponse);
    });

    it('should use default member role when newRole not provided', async () => {
      // Arrange
      const userIds = ['user-1'];
      const mockBulkResponse: BulkOperationResponse = {
        success: true,
        processedCount: 1,
        errorCount: 0,
        errors: []
      };
      mockTeamService.bulkUpdateMemberships.mockResolvedValue(mockBulkResponse);

      // Act
      await teamManager.moveUsersBetweenTeams(userIds, 'from-team', 'to-team');

      // Assert
      expect(mockTeamService.bulkUpdateMemberships).toHaveBeenNthCalledWith(2, {
        teamId: 'to-team',
        updates: [
          { userId: 'user-1', role: 'member', action: 'add' }
        ]
      });
    });
  });

  describe('moveTeam', () => {
    it('should move team to new parent', async () => {
      // Arrange
      const validateSpy = jest.spyOn(teamManager as any, 'validateTeamHierarchy').mockResolvedValue(undefined);
      mockTeamService.updateTeam.mockResolvedValue(mockTeamResponse);

      // Act
      const result = await teamManager.moveTeam('team-123', 'new-parent');

      // Assert
      expect(validateSpy).toHaveBeenCalledWith('team-123', 'new-parent');
      expect(mockTeamService.updateTeam).toHaveBeenCalledWith('team-123', { parentTeamId: 'new-parent' });
      expect(result).toEqual(mockTeamResponse);
    });

    it('should make team a root team when newParentTeamId is undefined', async () => {
      // Arrange
      const validateSpy = jest.spyOn(teamManager as any, 'validateTeamHierarchy').mockResolvedValue(undefined);
      mockTeamService.updateTeam.mockResolvedValue(mockTeamResponse);

      // Act
      await teamManager.moveTeam('team-123');

      // Assert
      expect(validateSpy).toHaveBeenCalledWith('team-123', undefined);
      expect(mockTeamService.updateTeam).toHaveBeenCalledWith('team-123', { parentTeamId: undefined });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty user array in moveUsersBetweenTeams', async () => {
      // Arrange
      const mockBulkResponse: BulkOperationResponse = {
        success: true,
        processedCount: 0,
        errorCount: 0,
        errors: []
      };
      mockTeamService.bulkUpdateMemberships.mockResolvedValue(mockBulkResponse);

      // Act
      const result = await teamManager.moveUsersBetweenTeams([], 'from-team', 'to-team');

      // Assert
      expect(mockTeamService.bulkUpdateMemberships).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockBulkResponse);
    });

    it('should handle team with no members in deleteTeam with reassignment', async () => {
      // Arrange
      const teamWithoutMembers = {
        team: { ...mockTeamResponse.team, members: [], childTeams: [] }
      };
      mockTeamService.getTeam.mockResolvedValue(teamWithoutMembers);
      mockTeamService.deleteTeam.mockResolvedValue(mockSuccessResponse);

      // Act
      const result = await teamManager.deleteTeam('team-123', { reassignMembersTo: 'new-team' });

      // Assert
      expect(mockTeamService.addTeamMember).not.toHaveBeenCalled();
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should handle team with no child teams in deleteTeam', async () => {
      // Arrange
      const teamWithoutChildren = {
        team: { ...mockTeamResponse.team, childTeams: [] },
        memberCount: 1,
        childTeamCount: 0
      };
      mockTeamService.getTeam.mockResolvedValue(teamWithoutChildren);
      mockTeamService.deleteTeam.mockResolvedValue(mockSuccessResponse);
      
      // Create spy BEFORE the method call
      const deleteSpy = jest.spyOn(teamManager, 'deleteTeam');

      // Act
      await teamManager.deleteTeam('team-123', { deleteChildTeams: true });

      // Assert
      // Should only be called once (for the main team, not recursively)
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith('team-123', { deleteChildTeams: true });
    });
  });

  describe('method chaining', () => {
    it('should chain operations correctly', async () => {
      // Test that methods can be chained and work together
      mockWorkspaceTool.getWorkspaceDetails.mockResolvedValue({} as any);
      mockTeamService.createTeam.mockResolvedValue(mockTeamResponse);
      mockTeamService.getTeam.mockResolvedValue(mockTeamResponse);
      mockTeamService.addTeamMember.mockResolvedValue(mockTeamMember);

      // Create team, then add member
      const team = await teamManager.createTeam({
        workspaceId: 'workspace-123',
        name: 'Test Team'
      });

      const member = await teamManager.addTeamMember(team.team.id, 'user-123', 'member');

      expect(team).toEqual(mockTeamResponse);
      expect(member).toEqual(mockTeamMember);
    });
  });
}); 
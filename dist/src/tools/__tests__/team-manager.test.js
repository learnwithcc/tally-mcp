import { TeamManager } from '../team-manager';
import { WorkspaceManagementTool } from '../workspace-tool';
import { TeamService } from '../../services/team-service';
jest.mock('../workspace-tool');
jest.mock('../../services/team-service');
describe('TeamManager', () => {
    let teamManager;
    let mockWorkspaceTool;
    let mockTeamService;
    let mockApiClientConfig;
    const mockTeamResponse = {
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
                    role: 'team_lead',
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
    const mockTeamMember = {
        id: 'member-2',
        userId: 'user-2',
        email: 'user2@example.com',
        role: 'member',
        permissions: ['read'],
        joinedAt: '2023-01-01T00:00:00Z'
    };
    const mockSuccessResponse = {
        success: true,
        message: 'Operation completed successfully'
    };
    beforeEach(() => {
        mockApiClientConfig = {
            accessToken: 'test-token',
            baseURL: 'https://api.tally.so'
        };
        jest.clearAllMocks();
        teamManager = new TeamManager(mockApiClientConfig);
        mockWorkspaceTool = teamManager.workspaceTool;
        mockTeamService = teamManager.teamService;
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
        const createRequest = {
            workspaceId: 'workspace-123',
            name: 'New Team',
            description: 'A new team'
        };
        it('should create a team successfully after validating workspace', async () => {
            mockWorkspaceTool.getWorkspaceDetails.mockResolvedValue({});
            mockTeamService.createTeam.mockResolvedValue(mockTeamResponse);
            const result = await teamManager.createTeam(createRequest);
            expect(mockWorkspaceTool.getWorkspaceDetails).toHaveBeenCalledWith('workspace-123');
            expect(mockTeamService.createTeam).toHaveBeenCalledWith(createRequest);
            expect(result).toEqual(mockTeamResponse);
        });
        it('should throw error if workspace validation fails', async () => {
            const workspaceError = new Error('Workspace not found');
            mockWorkspaceTool.getWorkspaceDetails.mockRejectedValue(workspaceError);
            await expect(teamManager.createTeam(createRequest)).rejects.toThrow('Workspace not found');
            expect(mockTeamService.createTeam).not.toHaveBeenCalled();
        });
    });
    describe('getTeam', () => {
        it('should get team details successfully', async () => {
            mockTeamService.getTeam.mockResolvedValue(mockTeamResponse);
            const result = await teamManager.getTeam('team-123');
            expect(mockTeamService.getTeam).toHaveBeenCalledWith('team-123');
            expect(result).toEqual(mockTeamResponse);
        });
        it('should propagate service errors', async () => {
            const serviceError = new Error('Team not found');
            mockTeamService.getTeam.mockRejectedValue(serviceError);
            await expect(teamManager.getTeam('team-123')).rejects.toThrow('Team not found');
        });
    });
    describe('updateTeam', () => {
        const updateRequest = {
            name: 'Updated Team',
            description: 'Updated description'
        };
        it('should update team without parent change', async () => {
            mockTeamService.updateTeam.mockResolvedValue(mockTeamResponse);
            const result = await teamManager.updateTeam('team-123', updateRequest);
            expect(mockTeamService.updateTeam).toHaveBeenCalledWith('team-123', updateRequest);
            expect(result).toEqual(mockTeamResponse);
        });
        it('should validate hierarchy when changing parent team', async () => {
            const updateWithParent = { ...updateRequest, parentTeamId: 'parent-team' };
            const validateSpy = jest.spyOn(teamManager, 'validateTeamHierarchy').mockResolvedValue(undefined);
            mockTeamService.updateTeam.mockResolvedValue(mockTeamResponse);
            const result = await teamManager.updateTeam('team-123', updateWithParent);
            expect(validateSpy).toHaveBeenCalledWith('team-123', 'parent-team');
            expect(mockTeamService.updateTeam).toHaveBeenCalledWith('team-123', updateWithParent);
            expect(result).toEqual(mockTeamResponse);
        });
        it('should handle setting parentTeamId to undefined', async () => {
            const updateWithUndefinedParent = { ...updateRequest, parentTeamId: undefined };
            const validateSpy = jest.spyOn(teamManager, 'validateTeamHierarchy').mockResolvedValue(undefined);
            mockTeamService.updateTeam.mockResolvedValue(mockTeamResponse);
            await teamManager.updateTeam('team-123', updateWithUndefinedParent);
            expect(validateSpy).toHaveBeenCalledWith('team-123', undefined);
        });
    });
    describe('deleteTeam', () => {
        const teamWithMembers = {
            team: {
                ...mockTeamResponse.team,
                members: [mockTeamMember],
                childTeams: ['child-team-1', 'child-team-2']
            },
            memberCount: 1,
            childTeamCount: 2
        };
        it('should delete team without options', async () => {
            mockTeamService.getTeam.mockResolvedValue(mockTeamResponse);
            mockTeamService.deleteTeam.mockResolvedValue(mockSuccessResponse);
            const result = await teamManager.deleteTeam('team-123');
            expect(mockTeamService.getTeam).toHaveBeenCalledWith('team-123');
            expect(mockTeamService.deleteTeam).toHaveBeenCalledWith('team-123');
            expect(result).toEqual(mockSuccessResponse);
        });
        it('should reassign members when reassignMembersTo option provided', async () => {
            mockTeamService.getTeam.mockResolvedValue(teamWithMembers);
            mockTeamService.addTeamMember.mockResolvedValue(mockTeamMember);
            mockTeamService.deleteTeam.mockResolvedValue(mockSuccessResponse);
            await teamManager.deleteTeam('team-123', { reassignMembersTo: 'new-team' });
            expect(mockTeamService.addTeamMember).toHaveBeenCalledWith('new-team', 'user-2', 'member', ['read']);
        });
        it('should delete child teams when deleteChildTeams option is true', async () => {
            const childTeam1 = {
                team: { ...mockTeamResponse.team, id: 'child-team-1', childTeams: [] },
                memberCount: 0,
                childTeamCount: 0
            };
            const childTeam2 = {
                team: { ...mockTeamResponse.team, id: 'child-team-2', childTeams: [] },
                memberCount: 0,
                childTeamCount: 0
            };
            mockTeamService.getTeam
                .mockImplementation((teamId) => {
                if (teamId === 'team-123')
                    return Promise.resolve(teamWithMembers);
                if (teamId === 'child-team-1')
                    return Promise.resolve(childTeam1);
                if (teamId === 'child-team-2')
                    return Promise.resolve(childTeam2);
                return Promise.reject(new Error('Team not found'));
            });
            const deleteSpy = jest.spyOn(teamManager, 'deleteTeam');
            mockTeamService.deleteTeam.mockResolvedValue(mockSuccessResponse);
            await teamManager.deleteTeam('team-123', { deleteChildTeams: true });
            expect(deleteSpy).toHaveBeenCalledWith('child-team-1', { deleteChildTeams: true });
            expect(deleteSpy).toHaveBeenCalledWith('child-team-2', { deleteChildTeams: true });
            expect(deleteSpy).toHaveBeenCalledTimes(3);
        });
        it('should move child teams to parent when deleteChildTeams is false', async () => {
            const teamWithParent = {
                team: { ...teamWithMembers.team, parentTeamId: 'parent-team' }
            };
            mockTeamService.getTeam.mockResolvedValue(teamWithParent);
            const moveSpy = jest.spyOn(teamManager, 'moveTeam').mockResolvedValue(mockTeamResponse);
            mockTeamService.deleteTeam.mockResolvedValue(mockSuccessResponse);
            await teamManager.deleteTeam('team-123', { deleteChildTeams: false });
            expect(moveSpy).toHaveBeenCalledWith('child-team-1', 'parent-team');
            expect(moveSpy).toHaveBeenCalledWith('child-team-2', 'parent-team');
        });
    });
    describe('getTeams', () => {
        const mockTeamListResponse = {
            teams: [mockTeamResponse.team],
            totalCount: 1,
            page: 1,
            limit: 10,
            hasMore: false
        };
        it('should get teams list successfully', async () => {
            mockWorkspaceTool.getWorkspaceDetails.mockResolvedValue({});
            mockTeamService.getTeams.mockResolvedValue(mockTeamListResponse);
            const result = await teamManager.getTeams('workspace-123');
            expect(mockWorkspaceTool.getWorkspaceDetails).toHaveBeenCalledWith('workspace-123');
            expect(mockTeamService.getTeams).toHaveBeenCalledWith('workspace-123', {});
            expect(result).toEqual(mockTeamListResponse);
        });
        it('should pass all options to service', async () => {
            const options = {
                page: 2,
                limit: 20,
                parentTeamId: 'parent-123',
                includeSubteams: true,
                sortBy: 'name',
                sortOrder: 'desc'
            };
            mockWorkspaceTool.getWorkspaceDetails.mockResolvedValue({});
            mockTeamService.getTeams.mockResolvedValue(mockTeamListResponse);
            await teamManager.getTeams('workspace-123', options);
            expect(mockTeamService.getTeams).toHaveBeenCalledWith('workspace-123', options);
        });
    });
    describe('addTeamMember', () => {
        it('should add team member with default role and permissions', async () => {
            mockTeamService.getTeam.mockResolvedValue(mockTeamResponse);
            mockTeamService.addTeamMember.mockResolvedValue(mockTeamMember);
            const result = await teamManager.addTeamMember('team-123', 'user-123');
            expect(mockTeamService.getTeam).toHaveBeenCalledWith('team-123');
            expect(mockTeamService.addTeamMember).toHaveBeenCalledWith('team-123', 'user-123', 'member', []);
            expect(result).toEqual(mockTeamMember);
        });
        it('should add team member with custom role and permissions', async () => {
            mockTeamService.getTeam.mockResolvedValue(mockTeamResponse);
            mockTeamService.addTeamMember.mockResolvedValue(mockTeamMember);
            const result = await teamManager.addTeamMember('team-123', 'user-123', 'manager', ['read', 'write', 'admin']);
            expect(mockTeamService.addTeamMember).toHaveBeenCalledWith('team-123', 'user-123', 'manager', ['read', 'write', 'admin']);
            expect(result).toEqual(mockTeamMember);
        });
        it('should throw error if team validation fails', async () => {
            const teamError = new Error('Team not found');
            mockTeamService.getTeam.mockRejectedValue(teamError);
            await expect(teamManager.addTeamMember('team-123', 'user-123')).rejects.toThrow('Team not found');
            expect(mockTeamService.addTeamMember).not.toHaveBeenCalled();
        });
    });
    describe('removeTeamMember', () => {
        it('should remove team member successfully', async () => {
            mockTeamService.removeTeamMember.mockResolvedValue(mockSuccessResponse);
            const result = await teamManager.removeTeamMember('team-123', 'user-123');
            expect(mockTeamService.removeTeamMember).toHaveBeenCalledWith('team-123', 'user-123');
            expect(result).toEqual(mockSuccessResponse);
        });
    });
    describe('updateTeamMember', () => {
        it('should update team member role and permissions', async () => {
            const updates = { role: 'manager', permissions: ['read', 'write'] };
            mockTeamService.updateTeamMember.mockResolvedValue(mockTeamMember);
            const result = await teamManager.updateTeamMember('team-123', 'user-123', updates);
            expect(mockTeamService.updateTeamMember).toHaveBeenCalledWith('team-123', 'user-123', updates);
            expect(result).toEqual(mockTeamMember);
        });
        it('should update only role when permissions not provided', async () => {
            const updates = { role: 'admin' };
            mockTeamService.updateTeamMember.mockResolvedValue(mockTeamMember);
            await teamManager.updateTeamMember('team-123', 'user-123', updates);
            expect(mockTeamService.updateTeamMember).toHaveBeenCalledWith('team-123', 'user-123', updates);
        });
    });
    describe('bulkUpdateMemberships', () => {
        it('should perform bulk membership updates', async () => {
            const bulkUpdate = {
                teamId: 'team-123',
                updates: [
                    { userId: 'user-1', action: 'add', role: 'member' },
                    { userId: 'user-2', action: 'remove' }
                ]
            };
            const mockBulkResponse = {
                success: true,
                processedCount: 2,
                errorCount: 0,
                errors: []
            };
            mockTeamService.bulkUpdateMemberships.mockResolvedValue(mockBulkResponse);
            const result = await teamManager.bulkUpdateMemberships(bulkUpdate);
            expect(mockTeamService.bulkUpdateMemberships).toHaveBeenCalledWith(bulkUpdate);
            expect(result).toEqual(mockBulkResponse);
        });
    });
    describe('moveUsersBetweenTeams', () => {
        it('should move users between teams successfully', async () => {
            const userIds = ['user-1', 'user-2'];
            const mockBulkResponse = {
                success: true,
                processedCount: 2,
                errorCount: 0,
                errors: []
            };
            mockTeamService.bulkUpdateMemberships.mockResolvedValue(mockBulkResponse);
            const result = await teamManager.moveUsersBetweenTeams(userIds, 'from-team', 'to-team', 'manager');
            expect(mockTeamService.bulkUpdateMemberships).toHaveBeenCalledTimes(2);
            expect(mockTeamService.bulkUpdateMemberships).toHaveBeenNthCalledWith(1, {
                teamId: 'from-team',
                updates: [
                    { userId: 'user-1', action: 'remove' },
                    { userId: 'user-2', action: 'remove' }
                ]
            });
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
            const userIds = ['user-1'];
            const mockBulkResponse = {
                success: true,
                processedCount: 1,
                errorCount: 0,
                errors: []
            };
            mockTeamService.bulkUpdateMemberships.mockResolvedValue(mockBulkResponse);
            await teamManager.moveUsersBetweenTeams(userIds, 'from-team', 'to-team');
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
            const validateSpy = jest.spyOn(teamManager, 'validateTeamHierarchy').mockResolvedValue(undefined);
            mockTeamService.updateTeam.mockResolvedValue(mockTeamResponse);
            const result = await teamManager.moveTeam('team-123', 'new-parent');
            expect(validateSpy).toHaveBeenCalledWith('team-123', 'new-parent');
            expect(mockTeamService.updateTeam).toHaveBeenCalledWith('team-123', { parentTeamId: 'new-parent' });
            expect(result).toEqual(mockTeamResponse);
        });
        it('should make team a root team when newParentTeamId is undefined', async () => {
            const validateSpy = jest.spyOn(teamManager, 'validateTeamHierarchy').mockResolvedValue(undefined);
            mockTeamService.updateTeam.mockResolvedValue(mockTeamResponse);
            await teamManager.moveTeam('team-123');
            expect(validateSpy).toHaveBeenCalledWith('team-123', undefined);
            expect(mockTeamService.updateTeam).toHaveBeenCalledWith('team-123', { parentTeamId: undefined });
        });
    });
    describe('edge cases and error handling', () => {
        it('should handle empty user array in moveUsersBetweenTeams', async () => {
            const mockBulkResponse = {
                success: true,
                processedCount: 0,
                errorCount: 0,
                errors: []
            };
            mockTeamService.bulkUpdateMemberships.mockResolvedValue(mockBulkResponse);
            const result = await teamManager.moveUsersBetweenTeams([], 'from-team', 'to-team');
            expect(mockTeamService.bulkUpdateMemberships).toHaveBeenCalledTimes(2);
            expect(result).toEqual(mockBulkResponse);
        });
        it('should handle team with no members in deleteTeam with reassignment', async () => {
            const teamWithoutMembers = {
                team: { ...mockTeamResponse.team, members: [], childTeams: [] }
            };
            mockTeamService.getTeam.mockResolvedValue(teamWithoutMembers);
            mockTeamService.deleteTeam.mockResolvedValue(mockSuccessResponse);
            const result = await teamManager.deleteTeam('team-123', { reassignMembersTo: 'new-team' });
            expect(mockTeamService.addTeamMember).not.toHaveBeenCalled();
            expect(result).toEqual(mockSuccessResponse);
        });
        it('should handle team with no child teams in deleteTeam', async () => {
            const teamWithoutChildren = {
                team: { ...mockTeamResponse.team, childTeams: [] },
                memberCount: 1,
                childTeamCount: 0
            };
            mockTeamService.getTeam.mockResolvedValue(teamWithoutChildren);
            mockTeamService.deleteTeam.mockResolvedValue(mockSuccessResponse);
            const deleteSpy = jest.spyOn(teamManager, 'deleteTeam');
            await teamManager.deleteTeam('team-123', { deleteChildTeams: true });
            expect(deleteSpy).toHaveBeenCalledTimes(1);
            expect(deleteSpy).toHaveBeenCalledWith('team-123', { deleteChildTeams: true });
        });
    });
    describe('method chaining', () => {
        it('should chain operations correctly', async () => {
            mockWorkspaceTool.getWorkspaceDetails.mockResolvedValue({});
            mockTeamService.createTeam.mockResolvedValue(mockTeamResponse);
            mockTeamService.getTeam.mockResolvedValue(mockTeamResponse);
            mockTeamService.addTeamMember.mockResolvedValue(mockTeamMember);
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
//# sourceMappingURL=team-manager.test.js.map
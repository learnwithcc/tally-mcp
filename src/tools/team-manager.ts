import { WorkspaceManagementTool } from './workspace-tool';
import { TeamService } from '../services/team-service';
import { TallyApiClientConfig } from '../services/TallyApiClient';
import { 
  TeamMember,
  TeamRole,
  CreateTeamRequest,
  UpdateTeamRequest,
  BulkTeamOperation,
  TeamMembershipUpdate,
  BulkMembershipUpdate,
  TeamPermission,
  TeamAccessSummary,
  TeamAnalytics,
  TeamResponse,
  TeamListResponse,
  BulkOperationResponse,
  OrganizationStructure,
  UserRole,
  TallySuccessResponse,
} from '../models';

/**
 * TeamManager class handles team creation, updates, deletion, and hierarchy management.
 * It provides comprehensive team management functionality including nested team structures,
 * user assignment, permission inheritance, and organization visualization.
 */
export class TeamManager {
  private workspaceTool: WorkspaceManagementTool;
  private teamService: TeamService;

  constructor(apiClientConfig: TallyApiClientConfig = {}) {
    this.workspaceTool = new WorkspaceManagementTool(apiClientConfig);
    this.teamService = new TeamService(apiClientConfig);
  }

  // ============================================
  // BASIC TEAM OPERATIONS
  // ============================================

  /**
   * Create a new team within a workspace
   */
  public async createTeam(request: CreateTeamRequest): Promise<TeamResponse> {
    // Validate workspace exists
    await this.workspaceTool.getWorkspaceDetails(request.workspaceId);
    
    return this.teamService.createTeam(request);
  }

  /**
   * Get a team by ID with full details
   */
  public async getTeam(teamId: string): Promise<TeamResponse> {
    return this.teamService.getTeam(teamId);
  }

  /**
   * Update an existing team
   */
  public async updateTeam(teamId: string, updates: UpdateTeamRequest): Promise<TeamResponse> {
    // If parent team is being changed (including set to undefined), validate the hierarchy
    if ('parentTeamId' in updates) {
      await this.validateTeamHierarchy(teamId, updates.parentTeamId);
    }

    return this.teamService.updateTeam(teamId, updates);
  }

  /**
   * Delete a team and handle member reassignment
   */
  public async deleteTeam(teamId: string, options: {
    reassignMembersTo?: string; // Team ID to reassign members
    deleteChildTeams?: boolean; // Whether to delete child teams or move them to parent
  } = {}): Promise<TallySuccessResponse> {
    const team = await this.getTeam(teamId);
    
    // Handle member reassignment if specified
    if (options.reassignMembersTo && team.team.members.length > 0) {
      for (const member of team.team.members) {
        await this.addTeamMember(options.reassignMembersTo, member.userId, member.role, member.permissions);
      }
    }

    // Handle child teams
    if (team.team.childTeams.length > 0) {
      if (options.deleteChildTeams) {
        // Recursively delete child teams
        for (const childTeamId of team.team.childTeams) {
          await this.deleteTeam(childTeamId, options);
        }
      } else {
        // Move child teams to this team's parent
        for (const childTeamId of team.team.childTeams) {
          await this.moveTeam(childTeamId, team.team.parentTeamId);
        }
      }
    }

    return this.teamService.deleteTeam(teamId);
  }

  /**
   * List teams in a workspace with filtering options
   */
  public async getTeams(
    workspaceId: string,
    options: { 
      page?: number; 
      limit?: number; 
      parentTeamId?: string;
      includeSubteams?: boolean;
      sortBy?: 'name' | 'created' | 'updated' | 'memberCount';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<TeamListResponse> {
    // Validate workspace exists
    await this.workspaceTool.getWorkspaceDetails(workspaceId);
    
    return this.teamService.getTeams(workspaceId, options);
  }

  // ============================================
  // TEAM MEMBERSHIP MANAGEMENT
  // ============================================

  /**
   * Add a member to a team
   */
  public async addTeamMember(
    teamId: string,
    userId: string,
    role: TeamRole = 'member',
    permissions: string[] = []
  ): Promise<TeamMember> {
    // Validate team exists
    await this.getTeam(teamId);
    
    return this.teamService.addTeamMember(teamId, userId, role, permissions);
  }

  /**
   * Remove a member from a team
   */
  public async removeTeamMember(teamId: string, userId: string): Promise<TallySuccessResponse> {
    return this.teamService.removeTeamMember(teamId, userId);
  }

  /**
   * Update a team member's role or permissions
   */
  public async updateTeamMember(
    teamId: string,
    userId: string,
    updates: { role?: TeamRole; permissions?: string[] }
  ): Promise<TeamMember> {
    return this.teamService.updateTeamMember(teamId, userId, updates);
  }

  /**
   * Bulk update team memberships
   */
  public async bulkUpdateMemberships(bulkUpdate: BulkMembershipUpdate): Promise<BulkOperationResponse> {
    return this.teamService.bulkUpdateMemberships(bulkUpdate);
  }

  /**
   * Move users between teams in bulk
   */
  public async moveUsersBetweenTeams(
    userIds: string[],
    fromTeamId: string,
    toTeamId: string,
    newRole?: TeamRole
  ): Promise<BulkOperationResponse> {
    const updates: TeamMembershipUpdate[] = userIds.map(userId => ({
      userId,
      action: 'remove' as const,
    }));

    // Remove from source team
    await this.bulkUpdateMemberships({ teamId: fromTeamId, updates });

    // Add to destination team
    const addUpdates: TeamMembershipUpdate[] = userIds.map(userId => ({
      userId,
      role: newRole || 'member',
      action: 'add' as const,
    }));

    return this.bulkUpdateMemberships({ teamId: toTeamId, updates: addUpdates });
  }

  // ============================================
  // TEAM HIERARCHY MANAGEMENT
  // ============================================

  /**
   * Move a team to a new parent (or make it a root team)
   */
  public async moveTeam(teamId: string, newParentTeamId?: string): Promise<TeamResponse> {
    // Validate hierarchy constraints
    await this.validateTeamHierarchy(teamId, newParentTeamId);
    
    // Update the team's parent
    return this.teamService.updateTeam(teamId, { parentTeamId: newParentTeamId });
  }

  /**
   * Get the organization structure for a workspace
   */
  public async getOrganizationStructure(workspaceId: string): Promise<OrganizationStructure> {
    // Validate workspace exists
    await this.workspaceTool.getWorkspaceDetails(workspaceId);
    
    return this.teamService.getOrganizationStructure(workspaceId);
  }

  /**
   * Create a nested team structure from a hierarchy definition
   */
  public async createTeamHierarchy(
    workspaceId: string,
    hierarchy: {
      name: string;
      description?: string;
      children?: Array<{ name: string; description?: string; children?: any[] }>;
    }
  ): Promise<{ rootTeam: TeamResponse; createdTeams: TeamResponse[] }> {
    const createdTeams: TeamResponse[] = [];

    // Create root team
    const rootTeam = await this.createTeam({
      name: hierarchy.name,
      description: hierarchy.description,
      workspaceId,
    });
    createdTeams.push(rootTeam);

    // Recursively create child teams
    if (hierarchy.children) {
      await this.createChildTeams(rootTeam.team.id, hierarchy.children, workspaceId, createdTeams);
    }

    return { rootTeam, createdTeams };
  }

  /**
   * Get team hierarchy path from root to specified team
   */
  public async getTeamPath(teamId: string): Promise<TeamResponse[]> {
    const path: TeamResponse[] = [];
    let currentTeamId: string | undefined = teamId;

    while (currentTeamId) {
      const team = await this.getTeam(currentTeamId);
      path.unshift(team);
      currentTeamId = team.team.parentTeamId;
    }

    return path;
  }

  /**
   * Get all descendant teams (children, grandchildren, etc.)
   */
  public async getTeamDescendants(teamId: string): Promise<TeamResponse[]> {
    const descendants: TeamResponse[] = [];
    const team = await this.getTeam(teamId);

    for (const childId of team.team.childTeams) {
      const child = await this.getTeam(childId);
      descendants.push(child);
      
      // Recursively get descendants
      const childDescendants = await this.getTeamDescendants(childId);
      descendants.push(...childDescendants);
    }

    return descendants;
  }

  // ============================================
  // PERMISSION AND ACCESS MANAGEMENT
  // ============================================

  /**
   * Set team-based permissions for resources
   */
  public async setTeamPermission(permission: TeamPermission): Promise<TeamPermission> {
    return this.teamService.setTeamPermission(permission);
  }

  /**
   * Get effective permissions for a team member
   */
  public async getTeamMemberPermissions(teamId: string, userId: string): Promise<TeamAccessSummary> {
    return this.teamService.getTeamMemberPermissions(teamId, userId);
  }

  /**
   * Inherit workspace permissions to team level
   */
  public async inheritWorkspacePermissions(
    workspaceId: string,
    teamId: string
  ): Promise<{ success: boolean; permissionsInherited: number }> {
    const workspace = await this.workspaceTool.getWorkspaceDetails(workspaceId);
    const team = await this.getTeam(teamId);

    // Map workspace roles to team permissions
    let permissionsInherited = 0;
    
    if (workspace.members) {
      for (const member of workspace.members) {
        // Add workspace members to team if they're not already members
        const isTeamMember = team.team.members.some(tm => tm.userId === member.id);
        
        if (!isTeamMember) {
          const teamRole = this.mapWorkspaceRoleToTeamRole(member.role);
          await this.addTeamMember(teamId, member.id, teamRole);
          permissionsInherited++;
        }
      }
    }

    return { success: true, permissionsInherited };
  }

  // ============================================
  // ANALYTICS AND INSIGHTS
  // ============================================

  /**
   * Get team analytics and insights
   */
  public async getTeamAnalytics(teamId: string): Promise<TeamAnalytics> {
    return this.teamService.getTeamAnalytics(teamId);
  }

  /**
   * Get teams a user belongs to
   */
  public async getUserTeams(workspaceId: string, userId: string): Promise<TeamResponse[]> {
    return this.teamService.getUserTeams(workspaceId, userId);
  }

  /**
   * Check if a user can perform an action on a team
   */
  public async canUserPerformAction(
    teamId: string,
    userId: string,
    action: 'view' | 'edit' | 'manage' | 'delete'
  ): Promise<{ canPerform: boolean; reason?: string }> {
    return this.teamService.canUserPerformAction(teamId, userId, action);
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  /**
   * Perform bulk operations on multiple teams
   */
  public async bulkTeamOperation(operation: BulkTeamOperation): Promise<BulkOperationResponse> {
    return this.teamService.bulkTeamOperation(operation);
  }

  /**
   * Reorganize teams by moving multiple teams at once
   */
  public async reorganizeTeams(
    moves: Array<{ teamId: string; newParentTeamId?: string }>
  ): Promise<BulkOperationResponse> {
    const results: Array<{ teamId: string; success: boolean; data?: any }> = [];
    
    for (const move of moves) {
      try {
        await this.moveTeam(move.teamId, move.newParentTeamId);
        results.push({ teamId: move.teamId, success: true });
      } catch (error) {
        results.push({ 
          teamId: move.teamId, 
          success: false, 
          data: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return {
      success: successCount > 0,
      processedCount: results.length,
      failedCount: results.length - successCount,
      results,
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Validate team hierarchy constraints (prevent circular references)
   */
  private async validateTeamHierarchy(teamId: string, newParentTeamId?: string): Promise<void> {
    if (!newParentTeamId) return; // Moving to root is always valid

    // Check if the new parent is a descendant of the team being moved
    const descendants = await this.getTeamDescendants(teamId);
    const isCircular = descendants.some(desc => desc.team.id === newParentTeamId);
    
    if (isCircular) {
      throw new Error('Cannot move team: would create circular reference in hierarchy');
    }

    // Validate that the parent team exists
    await this.getTeam(newParentTeamId);
  }

  /**
   * Recursively create child teams
   */
  private async createChildTeams(
    parentTeamId: string,
    children: Array<{ name: string; description?: string; children?: any[] }>,
    workspaceId: string,
    createdTeams: TeamResponse[]
  ): Promise<void> {
    for (const child of children) {
      const childTeam = await this.createTeam({
        name: child.name,
        description: child.description,
        workspaceId,
        parentTeamId,
      });
      createdTeams.push(childTeam);

      if (child.children) {
        await this.createChildTeams(childTeam.team.id, child.children, workspaceId, createdTeams);
      }
    }
  }

  /**
   * Map workspace roles to team roles
   */
  private mapWorkspaceRoleToTeamRole(workspaceRole: UserRole): TeamRole {
    const roleMap: Record<UserRole, TeamRole> = {
      'owner': 'team_lead',
      'admin': 'team_lead',
      'member': 'member',
    };

    return roleMap[workspaceRole] || 'member';
  }
} 
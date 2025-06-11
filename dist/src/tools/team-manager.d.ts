import { TallyApiClientConfig } from '../services/TallyApiClient';
import { TeamMember, TeamRole, CreateTeamRequest, UpdateTeamRequest, BulkTeamOperation, BulkMembershipUpdate, TeamPermission, TeamAccessSummary, TeamAnalytics, TeamResponse, TeamListResponse, BulkOperationResponse, OrganizationStructure, TallySuccessResponse } from '../models';
export declare class TeamManager {
    private workspaceTool;
    private teamService;
    constructor(apiClientConfig?: TallyApiClientConfig);
    createTeam(request: CreateTeamRequest): Promise<TeamResponse>;
    getTeam(teamId: string): Promise<TeamResponse>;
    updateTeam(teamId: string, updates: UpdateTeamRequest): Promise<TeamResponse>;
    deleteTeam(teamId: string, options?: {
        reassignMembersTo?: string;
        deleteChildTeams?: boolean;
    }): Promise<TallySuccessResponse>;
    getTeams(workspaceId: string, options?: {
        page?: number;
        limit?: number;
        parentTeamId?: string;
        includeSubteams?: boolean;
        sortBy?: 'name' | 'created' | 'updated' | 'memberCount';
        sortOrder?: 'asc' | 'desc';
    }): Promise<TeamListResponse>;
    addTeamMember(teamId: string, userId: string, role?: TeamRole, permissions?: string[]): Promise<TeamMember>;
    removeTeamMember(teamId: string, userId: string): Promise<TallySuccessResponse>;
    updateTeamMember(teamId: string, userId: string, updates: {
        role?: TeamRole;
        permissions?: string[];
    }): Promise<TeamMember>;
    bulkUpdateMemberships(bulkUpdate: BulkMembershipUpdate): Promise<BulkOperationResponse>;
    moveUsersBetweenTeams(userIds: string[], fromTeamId: string, toTeamId: string, newRole?: TeamRole): Promise<BulkOperationResponse>;
    moveTeam(teamId: string, newParentTeamId?: string): Promise<TeamResponse>;
    getOrganizationStructure(workspaceId: string): Promise<OrganizationStructure>;
    createTeamHierarchy(workspaceId: string, hierarchy: {
        name: string;
        description?: string;
        children?: Array<{
            name: string;
            description?: string;
            children?: any[];
        }>;
    }): Promise<{
        rootTeam: TeamResponse;
        createdTeams: TeamResponse[];
    }>;
    getTeamPath(teamId: string): Promise<TeamResponse[]>;
    getTeamDescendants(teamId: string): Promise<TeamResponse[]>;
    setTeamPermission(permission: TeamPermission): Promise<TeamPermission>;
    getTeamMemberPermissions(teamId: string, userId: string): Promise<TeamAccessSummary>;
    inheritWorkspacePermissions(workspaceId: string, teamId: string): Promise<{
        success: boolean;
        permissionsInherited: number;
    }>;
    getTeamAnalytics(teamId: string): Promise<TeamAnalytics>;
    getUserTeams(workspaceId: string, userId: string): Promise<TeamResponse[]>;
    canUserPerformAction(teamId: string, userId: string, action: 'view' | 'edit' | 'manage' | 'delete'): Promise<{
        canPerform: boolean;
        reason?: string;
    }>;
    bulkTeamOperation(operation: BulkTeamOperation): Promise<BulkOperationResponse>;
    reorganizeTeams(moves: Array<{
        teamId: string;
        newParentTeamId?: string;
    }>): Promise<BulkOperationResponse>;
    private validateTeamHierarchy;
    private createChildTeams;
    private mapWorkspaceRoleToTeamRole;
}
//# sourceMappingURL=team-manager.d.ts.map
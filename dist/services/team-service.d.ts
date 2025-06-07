import { TallyApiClientConfig } from './TallyApiClient';
import { TeamMember, TeamRole, CreateTeamRequest, UpdateTeamRequest, BulkTeamOperation, BulkMembershipUpdate, TeamPermission, TeamAccessSummary, TeamAnalytics, TeamResponse, TeamListResponse, BulkOperationResponse, OrganizationStructure, TallySuccessResponse } from '../models';
export declare class TeamService {
    private apiClient;
    constructor(config?: TallyApiClientConfig);
    createTeam(request: CreateTeamRequest): Promise<TeamResponse>;
    getTeam(teamId: string): Promise<TeamResponse>;
    updateTeam(teamId: string, updates: UpdateTeamRequest): Promise<TeamResponse>;
    deleteTeam(teamId: string): Promise<TallySuccessResponse>;
    getTeams(workspaceId: string, options?: {
        page?: number;
        limit?: number;
        parentTeamId?: string;
    }): Promise<TeamListResponse>;
    addTeamMember(teamId: string, userId: string, role?: TeamRole, permissions?: string[]): Promise<TeamMember>;
    removeTeamMember(teamId: string, userId: string): Promise<TallySuccessResponse>;
    updateTeamMember(teamId: string, userId: string, updates: {
        role?: TeamRole;
        permissions?: string[];
    }): Promise<TeamMember>;
    bulkUpdateMemberships(bulkUpdate: BulkMembershipUpdate): Promise<BulkOperationResponse>;
    moveTeam(teamId: string, newParentTeamId?: string): Promise<TeamResponse>;
    getOrganizationStructure(workspaceId: string): Promise<OrganizationStructure>;
    getTeamAnalytics(teamId: string): Promise<TeamAnalytics>;
    getTeamMemberPermissions(teamId: string, userId: string): Promise<TeamAccessSummary>;
    setTeamPermission(permission: TeamPermission): Promise<TeamPermission>;
    bulkTeamOperation(operation: BulkTeamOperation): Promise<BulkOperationResponse>;
    getUserTeams(workspaceId: string, userId: string): Promise<TeamResponse[]>;
    canUserPerformAction(teamId: string, userId: string, action: 'view' | 'edit' | 'manage' | 'delete'): Promise<{
        canPerform: boolean;
        reason?: string;
    }>;
}
//# sourceMappingURL=team-service.d.ts.map
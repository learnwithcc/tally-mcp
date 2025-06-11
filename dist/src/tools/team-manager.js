import { WorkspaceManagementTool } from './workspace-tool';
import { TeamService } from '../services/team-service';
export class TeamManager {
    constructor(apiClientConfig = {}) {
        this.workspaceTool = new WorkspaceManagementTool(apiClientConfig);
        this.teamService = new TeamService(apiClientConfig);
    }
    async createTeam(request) {
        await this.workspaceTool.getWorkspaceDetails(request.workspaceId);
        return this.teamService.createTeam(request);
    }
    async getTeam(teamId) {
        return this.teamService.getTeam(teamId);
    }
    async updateTeam(teamId, updates) {
        if (updates.parentTeamId !== undefined) {
            await this.validateTeamHierarchy(teamId, updates.parentTeamId);
        }
        return this.teamService.updateTeam(teamId, updates);
    }
    async deleteTeam(teamId, options = {}) {
        const team = await this.getTeam(teamId);
        if (options.reassignMembersTo && team.team.members.length > 0) {
            for (const member of team.team.members) {
                await this.addTeamMember(options.reassignMembersTo, member.userId, member.role, member.permissions);
            }
        }
        if (team.team.childTeams.length > 0) {
            if (options.deleteChildTeams) {
                for (const childTeamId of team.team.childTeams) {
                    await this.deleteTeam(childTeamId, options);
                }
            }
            else {
                for (const childTeamId of team.team.childTeams) {
                    await this.moveTeam(childTeamId, team.team.parentTeamId);
                }
            }
        }
        return this.teamService.deleteTeam(teamId);
    }
    async getTeams(workspaceId, options = {}) {
        await this.workspaceTool.getWorkspaceDetails(workspaceId);
        return this.teamService.getTeams(workspaceId, options);
    }
    async addTeamMember(teamId, userId, role = 'member', permissions = []) {
        await this.getTeam(teamId);
        return this.teamService.addTeamMember(teamId, userId, role, permissions);
    }
    async removeTeamMember(teamId, userId) {
        return this.teamService.removeTeamMember(teamId, userId);
    }
    async updateTeamMember(teamId, userId, updates) {
        return this.teamService.updateTeamMember(teamId, userId, updates);
    }
    async bulkUpdateMemberships(bulkUpdate) {
        return this.teamService.bulkUpdateMemberships(bulkUpdate);
    }
    async moveUsersBetweenTeams(userIds, fromTeamId, toTeamId, newRole) {
        const updates = userIds.map(userId => ({
            userId,
            action: 'remove',
        }));
        await this.bulkUpdateMemberships({ teamId: fromTeamId, updates });
        const addUpdates = userIds.map(userId => ({
            userId,
            role: newRole || 'member',
            action: 'add',
        }));
        return this.bulkUpdateMemberships({ teamId: toTeamId, updates: addUpdates });
    }
    async moveTeam(teamId, newParentTeamId) {
        await this.validateTeamHierarchy(teamId, newParentTeamId);
        return this.teamService.moveTeam(teamId, newParentTeamId);
    }
    async getOrganizationStructure(workspaceId) {
        await this.workspaceTool.getWorkspaceDetails(workspaceId);
        return this.teamService.getOrganizationStructure(workspaceId);
    }
    async createTeamHierarchy(workspaceId, hierarchy) {
        const createdTeams = [];
        const rootTeam = await this.createTeam({
            name: hierarchy.name,
            description: hierarchy.description,
            workspaceId,
        });
        createdTeams.push(rootTeam);
        if (hierarchy.children) {
            await this.createChildTeams(rootTeam.team.id, hierarchy.children, workspaceId, createdTeams);
        }
        return { rootTeam, createdTeams };
    }
    async getTeamPath(teamId) {
        const path = [];
        let currentTeamId = teamId;
        while (currentTeamId) {
            const team = await this.getTeam(currentTeamId);
            path.unshift(team);
            currentTeamId = team.team.parentTeamId;
        }
        return path;
    }
    async getTeamDescendants(teamId) {
        const descendants = [];
        const team = await this.getTeam(teamId);
        for (const childId of team.team.childTeams) {
            const child = await this.getTeam(childId);
            descendants.push(child);
            const childDescendants = await this.getTeamDescendants(childId);
            descendants.push(...childDescendants);
        }
        return descendants;
    }
    async setTeamPermission(permission) {
        return this.teamService.setTeamPermission(permission);
    }
    async getTeamMemberPermissions(teamId, userId) {
        return this.teamService.getTeamMemberPermissions(teamId, userId);
    }
    async inheritWorkspacePermissions(workspaceId, teamId) {
        const workspace = await this.workspaceTool.getWorkspaceDetails(workspaceId);
        const team = await this.getTeam(teamId);
        let permissionsInherited = 0;
        if (workspace.members) {
            for (const member of workspace.members) {
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
    async getTeamAnalytics(teamId) {
        return this.teamService.getTeamAnalytics(teamId);
    }
    async getUserTeams(workspaceId, userId) {
        return this.teamService.getUserTeams(workspaceId, userId);
    }
    async canUserPerformAction(teamId, userId, action) {
        return this.teamService.canUserPerformAction(teamId, userId, action);
    }
    async bulkTeamOperation(operation) {
        return this.teamService.bulkTeamOperation(operation);
    }
    async reorganizeTeams(moves) {
        const results = [];
        for (const move of moves) {
            try {
                await this.moveTeam(move.teamId, move.newParentTeamId);
                results.push({ teamId: move.teamId, success: true });
            }
            catch (error) {
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
    async validateTeamHierarchy(teamId, newParentTeamId) {
        if (!newParentTeamId)
            return;
        const descendants = await this.getTeamDescendants(teamId);
        const isCircular = descendants.some(desc => desc.team.id === newParentTeamId);
        if (isCircular) {
            throw new Error('Cannot move team: would create circular reference in hierarchy');
        }
        await this.getTeam(newParentTeamId);
    }
    async createChildTeams(parentTeamId, children, workspaceId, createdTeams) {
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
    mapWorkspaceRoleToTeamRole(workspaceRole) {
        const roleMap = {
            'owner': 'team_lead',
            'admin': 'team_lead',
            'member': 'member',
        };
        return roleMap[workspaceRole] || 'member';
    }
}
//# sourceMappingURL=team-manager.js.map
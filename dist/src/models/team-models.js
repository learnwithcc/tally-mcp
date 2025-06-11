import { z } from 'zod';
export const TeamRoleSchema = z.enum(['team_lead', 'member', 'contributor']);
export const TeamMemberSchema = z.object({
    id: z.string(),
    userId: z.string(),
    email: z.string().email(),
    name: z.string().optional(),
    role: TeamRoleSchema,
    joinedAt: z.string().datetime(),
    permissions: z.array(z.string()).default([]),
});
export const TeamSchema = z.object({
    id: z.string(),
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    workspaceId: z.string(),
    parentTeamId: z.string().optional(),
    members: z.array(TeamMemberSchema).default([]),
    childTeams: z.array(z.string()).default([]),
    settings: z.object({
        isPrivate: z.boolean().default(false),
        allowSelfJoin: z.boolean().default(false),
        maxMembers: z.number().positive().optional(),
        inheritPermissions: z.boolean().default(true),
    }).default({}),
    metadata: z.object({
        color: z.string().optional(),
        icon: z.string().optional(),
        tags: z.array(z.string()).default([]),
    }).default({}),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    createdBy: z.string(),
});
export const TeamHierarchyNodeSchema = z.object({
    team: TeamSchema,
    level: z.number().min(0),
    path: z.array(z.string()),
    hasChildren: z.boolean().default(false),
    childTeamIds: z.array(z.string()).default([]),
});
export const OrganizationStructureSchema = z.object({
    workspaceId: z.string(),
    teams: z.array(TeamHierarchyNodeSchema),
    totalTeams: z.number(),
    totalMembers: z.number(),
    maxDepth: z.number(),
    generatedAt: z.string().datetime(),
});
export const CreateTeamRequestSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    workspaceId: z.string(),
    parentTeamId: z.string().optional(),
    settings: z.object({
        isPrivate: z.boolean().default(false),
        allowSelfJoin: z.boolean().default(false),
        maxMembers: z.number().positive().optional(),
        inheritPermissions: z.boolean().default(true),
    }).optional(),
    metadata: z.object({
        color: z.string().optional(),
        icon: z.string().optional(),
        tags: z.array(z.string()).default([]),
    }).optional(),
    initialMembers: z.array(z.object({
        userId: z.string(),
        role: TeamRoleSchema.default('member'),
        permissions: z.array(z.string()).default([]),
    })).default([]).optional(),
});
export const UpdateTeamRequestSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    parentTeamId: z.string().optional(),
    settings: z.object({
        isPrivate: z.boolean().optional(),
        allowSelfJoin: z.boolean().optional(),
        maxMembers: z.number().positive().optional(),
        inheritPermissions: z.boolean().optional(),
    }).optional(),
    metadata: z.object({
        color: z.string().optional(),
        icon: z.string().optional(),
        tags: z.array(z.string()).optional(),
    }).optional(),
});
export const BulkTeamOperationSchema = z.object({
    operation: z.enum(['move', 'update_settings', 'add_members', 'remove_members']),
    teamIds: z.array(z.string()).min(1),
    data: z.record(z.any()),
});
export const TeamMembershipUpdateSchema = z.object({
    userId: z.string(),
    role: TeamRoleSchema.optional(),
    permissions: z.array(z.string()).optional(),
    action: z.enum(['add', 'update', 'remove']),
});
export const BulkMembershipUpdateSchema = z.object({
    teamId: z.string(),
    updates: z.array(TeamMembershipUpdateSchema),
});
export const TeamPermissionSchema = z.object({
    teamId: z.string(),
    resourceType: z.enum(['form', 'workspace', 'team', 'submission']),
    resourceId: z.string(),
    permissions: z.array(z.string()),
    inheritedFrom: z.string().optional(),
    grantedAt: z.string().datetime(),
    grantedBy: z.string(),
});
export const TeamAccessSummarySchema = z.object({
    teamId: z.string(),
    teamName: z.string(),
    directPermissions: z.array(TeamPermissionSchema),
    inheritedPermissions: z.array(TeamPermissionSchema),
    effectivePermissions: z.record(z.array(z.string())),
});
export const TeamAnalyticsSchema = z.object({
    teamId: z.string(),
    teamName: z.string(),
    memberCount: z.number(),
    childTeamCount: z.number(),
    formAccessCount: z.number(),
    activeMembers: z.number(),
    memberGrowth: z.object({
        daily: z.number(),
        weekly: z.number(),
        monthly: z.number(),
    }),
    permissionUsage: z.record(z.number()),
    lastActivity: z.string().datetime().optional(),
});
export const TeamResponseSchema = z.object({
    team: TeamSchema,
    memberCount: z.number(),
    childTeamCount: z.number(),
});
export const TeamListResponseSchema = z.object({
    teams: z.array(TeamResponseSchema),
    page: z.number().optional(),
    limit: z.number().optional(),
    hasMore: z.boolean().optional(),
    totalCount: z.number().optional(),
});
export const BulkOperationResponseSchema = z.object({
    success: z.boolean(),
    processedCount: z.number(),
    failedCount: z.number(),
    errors: z.array(z.object({
        teamId: z.string(),
        error: z.string(),
        code: z.string().optional(),
    })).optional(),
    results: z.array(z.object({
        teamId: z.string(),
        success: z.boolean(),
        data: z.any().optional(),
    })).optional(),
});
//# sourceMappingURL=team-models.js.map
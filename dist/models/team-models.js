"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkOperationResponseSchema = exports.TeamListResponseSchema = exports.TeamResponseSchema = exports.TeamAnalyticsSchema = exports.TeamAccessSummarySchema = exports.TeamPermissionSchema = exports.BulkMembershipUpdateSchema = exports.TeamMembershipUpdateSchema = exports.BulkTeamOperationSchema = exports.UpdateTeamRequestSchema = exports.CreateTeamRequestSchema = exports.OrganizationStructureSchema = exports.TeamHierarchyNodeSchema = exports.TeamSchema = exports.TeamMemberSchema = exports.TeamRoleSchema = void 0;
const zod_1 = require("zod");
exports.TeamRoleSchema = zod_1.z.enum(['team_lead', 'member', 'contributor']);
exports.TeamMemberSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string().optional(),
    role: exports.TeamRoleSchema,
    joinedAt: zod_1.z.string().datetime(),
    permissions: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.TeamSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional(),
    workspaceId: zod_1.z.string(),
    parentTeamId: zod_1.z.string().optional(),
    members: zod_1.z.array(exports.TeamMemberSchema).default([]),
    childTeams: zod_1.z.array(zod_1.z.string()).default([]),
    settings: zod_1.z.object({
        isPrivate: zod_1.z.boolean().default(false),
        allowSelfJoin: zod_1.z.boolean().default(false),
        maxMembers: zod_1.z.number().positive().optional(),
        inheritPermissions: zod_1.z.boolean().default(true),
    }).default({}),
    metadata: zod_1.z.object({
        color: zod_1.z.string().optional(),
        icon: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).default([]),
    }).default({}),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    createdBy: zod_1.z.string(),
});
exports.TeamHierarchyNodeSchema = zod_1.z.object({
    team: exports.TeamSchema,
    level: zod_1.z.number().min(0),
    path: zod_1.z.array(zod_1.z.string()),
    hasChildren: zod_1.z.boolean().default(false),
    childTeamIds: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.OrganizationStructureSchema = zod_1.z.object({
    workspaceId: zod_1.z.string(),
    teams: zod_1.z.array(exports.TeamHierarchyNodeSchema),
    totalTeams: zod_1.z.number(),
    totalMembers: zod_1.z.number(),
    maxDepth: zod_1.z.number(),
    generatedAt: zod_1.z.string().datetime(),
});
exports.CreateTeamRequestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional(),
    workspaceId: zod_1.z.string(),
    parentTeamId: zod_1.z.string().optional(),
    settings: zod_1.z.object({
        isPrivate: zod_1.z.boolean().default(false),
        allowSelfJoin: zod_1.z.boolean().default(false),
        maxMembers: zod_1.z.number().positive().optional(),
        inheritPermissions: zod_1.z.boolean().default(true),
    }).optional(),
    metadata: zod_1.z.object({
        color: zod_1.z.string().optional(),
        icon: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).default([]),
    }).optional(),
    initialMembers: zod_1.z.array(zod_1.z.object({
        userId: zod_1.z.string(),
        role: exports.TeamRoleSchema.default('member'),
        permissions: zod_1.z.array(zod_1.z.string()).default([]),
    })).default([]).optional(),
});
exports.UpdateTeamRequestSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().optional(),
    parentTeamId: zod_1.z.string().optional(),
    settings: zod_1.z.object({
        isPrivate: zod_1.z.boolean().optional(),
        allowSelfJoin: zod_1.z.boolean().optional(),
        maxMembers: zod_1.z.number().positive().optional(),
        inheritPermissions: zod_1.z.boolean().optional(),
    }).optional(),
    metadata: zod_1.z.object({
        color: zod_1.z.string().optional(),
        icon: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
});
exports.BulkTeamOperationSchema = zod_1.z.object({
    operation: zod_1.z.enum(['move', 'update_settings', 'add_members', 'remove_members']),
    teamIds: zod_1.z.array(zod_1.z.string()).min(1),
    data: zod_1.z.record(zod_1.z.any()),
});
exports.TeamMembershipUpdateSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    role: exports.TeamRoleSchema.optional(),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    action: zod_1.z.enum(['add', 'update', 'remove']),
});
exports.BulkMembershipUpdateSchema = zod_1.z.object({
    teamId: zod_1.z.string(),
    updates: zod_1.z.array(exports.TeamMembershipUpdateSchema),
});
exports.TeamPermissionSchema = zod_1.z.object({
    teamId: zod_1.z.string(),
    resourceType: zod_1.z.enum(['form', 'workspace', 'team', 'submission']),
    resourceId: zod_1.z.string(),
    permissions: zod_1.z.array(zod_1.z.string()),
    inheritedFrom: zod_1.z.string().optional(),
    grantedAt: zod_1.z.string().datetime(),
    grantedBy: zod_1.z.string(),
});
exports.TeamAccessSummarySchema = zod_1.z.object({
    teamId: zod_1.z.string(),
    teamName: zod_1.z.string(),
    directPermissions: zod_1.z.array(exports.TeamPermissionSchema),
    inheritedPermissions: zod_1.z.array(exports.TeamPermissionSchema),
    effectivePermissions: zod_1.z.record(zod_1.z.array(zod_1.z.string())),
});
exports.TeamAnalyticsSchema = zod_1.z.object({
    teamId: zod_1.z.string(),
    teamName: zod_1.z.string(),
    memberCount: zod_1.z.number(),
    childTeamCount: zod_1.z.number(),
    formAccessCount: zod_1.z.number(),
    activeMembers: zod_1.z.number(),
    memberGrowth: zod_1.z.object({
        daily: zod_1.z.number(),
        weekly: zod_1.z.number(),
        monthly: zod_1.z.number(),
    }),
    permissionUsage: zod_1.z.record(zod_1.z.number()),
    lastActivity: zod_1.z.string().datetime().optional(),
});
exports.TeamResponseSchema = zod_1.z.object({
    team: exports.TeamSchema,
    memberCount: zod_1.z.number(),
    childTeamCount: zod_1.z.number(),
});
exports.TeamListResponseSchema = zod_1.z.object({
    teams: zod_1.z.array(exports.TeamResponseSchema),
    page: zod_1.z.number().optional(),
    limit: zod_1.z.number().optional(),
    hasMore: zod_1.z.boolean().optional(),
    totalCount: zod_1.z.number().optional(),
});
exports.BulkOperationResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    processedCount: zod_1.z.number(),
    failedCount: zod_1.z.number(),
    errors: zod_1.z.array(zod_1.z.object({
        teamId: zod_1.z.string(),
        error: zod_1.z.string(),
        code: zod_1.z.string().optional(),
    })).optional(),
    results: zod_1.z.array(zod_1.z.object({
        teamId: zod_1.z.string(),
        success: zod_1.z.boolean(),
        data: zod_1.z.any().optional(),
    })).optional(),
});
//# sourceMappingURL=team-models.js.map
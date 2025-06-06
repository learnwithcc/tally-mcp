import { z } from 'zod';

// Base team hierarchy types
export const TeamRoleSchema = z.enum(['team_lead', 'member', 'contributor']);

export const TeamMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  role: TeamRoleSchema,
  joinedAt: z.string().datetime(),
  permissions: z.array(z.string()).default([]), // Additional permissions beyond role
});

export const TeamSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  workspaceId: z.string(),
  parentTeamId: z.string().optional(), // For nested teams
  members: z.array(TeamMemberSchema).default([]),
  childTeams: z.array(z.string()).default([]), // Child team IDs
  settings: z.object({
    isPrivate: z.boolean().default(false),
    allowSelfJoin: z.boolean().default(false),
    maxMembers: z.number().positive().optional(),
    inheritPermissions: z.boolean().default(true),
  }).default({}),
  metadata: z.object({
    color: z.string().optional(), // For UI representation
    icon: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string(),
});

// Team hierarchy and organization charts (simplified for now)
export const TeamHierarchyNodeSchema = z.object({
  team: TeamSchema,
  level: z.number().min(0),
  path: z.array(z.string()), // Array of team IDs from root to this node
  hasChildren: z.boolean().default(false),
  childTeamIds: z.array(z.string()).default([]),
});

export const OrganizationStructureSchema = z.object({
  workspaceId: z.string(),
  teams: z.array(TeamHierarchyNodeSchema), // All teams with their hierarchy info
  totalTeams: z.number(),
  totalMembers: z.number(),
  maxDepth: z.number(),
  generatedAt: z.string().datetime(),
});

// Team operations and bulk actions
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
  data: z.record(z.any()), // Operation-specific data
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

// Team permissions and access control
export const TeamPermissionSchema = z.object({
  teamId: z.string(),
  resourceType: z.enum(['form', 'workspace', 'team', 'submission']),
  resourceId: z.string(),
  permissions: z.array(z.string()),
  inheritedFrom: z.string().optional(), // Parent team or workspace ID
  grantedAt: z.string().datetime(),
  grantedBy: z.string(),
});

export const TeamAccessSummarySchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
  directPermissions: z.array(TeamPermissionSchema),
  inheritedPermissions: z.array(TeamPermissionSchema),
  effectivePermissions: z.record(z.array(z.string())), // resourceType -> permissions
});

// Team analytics and insights
export const TeamAnalyticsSchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
  memberCount: z.number(),
  childTeamCount: z.number(),
  formAccessCount: z.number(),
  activeMembers: z.number(), // Members active in last 30 days
  memberGrowth: z.object({
    daily: z.number(),
    weekly: z.number(),
    monthly: z.number(),
  }),
  permissionUsage: z.record(z.number()), // permission -> usage count
  lastActivity: z.string().datetime().optional(),
});

// Response schemas
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

// Type exports
export type TeamRole = z.infer<typeof TeamRoleSchema>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type TeamHierarchyNode = z.infer<typeof TeamHierarchyNodeSchema>;
export type OrganizationStructure = z.infer<typeof OrganizationStructureSchema>;
export type CreateTeamRequest = z.infer<typeof CreateTeamRequestSchema>;
export type UpdateTeamRequest = z.infer<typeof UpdateTeamRequestSchema>;
export type BulkTeamOperation = z.infer<typeof BulkTeamOperationSchema>;
export type TeamMembershipUpdate = z.infer<typeof TeamMembershipUpdateSchema>;
export type BulkMembershipUpdate = z.infer<typeof BulkMembershipUpdateSchema>;
export type TeamPermission = z.infer<typeof TeamPermissionSchema>;
export type TeamAccessSummary = z.infer<typeof TeamAccessSummarySchema>;
export type TeamAnalytics = z.infer<typeof TeamAnalyticsSchema>;
export type TeamResponse = z.infer<typeof TeamResponseSchema>;
export type TeamListResponse = z.infer<typeof TeamListResponseSchema>;
export type BulkOperationResponse = z.infer<typeof BulkOperationResponseSchema>; 
import { z } from 'zod';
export declare const TeamRoleSchema: z.ZodEnum<["team_lead", "member", "contributor"]>;
export declare const TeamMemberSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    email: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodEnum<["team_lead", "member", "contributor"]>;
    joinedAt: z.ZodString;
    permissions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    role: "member" | "team_lead" | "contributor";
    id: string;
    userId: string;
    email: string;
    joinedAt: string;
    permissions: string[];
    name?: string | undefined;
}, {
    role: "member" | "team_lead" | "contributor";
    id: string;
    userId: string;
    email: string;
    joinedAt: string;
    name?: string | undefined;
    permissions?: string[] | undefined;
}>;
export declare const TeamSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodString;
    parentTeamId: z.ZodOptional<z.ZodString>;
    members: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        role: z.ZodEnum<["team_lead", "member", "contributor"]>;
        joinedAt: z.ZodString;
        permissions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        role: "member" | "team_lead" | "contributor";
        id: string;
        userId: string;
        email: string;
        joinedAt: string;
        permissions: string[];
        name?: string | undefined;
    }, {
        role: "member" | "team_lead" | "contributor";
        id: string;
        userId: string;
        email: string;
        joinedAt: string;
        name?: string | undefined;
        permissions?: string[] | undefined;
    }>, "many">>;
    childTeams: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    settings: z.ZodDefault<z.ZodObject<{
        isPrivate: z.ZodDefault<z.ZodBoolean>;
        allowSelfJoin: z.ZodDefault<z.ZodBoolean>;
        maxMembers: z.ZodOptional<z.ZodNumber>;
        inheritPermissions: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isPrivate: boolean;
        allowSelfJoin: boolean;
        inheritPermissions: boolean;
        maxMembers?: number | undefined;
    }, {
        isPrivate?: boolean | undefined;
        allowSelfJoin?: boolean | undefined;
        maxMembers?: number | undefined;
        inheritPermissions?: boolean | undefined;
    }>>;
    metadata: z.ZodDefault<z.ZodObject<{
        color: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        tags: string[];
        color?: string | undefined;
        icon?: string | undefined;
    }, {
        tags?: string[] | undefined;
        color?: string | undefined;
        icon?: string | undefined;
    }>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    createdBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    metadata: {
        tags: string[];
        color?: string | undefined;
        icon?: string | undefined;
    };
    id: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    workspaceId: string;
    members: {
        role: "member" | "team_lead" | "contributor";
        id: string;
        userId: string;
        email: string;
        joinedAt: string;
        permissions: string[];
        name?: string | undefined;
    }[];
    settings: {
        isPrivate: boolean;
        allowSelfJoin: boolean;
        inheritPermissions: boolean;
        maxMembers?: number | undefined;
    };
    childTeams: string[];
    description?: string | undefined;
    parentTeamId?: string | undefined;
}, {
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    workspaceId: string;
    description?: string | undefined;
    metadata?: {
        tags?: string[] | undefined;
        color?: string | undefined;
        icon?: string | undefined;
    } | undefined;
    members?: {
        role: "member" | "team_lead" | "contributor";
        id: string;
        userId: string;
        email: string;
        joinedAt: string;
        name?: string | undefined;
        permissions?: string[] | undefined;
    }[] | undefined;
    settings?: {
        isPrivate?: boolean | undefined;
        allowSelfJoin?: boolean | undefined;
        maxMembers?: number | undefined;
        inheritPermissions?: boolean | undefined;
    } | undefined;
    parentTeamId?: string | undefined;
    childTeams?: string[] | undefined;
}>;
export declare const TeamHierarchyNodeSchema: z.ZodObject<{
    team: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        workspaceId: z.ZodString;
        parentTeamId: z.ZodOptional<z.ZodString>;
        members: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            userId: z.ZodString;
            email: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
            role: z.ZodEnum<["team_lead", "member", "contributor"]>;
            joinedAt: z.ZodString;
            permissions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            role: "member" | "team_lead" | "contributor";
            id: string;
            userId: string;
            email: string;
            joinedAt: string;
            permissions: string[];
            name?: string | undefined;
        }, {
            role: "member" | "team_lead" | "contributor";
            id: string;
            userId: string;
            email: string;
            joinedAt: string;
            name?: string | undefined;
            permissions?: string[] | undefined;
        }>, "many">>;
        childTeams: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        settings: z.ZodDefault<z.ZodObject<{
            isPrivate: z.ZodDefault<z.ZodBoolean>;
            allowSelfJoin: z.ZodDefault<z.ZodBoolean>;
            maxMembers: z.ZodOptional<z.ZodNumber>;
            inheritPermissions: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            isPrivate: boolean;
            allowSelfJoin: boolean;
            inheritPermissions: boolean;
            maxMembers?: number | undefined;
        }, {
            isPrivate?: boolean | undefined;
            allowSelfJoin?: boolean | undefined;
            maxMembers?: number | undefined;
            inheritPermissions?: boolean | undefined;
        }>>;
        metadata: z.ZodDefault<z.ZodObject<{
            color: z.ZodOptional<z.ZodString>;
            icon: z.ZodOptional<z.ZodString>;
            tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            tags: string[];
            color?: string | undefined;
            icon?: string | undefined;
        }, {
            tags?: string[] | undefined;
            color?: string | undefined;
            icon?: string | undefined;
        }>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        createdBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        metadata: {
            tags: string[];
            color?: string | undefined;
            icon?: string | undefined;
        };
        id: string;
        createdAt: string;
        updatedAt: string;
        createdBy: string;
        workspaceId: string;
        members: {
            role: "member" | "team_lead" | "contributor";
            id: string;
            userId: string;
            email: string;
            joinedAt: string;
            permissions: string[];
            name?: string | undefined;
        }[];
        settings: {
            isPrivate: boolean;
            allowSelfJoin: boolean;
            inheritPermissions: boolean;
            maxMembers?: number | undefined;
        };
        childTeams: string[];
        description?: string | undefined;
        parentTeamId?: string | undefined;
    }, {
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        createdBy: string;
        workspaceId: string;
        description?: string | undefined;
        metadata?: {
            tags?: string[] | undefined;
            color?: string | undefined;
            icon?: string | undefined;
        } | undefined;
        members?: {
            role: "member" | "team_lead" | "contributor";
            id: string;
            userId: string;
            email: string;
            joinedAt: string;
            name?: string | undefined;
            permissions?: string[] | undefined;
        }[] | undefined;
        settings?: {
            isPrivate?: boolean | undefined;
            allowSelfJoin?: boolean | undefined;
            maxMembers?: number | undefined;
            inheritPermissions?: boolean | undefined;
        } | undefined;
        parentTeamId?: string | undefined;
        childTeams?: string[] | undefined;
    }>;
    level: z.ZodNumber;
    path: z.ZodArray<z.ZodString, "many">;
    hasChildren: z.ZodDefault<z.ZodBoolean>;
    childTeamIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    level: number;
    path: string[];
    team: {
        name: string;
        metadata: {
            tags: string[];
            color?: string | undefined;
            icon?: string | undefined;
        };
        id: string;
        createdAt: string;
        updatedAt: string;
        createdBy: string;
        workspaceId: string;
        members: {
            role: "member" | "team_lead" | "contributor";
            id: string;
            userId: string;
            email: string;
            joinedAt: string;
            permissions: string[];
            name?: string | undefined;
        }[];
        settings: {
            isPrivate: boolean;
            allowSelfJoin: boolean;
            inheritPermissions: boolean;
            maxMembers?: number | undefined;
        };
        childTeams: string[];
        description?: string | undefined;
        parentTeamId?: string | undefined;
    };
    hasChildren: boolean;
    childTeamIds: string[];
}, {
    level: number;
    path: string[];
    team: {
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        createdBy: string;
        workspaceId: string;
        description?: string | undefined;
        metadata?: {
            tags?: string[] | undefined;
            color?: string | undefined;
            icon?: string | undefined;
        } | undefined;
        members?: {
            role: "member" | "team_lead" | "contributor";
            id: string;
            userId: string;
            email: string;
            joinedAt: string;
            name?: string | undefined;
            permissions?: string[] | undefined;
        }[] | undefined;
        settings?: {
            isPrivate?: boolean | undefined;
            allowSelfJoin?: boolean | undefined;
            maxMembers?: number | undefined;
            inheritPermissions?: boolean | undefined;
        } | undefined;
        parentTeamId?: string | undefined;
        childTeams?: string[] | undefined;
    };
    hasChildren?: boolean | undefined;
    childTeamIds?: string[] | undefined;
}>;
export declare const OrganizationStructureSchema: z.ZodObject<{
    workspaceId: z.ZodString;
    teams: z.ZodArray<z.ZodObject<{
        team: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            workspaceId: z.ZodString;
            parentTeamId: z.ZodOptional<z.ZodString>;
            members: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                userId: z.ZodString;
                email: z.ZodString;
                name: z.ZodOptional<z.ZodString>;
                role: z.ZodEnum<["team_lead", "member", "contributor"]>;
                joinedAt: z.ZodString;
                permissions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                role: "member" | "team_lead" | "contributor";
                id: string;
                userId: string;
                email: string;
                joinedAt: string;
                permissions: string[];
                name?: string | undefined;
            }, {
                role: "member" | "team_lead" | "contributor";
                id: string;
                userId: string;
                email: string;
                joinedAt: string;
                name?: string | undefined;
                permissions?: string[] | undefined;
            }>, "many">>;
            childTeams: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            settings: z.ZodDefault<z.ZodObject<{
                isPrivate: z.ZodDefault<z.ZodBoolean>;
                allowSelfJoin: z.ZodDefault<z.ZodBoolean>;
                maxMembers: z.ZodOptional<z.ZodNumber>;
                inheritPermissions: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                isPrivate: boolean;
                allowSelfJoin: boolean;
                inheritPermissions: boolean;
                maxMembers?: number | undefined;
            }, {
                isPrivate?: boolean | undefined;
                allowSelfJoin?: boolean | undefined;
                maxMembers?: number | undefined;
                inheritPermissions?: boolean | undefined;
            }>>;
            metadata: z.ZodDefault<z.ZodObject<{
                color: z.ZodOptional<z.ZodString>;
                icon: z.ZodOptional<z.ZodString>;
                tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                tags: string[];
                color?: string | undefined;
                icon?: string | undefined;
            }, {
                tags?: string[] | undefined;
                color?: string | undefined;
                icon?: string | undefined;
            }>>;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
            createdBy: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            metadata: {
                tags: string[];
                color?: string | undefined;
                icon?: string | undefined;
            };
            id: string;
            createdAt: string;
            updatedAt: string;
            createdBy: string;
            workspaceId: string;
            members: {
                role: "member" | "team_lead" | "contributor";
                id: string;
                userId: string;
                email: string;
                joinedAt: string;
                permissions: string[];
                name?: string | undefined;
            }[];
            settings: {
                isPrivate: boolean;
                allowSelfJoin: boolean;
                inheritPermissions: boolean;
                maxMembers?: number | undefined;
            };
            childTeams: string[];
            description?: string | undefined;
            parentTeamId?: string | undefined;
        }, {
            name: string;
            id: string;
            createdAt: string;
            updatedAt: string;
            createdBy: string;
            workspaceId: string;
            description?: string | undefined;
            metadata?: {
                tags?: string[] | undefined;
                color?: string | undefined;
                icon?: string | undefined;
            } | undefined;
            members?: {
                role: "member" | "team_lead" | "contributor";
                id: string;
                userId: string;
                email: string;
                joinedAt: string;
                name?: string | undefined;
                permissions?: string[] | undefined;
            }[] | undefined;
            settings?: {
                isPrivate?: boolean | undefined;
                allowSelfJoin?: boolean | undefined;
                maxMembers?: number | undefined;
                inheritPermissions?: boolean | undefined;
            } | undefined;
            parentTeamId?: string | undefined;
            childTeams?: string[] | undefined;
        }>;
        level: z.ZodNumber;
        path: z.ZodArray<z.ZodString, "many">;
        hasChildren: z.ZodDefault<z.ZodBoolean>;
        childTeamIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        level: number;
        path: string[];
        team: {
            name: string;
            metadata: {
                tags: string[];
                color?: string | undefined;
                icon?: string | undefined;
            };
            id: string;
            createdAt: string;
            updatedAt: string;
            createdBy: string;
            workspaceId: string;
            members: {
                role: "member" | "team_lead" | "contributor";
                id: string;
                userId: string;
                email: string;
                joinedAt: string;
                permissions: string[];
                name?: string | undefined;
            }[];
            settings: {
                isPrivate: boolean;
                allowSelfJoin: boolean;
                inheritPermissions: boolean;
                maxMembers?: number | undefined;
            };
            childTeams: string[];
            description?: string | undefined;
            parentTeamId?: string | undefined;
        };
        hasChildren: boolean;
        childTeamIds: string[];
    }, {
        level: number;
        path: string[];
        team: {
            name: string;
            id: string;
            createdAt: string;
            updatedAt: string;
            createdBy: string;
            workspaceId: string;
            description?: string | undefined;
            metadata?: {
                tags?: string[] | undefined;
                color?: string | undefined;
                icon?: string | undefined;
            } | undefined;
            members?: {
                role: "member" | "team_lead" | "contributor";
                id: string;
                userId: string;
                email: string;
                joinedAt: string;
                name?: string | undefined;
                permissions?: string[] | undefined;
            }[] | undefined;
            settings?: {
                isPrivate?: boolean | undefined;
                allowSelfJoin?: boolean | undefined;
                maxMembers?: number | undefined;
                inheritPermissions?: boolean | undefined;
            } | undefined;
            parentTeamId?: string | undefined;
            childTeams?: string[] | undefined;
        };
        hasChildren?: boolean | undefined;
        childTeamIds?: string[] | undefined;
    }>, "many">;
    totalTeams: z.ZodNumber;
    totalMembers: z.ZodNumber;
    maxDepth: z.ZodNumber;
    generatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    workspaceId: string;
    teams: {
        level: number;
        path: string[];
        team: {
            name: string;
            metadata: {
                tags: string[];
                color?: string | undefined;
                icon?: string | undefined;
            };
            id: string;
            createdAt: string;
            updatedAt: string;
            createdBy: string;
            workspaceId: string;
            members: {
                role: "member" | "team_lead" | "contributor";
                id: string;
                userId: string;
                email: string;
                joinedAt: string;
                permissions: string[];
                name?: string | undefined;
            }[];
            settings: {
                isPrivate: boolean;
                allowSelfJoin: boolean;
                inheritPermissions: boolean;
                maxMembers?: number | undefined;
            };
            childTeams: string[];
            description?: string | undefined;
            parentTeamId?: string | undefined;
        };
        hasChildren: boolean;
        childTeamIds: string[];
    }[];
    totalTeams: number;
    totalMembers: number;
    maxDepth: number;
    generatedAt: string;
}, {
    workspaceId: string;
    teams: {
        level: number;
        path: string[];
        team: {
            name: string;
            id: string;
            createdAt: string;
            updatedAt: string;
            createdBy: string;
            workspaceId: string;
            description?: string | undefined;
            metadata?: {
                tags?: string[] | undefined;
                color?: string | undefined;
                icon?: string | undefined;
            } | undefined;
            members?: {
                role: "member" | "team_lead" | "contributor";
                id: string;
                userId: string;
                email: string;
                joinedAt: string;
                name?: string | undefined;
                permissions?: string[] | undefined;
            }[] | undefined;
            settings?: {
                isPrivate?: boolean | undefined;
                allowSelfJoin?: boolean | undefined;
                maxMembers?: number | undefined;
                inheritPermissions?: boolean | undefined;
            } | undefined;
            parentTeamId?: string | undefined;
            childTeams?: string[] | undefined;
        };
        hasChildren?: boolean | undefined;
        childTeamIds?: string[] | undefined;
    }[];
    totalTeams: number;
    totalMembers: number;
    maxDepth: number;
    generatedAt: string;
}>;
export declare const CreateTeamRequestSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodString;
    parentTeamId: z.ZodOptional<z.ZodString>;
    settings: z.ZodOptional<z.ZodObject<{
        isPrivate: z.ZodDefault<z.ZodBoolean>;
        allowSelfJoin: z.ZodDefault<z.ZodBoolean>;
        maxMembers: z.ZodOptional<z.ZodNumber>;
        inheritPermissions: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isPrivate: boolean;
        allowSelfJoin: boolean;
        inheritPermissions: boolean;
        maxMembers?: number | undefined;
    }, {
        isPrivate?: boolean | undefined;
        allowSelfJoin?: boolean | undefined;
        maxMembers?: number | undefined;
        inheritPermissions?: boolean | undefined;
    }>>;
    metadata: z.ZodOptional<z.ZodObject<{
        color: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        tags: string[];
        color?: string | undefined;
        icon?: string | undefined;
    }, {
        tags?: string[] | undefined;
        color?: string | undefined;
        icon?: string | undefined;
    }>>;
    initialMembers: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        role: z.ZodDefault<z.ZodEnum<["team_lead", "member", "contributor"]>>;
        permissions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        role: "member" | "team_lead" | "contributor";
        userId: string;
        permissions: string[];
    }, {
        userId: string;
        role?: "member" | "team_lead" | "contributor" | undefined;
        permissions?: string[] | undefined;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    workspaceId: string;
    description?: string | undefined;
    metadata?: {
        tags: string[];
        color?: string | undefined;
        icon?: string | undefined;
    } | undefined;
    settings?: {
        isPrivate: boolean;
        allowSelfJoin: boolean;
        inheritPermissions: boolean;
        maxMembers?: number | undefined;
    } | undefined;
    parentTeamId?: string | undefined;
    initialMembers?: {
        role: "member" | "team_lead" | "contributor";
        userId: string;
        permissions: string[];
    }[] | undefined;
}, {
    name: string;
    workspaceId: string;
    description?: string | undefined;
    metadata?: {
        tags?: string[] | undefined;
        color?: string | undefined;
        icon?: string | undefined;
    } | undefined;
    settings?: {
        isPrivate?: boolean | undefined;
        allowSelfJoin?: boolean | undefined;
        maxMembers?: number | undefined;
        inheritPermissions?: boolean | undefined;
    } | undefined;
    parentTeamId?: string | undefined;
    initialMembers?: {
        userId: string;
        role?: "member" | "team_lead" | "contributor" | undefined;
        permissions?: string[] | undefined;
    }[] | undefined;
}>;
export declare const UpdateTeamRequestSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    parentTeamId: z.ZodOptional<z.ZodString>;
    settings: z.ZodOptional<z.ZodObject<{
        isPrivate: z.ZodOptional<z.ZodBoolean>;
        allowSelfJoin: z.ZodOptional<z.ZodBoolean>;
        maxMembers: z.ZodOptional<z.ZodNumber>;
        inheritPermissions: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isPrivate?: boolean | undefined;
        allowSelfJoin?: boolean | undefined;
        maxMembers?: number | undefined;
        inheritPermissions?: boolean | undefined;
    }, {
        isPrivate?: boolean | undefined;
        allowSelfJoin?: boolean | undefined;
        maxMembers?: number | undefined;
        inheritPermissions?: boolean | undefined;
    }>>;
    metadata: z.ZodOptional<z.ZodObject<{
        color: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        tags?: string[] | undefined;
        color?: string | undefined;
        icon?: string | undefined;
    }, {
        tags?: string[] | undefined;
        color?: string | undefined;
        icon?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    metadata?: {
        tags?: string[] | undefined;
        color?: string | undefined;
        icon?: string | undefined;
    } | undefined;
    settings?: {
        isPrivate?: boolean | undefined;
        allowSelfJoin?: boolean | undefined;
        maxMembers?: number | undefined;
        inheritPermissions?: boolean | undefined;
    } | undefined;
    parentTeamId?: string | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    metadata?: {
        tags?: string[] | undefined;
        color?: string | undefined;
        icon?: string | undefined;
    } | undefined;
    settings?: {
        isPrivate?: boolean | undefined;
        allowSelfJoin?: boolean | undefined;
        maxMembers?: number | undefined;
        inheritPermissions?: boolean | undefined;
    } | undefined;
    parentTeamId?: string | undefined;
}>;
export declare const BulkTeamOperationSchema: z.ZodObject<{
    operation: z.ZodEnum<["move", "update_settings", "add_members", "remove_members"]>;
    teamIds: z.ZodArray<z.ZodString, "many">;
    data: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    data: Record<string, any>;
    operation: "move" | "update_settings" | "add_members" | "remove_members";
    teamIds: string[];
}, {
    data: Record<string, any>;
    operation: "move" | "update_settings" | "add_members" | "remove_members";
    teamIds: string[];
}>;
export declare const TeamMembershipUpdateSchema: z.ZodObject<{
    userId: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["team_lead", "member", "contributor"]>>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    action: z.ZodEnum<["add", "update", "remove"]>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    action: "add" | "update" | "remove";
    role?: "member" | "team_lead" | "contributor" | undefined;
    permissions?: string[] | undefined;
}, {
    userId: string;
    action: "add" | "update" | "remove";
    role?: "member" | "team_lead" | "contributor" | undefined;
    permissions?: string[] | undefined;
}>;
export declare const BulkMembershipUpdateSchema: z.ZodObject<{
    teamId: z.ZodString;
    updates: z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        role: z.ZodOptional<z.ZodEnum<["team_lead", "member", "contributor"]>>;
        permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        action: z.ZodEnum<["add", "update", "remove"]>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        action: "add" | "update" | "remove";
        role?: "member" | "team_lead" | "contributor" | undefined;
        permissions?: string[] | undefined;
    }, {
        userId: string;
        action: "add" | "update" | "remove";
        role?: "member" | "team_lead" | "contributor" | undefined;
        permissions?: string[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    teamId: string;
    updates: {
        userId: string;
        action: "add" | "update" | "remove";
        role?: "member" | "team_lead" | "contributor" | undefined;
        permissions?: string[] | undefined;
    }[];
}, {
    teamId: string;
    updates: {
        userId: string;
        action: "add" | "update" | "remove";
        role?: "member" | "team_lead" | "contributor" | undefined;
        permissions?: string[] | undefined;
    }[];
}>;
export declare const TeamPermissionSchema: z.ZodObject<{
    teamId: z.ZodString;
    resourceType: z.ZodEnum<["form", "workspace", "team", "submission"]>;
    resourceId: z.ZodString;
    permissions: z.ZodArray<z.ZodString, "many">;
    inheritedFrom: z.ZodOptional<z.ZodString>;
    grantedAt: z.ZodString;
    grantedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    grantedAt: string;
    grantedBy: string;
    permissions: string[];
    teamId: string;
    resourceType: "team" | "form" | "workspace" | "submission";
    resourceId: string;
    inheritedFrom?: string | undefined;
}, {
    grantedAt: string;
    grantedBy: string;
    permissions: string[];
    teamId: string;
    resourceType: "team" | "form" | "workspace" | "submission";
    resourceId: string;
    inheritedFrom?: string | undefined;
}>;
export declare const TeamAccessSummarySchema: z.ZodObject<{
    teamId: z.ZodString;
    teamName: z.ZodString;
    directPermissions: z.ZodArray<z.ZodObject<{
        teamId: z.ZodString;
        resourceType: z.ZodEnum<["form", "workspace", "team", "submission"]>;
        resourceId: z.ZodString;
        permissions: z.ZodArray<z.ZodString, "many">;
        inheritedFrom: z.ZodOptional<z.ZodString>;
        grantedAt: z.ZodString;
        grantedBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        grantedAt: string;
        grantedBy: string;
        permissions: string[];
        teamId: string;
        resourceType: "team" | "form" | "workspace" | "submission";
        resourceId: string;
        inheritedFrom?: string | undefined;
    }, {
        grantedAt: string;
        grantedBy: string;
        permissions: string[];
        teamId: string;
        resourceType: "team" | "form" | "workspace" | "submission";
        resourceId: string;
        inheritedFrom?: string | undefined;
    }>, "many">;
    inheritedPermissions: z.ZodArray<z.ZodObject<{
        teamId: z.ZodString;
        resourceType: z.ZodEnum<["form", "workspace", "team", "submission"]>;
        resourceId: z.ZodString;
        permissions: z.ZodArray<z.ZodString, "many">;
        inheritedFrom: z.ZodOptional<z.ZodString>;
        grantedAt: z.ZodString;
        grantedBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        grantedAt: string;
        grantedBy: string;
        permissions: string[];
        teamId: string;
        resourceType: "team" | "form" | "workspace" | "submission";
        resourceId: string;
        inheritedFrom?: string | undefined;
    }, {
        grantedAt: string;
        grantedBy: string;
        permissions: string[];
        teamId: string;
        resourceType: "team" | "form" | "workspace" | "submission";
        resourceId: string;
        inheritedFrom?: string | undefined;
    }>, "many">;
    effectivePermissions: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    teamId: string;
    teamName: string;
    directPermissions: {
        grantedAt: string;
        grantedBy: string;
        permissions: string[];
        teamId: string;
        resourceType: "team" | "form" | "workspace" | "submission";
        resourceId: string;
        inheritedFrom?: string | undefined;
    }[];
    inheritedPermissions: {
        grantedAt: string;
        grantedBy: string;
        permissions: string[];
        teamId: string;
        resourceType: "team" | "form" | "workspace" | "submission";
        resourceId: string;
        inheritedFrom?: string | undefined;
    }[];
    effectivePermissions: Record<string, string[]>;
}, {
    teamId: string;
    teamName: string;
    directPermissions: {
        grantedAt: string;
        grantedBy: string;
        permissions: string[];
        teamId: string;
        resourceType: "team" | "form" | "workspace" | "submission";
        resourceId: string;
        inheritedFrom?: string | undefined;
    }[];
    inheritedPermissions: {
        grantedAt: string;
        grantedBy: string;
        permissions: string[];
        teamId: string;
        resourceType: "team" | "form" | "workspace" | "submission";
        resourceId: string;
        inheritedFrom?: string | undefined;
    }[];
    effectivePermissions: Record<string, string[]>;
}>;
export declare const TeamAnalyticsSchema: z.ZodObject<{
    teamId: z.ZodString;
    teamName: z.ZodString;
    memberCount: z.ZodNumber;
    childTeamCount: z.ZodNumber;
    formAccessCount: z.ZodNumber;
    activeMembers: z.ZodNumber;
    memberGrowth: z.ZodObject<{
        daily: z.ZodNumber;
        weekly: z.ZodNumber;
        monthly: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        daily: number;
        weekly: number;
        monthly: number;
    }, {
        daily: number;
        weekly: number;
        monthly: number;
    }>;
    permissionUsage: z.ZodRecord<z.ZodString, z.ZodNumber>;
    lastActivity: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    teamId: string;
    teamName: string;
    memberCount: number;
    childTeamCount: number;
    formAccessCount: number;
    activeMembers: number;
    memberGrowth: {
        daily: number;
        weekly: number;
        monthly: number;
    };
    permissionUsage: Record<string, number>;
    lastActivity?: string | undefined;
}, {
    teamId: string;
    teamName: string;
    memberCount: number;
    childTeamCount: number;
    formAccessCount: number;
    activeMembers: number;
    memberGrowth: {
        daily: number;
        weekly: number;
        monthly: number;
    };
    permissionUsage: Record<string, number>;
    lastActivity?: string | undefined;
}>;
export declare const TeamResponseSchema: z.ZodObject<{
    team: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        workspaceId: z.ZodString;
        parentTeamId: z.ZodOptional<z.ZodString>;
        members: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            userId: z.ZodString;
            email: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
            role: z.ZodEnum<["team_lead", "member", "contributor"]>;
            joinedAt: z.ZodString;
            permissions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            role: "member" | "team_lead" | "contributor";
            id: string;
            userId: string;
            email: string;
            joinedAt: string;
            permissions: string[];
            name?: string | undefined;
        }, {
            role: "member" | "team_lead" | "contributor";
            id: string;
            userId: string;
            email: string;
            joinedAt: string;
            name?: string | undefined;
            permissions?: string[] | undefined;
        }>, "many">>;
        childTeams: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        settings: z.ZodDefault<z.ZodObject<{
            isPrivate: z.ZodDefault<z.ZodBoolean>;
            allowSelfJoin: z.ZodDefault<z.ZodBoolean>;
            maxMembers: z.ZodOptional<z.ZodNumber>;
            inheritPermissions: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            isPrivate: boolean;
            allowSelfJoin: boolean;
            inheritPermissions: boolean;
            maxMembers?: number | undefined;
        }, {
            isPrivate?: boolean | undefined;
            allowSelfJoin?: boolean | undefined;
            maxMembers?: number | undefined;
            inheritPermissions?: boolean | undefined;
        }>>;
        metadata: z.ZodDefault<z.ZodObject<{
            color: z.ZodOptional<z.ZodString>;
            icon: z.ZodOptional<z.ZodString>;
            tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            tags: string[];
            color?: string | undefined;
            icon?: string | undefined;
        }, {
            tags?: string[] | undefined;
            color?: string | undefined;
            icon?: string | undefined;
        }>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        createdBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        metadata: {
            tags: string[];
            color?: string | undefined;
            icon?: string | undefined;
        };
        id: string;
        createdAt: string;
        updatedAt: string;
        createdBy: string;
        workspaceId: string;
        members: {
            role: "member" | "team_lead" | "contributor";
            id: string;
            userId: string;
            email: string;
            joinedAt: string;
            permissions: string[];
            name?: string | undefined;
        }[];
        settings: {
            isPrivate: boolean;
            allowSelfJoin: boolean;
            inheritPermissions: boolean;
            maxMembers?: number | undefined;
        };
        childTeams: string[];
        description?: string | undefined;
        parentTeamId?: string | undefined;
    }, {
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        createdBy: string;
        workspaceId: string;
        description?: string | undefined;
        metadata?: {
            tags?: string[] | undefined;
            color?: string | undefined;
            icon?: string | undefined;
        } | undefined;
        members?: {
            role: "member" | "team_lead" | "contributor";
            id: string;
            userId: string;
            email: string;
            joinedAt: string;
            name?: string | undefined;
            permissions?: string[] | undefined;
        }[] | undefined;
        settings?: {
            isPrivate?: boolean | undefined;
            allowSelfJoin?: boolean | undefined;
            maxMembers?: number | undefined;
            inheritPermissions?: boolean | undefined;
        } | undefined;
        parentTeamId?: string | undefined;
        childTeams?: string[] | undefined;
    }>;
    memberCount: z.ZodNumber;
    childTeamCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    team: {
        name: string;
        metadata: {
            tags: string[];
            color?: string | undefined;
            icon?: string | undefined;
        };
        id: string;
        createdAt: string;
        updatedAt: string;
        createdBy: string;
        workspaceId: string;
        members: {
            role: "member" | "team_lead" | "contributor";
            id: string;
            userId: string;
            email: string;
            joinedAt: string;
            permissions: string[];
            name?: string | undefined;
        }[];
        settings: {
            isPrivate: boolean;
            allowSelfJoin: boolean;
            inheritPermissions: boolean;
            maxMembers?: number | undefined;
        };
        childTeams: string[];
        description?: string | undefined;
        parentTeamId?: string | undefined;
    };
    memberCount: number;
    childTeamCount: number;
}, {
    team: {
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        createdBy: string;
        workspaceId: string;
        description?: string | undefined;
        metadata?: {
            tags?: string[] | undefined;
            color?: string | undefined;
            icon?: string | undefined;
        } | undefined;
        members?: {
            role: "member" | "team_lead" | "contributor";
            id: string;
            userId: string;
            email: string;
            joinedAt: string;
            name?: string | undefined;
            permissions?: string[] | undefined;
        }[] | undefined;
        settings?: {
            isPrivate?: boolean | undefined;
            allowSelfJoin?: boolean | undefined;
            maxMembers?: number | undefined;
            inheritPermissions?: boolean | undefined;
        } | undefined;
        parentTeamId?: string | undefined;
        childTeams?: string[] | undefined;
    };
    memberCount: number;
    childTeamCount: number;
}>;
export declare const TeamListResponseSchema: z.ZodObject<{
    teams: z.ZodArray<z.ZodObject<{
        team: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            workspaceId: z.ZodString;
            parentTeamId: z.ZodOptional<z.ZodString>;
            members: z.ZodDefault<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                userId: z.ZodString;
                email: z.ZodString;
                name: z.ZodOptional<z.ZodString>;
                role: z.ZodEnum<["team_lead", "member", "contributor"]>;
                joinedAt: z.ZodString;
                permissions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                role: "member" | "team_lead" | "contributor";
                id: string;
                userId: string;
                email: string;
                joinedAt: string;
                permissions: string[];
                name?: string | undefined;
            }, {
                role: "member" | "team_lead" | "contributor";
                id: string;
                userId: string;
                email: string;
                joinedAt: string;
                name?: string | undefined;
                permissions?: string[] | undefined;
            }>, "many">>;
            childTeams: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            settings: z.ZodDefault<z.ZodObject<{
                isPrivate: z.ZodDefault<z.ZodBoolean>;
                allowSelfJoin: z.ZodDefault<z.ZodBoolean>;
                maxMembers: z.ZodOptional<z.ZodNumber>;
                inheritPermissions: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                isPrivate: boolean;
                allowSelfJoin: boolean;
                inheritPermissions: boolean;
                maxMembers?: number | undefined;
            }, {
                isPrivate?: boolean | undefined;
                allowSelfJoin?: boolean | undefined;
                maxMembers?: number | undefined;
                inheritPermissions?: boolean | undefined;
            }>>;
            metadata: z.ZodDefault<z.ZodObject<{
                color: z.ZodOptional<z.ZodString>;
                icon: z.ZodOptional<z.ZodString>;
                tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                tags: string[];
                color?: string | undefined;
                icon?: string | undefined;
            }, {
                tags?: string[] | undefined;
                color?: string | undefined;
                icon?: string | undefined;
            }>>;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
            createdBy: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            metadata: {
                tags: string[];
                color?: string | undefined;
                icon?: string | undefined;
            };
            id: string;
            createdAt: string;
            updatedAt: string;
            createdBy: string;
            workspaceId: string;
            members: {
                role: "member" | "team_lead" | "contributor";
                id: string;
                userId: string;
                email: string;
                joinedAt: string;
                permissions: string[];
                name?: string | undefined;
            }[];
            settings: {
                isPrivate: boolean;
                allowSelfJoin: boolean;
                inheritPermissions: boolean;
                maxMembers?: number | undefined;
            };
            childTeams: string[];
            description?: string | undefined;
            parentTeamId?: string | undefined;
        }, {
            name: string;
            id: string;
            createdAt: string;
            updatedAt: string;
            createdBy: string;
            workspaceId: string;
            description?: string | undefined;
            metadata?: {
                tags?: string[] | undefined;
                color?: string | undefined;
                icon?: string | undefined;
            } | undefined;
            members?: {
                role: "member" | "team_lead" | "contributor";
                id: string;
                userId: string;
                email: string;
                joinedAt: string;
                name?: string | undefined;
                permissions?: string[] | undefined;
            }[] | undefined;
            settings?: {
                isPrivate?: boolean | undefined;
                allowSelfJoin?: boolean | undefined;
                maxMembers?: number | undefined;
                inheritPermissions?: boolean | undefined;
            } | undefined;
            parentTeamId?: string | undefined;
            childTeams?: string[] | undefined;
        }>;
        memberCount: z.ZodNumber;
        childTeamCount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        team: {
            name: string;
            metadata: {
                tags: string[];
                color?: string | undefined;
                icon?: string | undefined;
            };
            id: string;
            createdAt: string;
            updatedAt: string;
            createdBy: string;
            workspaceId: string;
            members: {
                role: "member" | "team_lead" | "contributor";
                id: string;
                userId: string;
                email: string;
                joinedAt: string;
                permissions: string[];
                name?: string | undefined;
            }[];
            settings: {
                isPrivate: boolean;
                allowSelfJoin: boolean;
                inheritPermissions: boolean;
                maxMembers?: number | undefined;
            };
            childTeams: string[];
            description?: string | undefined;
            parentTeamId?: string | undefined;
        };
        memberCount: number;
        childTeamCount: number;
    }, {
        team: {
            name: string;
            id: string;
            createdAt: string;
            updatedAt: string;
            createdBy: string;
            workspaceId: string;
            description?: string | undefined;
            metadata?: {
                tags?: string[] | undefined;
                color?: string | undefined;
                icon?: string | undefined;
            } | undefined;
            members?: {
                role: "member" | "team_lead" | "contributor";
                id: string;
                userId: string;
                email: string;
                joinedAt: string;
                name?: string | undefined;
                permissions?: string[] | undefined;
            }[] | undefined;
            settings?: {
                isPrivate?: boolean | undefined;
                allowSelfJoin?: boolean | undefined;
                maxMembers?: number | undefined;
                inheritPermissions?: boolean | undefined;
            } | undefined;
            parentTeamId?: string | undefined;
            childTeams?: string[] | undefined;
        };
        memberCount: number;
        childTeamCount: number;
    }>, "many">;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    hasMore: z.ZodOptional<z.ZodBoolean>;
    totalCount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    teams: {
        team: {
            name: string;
            metadata: {
                tags: string[];
                color?: string | undefined;
                icon?: string | undefined;
            };
            id: string;
            createdAt: string;
            updatedAt: string;
            createdBy: string;
            workspaceId: string;
            members: {
                role: "member" | "team_lead" | "contributor";
                id: string;
                userId: string;
                email: string;
                joinedAt: string;
                permissions: string[];
                name?: string | undefined;
            }[];
            settings: {
                isPrivate: boolean;
                allowSelfJoin: boolean;
                inheritPermissions: boolean;
                maxMembers?: number | undefined;
            };
            childTeams: string[];
            description?: string | undefined;
            parentTeamId?: string | undefined;
        };
        memberCount: number;
        childTeamCount: number;
    }[];
    hasMore?: boolean | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    totalCount?: number | undefined;
}, {
    teams: {
        team: {
            name: string;
            id: string;
            createdAt: string;
            updatedAt: string;
            createdBy: string;
            workspaceId: string;
            description?: string | undefined;
            metadata?: {
                tags?: string[] | undefined;
                color?: string | undefined;
                icon?: string | undefined;
            } | undefined;
            members?: {
                role: "member" | "team_lead" | "contributor";
                id: string;
                userId: string;
                email: string;
                joinedAt: string;
                name?: string | undefined;
                permissions?: string[] | undefined;
            }[] | undefined;
            settings?: {
                isPrivate?: boolean | undefined;
                allowSelfJoin?: boolean | undefined;
                maxMembers?: number | undefined;
                inheritPermissions?: boolean | undefined;
            } | undefined;
            parentTeamId?: string | undefined;
            childTeams?: string[] | undefined;
        };
        memberCount: number;
        childTeamCount: number;
    }[];
    hasMore?: boolean | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    totalCount?: number | undefined;
}>;
export declare const BulkOperationResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    processedCount: z.ZodNumber;
    failedCount: z.ZodNumber;
    errors: z.ZodOptional<z.ZodArray<z.ZodObject<{
        teamId: z.ZodString;
        error: z.ZodString;
        code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        error: string;
        teamId: string;
        code?: string | undefined;
    }, {
        error: string;
        teamId: string;
        code?: string | undefined;
    }>, "many">>;
    results: z.ZodOptional<z.ZodArray<z.ZodObject<{
        teamId: z.ZodString;
        success: z.ZodBoolean;
        data: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        success: boolean;
        teamId: string;
        data?: any;
    }, {
        success: boolean;
        teamId: string;
        data?: any;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    failedCount: number;
    processedCount: number;
    errors?: {
        error: string;
        teamId: string;
        code?: string | undefined;
    }[] | undefined;
    results?: {
        success: boolean;
        teamId: string;
        data?: any;
    }[] | undefined;
}, {
    success: boolean;
    failedCount: number;
    processedCount: number;
    errors?: {
        error: string;
        teamId: string;
        code?: string | undefined;
    }[] | undefined;
    results?: {
        success: boolean;
        teamId: string;
        data?: any;
    }[] | undefined;
}>;
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
//# sourceMappingURL=team-models.d.ts.map
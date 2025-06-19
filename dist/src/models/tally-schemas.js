import { z } from 'zod';
export const TallyApiResponseSchema = z.object({
    data: z.unknown(),
    page: z.number().optional(),
    limit: z.number().optional(),
    hasMore: z.boolean().optional(),
});
export const TallyApiErrorResponseSchema = z.object({
    error: z.object({
        message: z.string(),
        code: z.string().optional(),
        details: z.unknown().optional(),
    }),
});
export const TallyFieldTypeSchema = z.enum([
    'INPUT_TEXT',
    'INPUT_NUMBER',
    'INPUT_EMAIL',
    'INPUT_PHONE_NUMBER',
    'INPUT_LINK',
    'INPUT_DATE',
    'INPUT_TIME',
    'TEXTAREA',
    'MULTIPLE_CHOICE',
    'DROPDOWN',
    'CHECKBOXES',
    'LINEAR_SCALE',
    'FILE_UPLOAD',
    'HIDDEN_FIELDS',
    'CALCULATED_FIELDS',
    'RATING',
    'MULTI_SELECT',
    'MATRIX',
    'RANKING',
    'SIGNATURE',
    'PAYMENT',
    'FORM_TITLE',
]);
export const TallyFileUploadSchema = z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().url(),
    mimeType: z.string(),
    size: z.number(),
});
export const TallyOptionSchema = z.object({
    id: z.string(),
    text: z.string(),
});
export const TallyMatrixSchema = z.object({
    rows: z.array(TallyOptionSchema),
    columns: z.array(TallyOptionSchema),
});
export const TallyFormFieldSchema = z.lazy(() => z.object({
    uuid: z.string(),
    type: TallyFieldTypeSchema,
    blockGroupUuid: z.string().optional(),
    title: z.string().optional(),
    id: z.string().optional(),
    isTitleModifiedByUser: z.boolean().optional(),
    formId: z.string().optional(),
    isDeleted: z.boolean().optional(),
    numberOfResponses: z.number().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    fields: z.array(TallyFormFieldSchema).optional(),
}));
export const TallyQuestionSchema = z.object({
    id: z.string(),
    type: TallyFieldTypeSchema,
    title: z.string(),
    isTitleModifiedByUser: z.boolean().optional(),
    formId: z.string(),
    isDeleted: z.boolean().optional(),
    numberOfResponses: z.number().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    fields: z.array(TallyFormFieldSchema),
});
export const TallyFormResponseSchema = z.object({
    questionId: z.string(),
    value: z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.array(z.string()),
        z.array(TallyFileUploadSchema),
        z.record(z.array(z.string())),
        z.null(),
    ]),
});
export const TallySubmissionSchema = z.object({
    id: z.string(),
    formId: z.string(),
    respondentId: z.string(),
    isCompleted: z.boolean(),
    submittedAt: z.string().datetime(),
    responses: z.array(TallyFormResponseSchema),
});
export const TallySubmissionsResponseSchema = z.object({
    page: z.number(),
    limit: z.number(),
    hasMore: z.boolean(),
    totalNumberOfSubmissionsPerFilter: z.object({
        all: z.number(),
        completed: z.number(),
        partial: z.number(),
    }),
    questions: z.array(TallyQuestionSchema),
    submissions: z.array(TallySubmissionSchema),
});
export const TallyWebhookFieldSchema = z.object({
    key: z.string(),
    label: z.string(),
    type: TallyFieldTypeSchema,
    value: z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.array(z.string()),
        z.array(TallyFileUploadSchema),
        z.record(z.array(z.string())),
    ]),
    options: z.array(TallyOptionSchema).optional(),
    rows: z.array(TallyOptionSchema).optional(),
    columns: z.array(TallyOptionSchema).optional(),
});
export const TallyWebhookDataSchema = z.object({
    responseId: z.string(),
    submissionId: z.string(),
    respondentId: z.string(),
    formId: z.string(),
    formName: z.string(),
    createdAt: z.string().datetime(),
    fields: z.array(TallyWebhookFieldSchema),
});
export const TallyWebhookPayloadSchema = z.object({
    eventId: z.string(),
    eventType: z.literal('FORM_RESPONSE'),
    createdAt: z.string().datetime(),
    data: TallyWebhookDataSchema,
});
export const TallyFormSchema = z.object({
    id: z.string(),
    title: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    isPublished: z.boolean().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    submissionsCount: z.number().optional(),
    url: z.string().url().optional(),
    embedUrl: z.string().url().optional(),
    status: z.string().optional(),
    shareUrl: z.string().url().optional(),
    share_url: z.string().url().optional(),
    publicUrl: z.string().url().optional(),
}).passthrough();
export const TallyFormsResponseSchema = z.object({
    forms: z.array(TallyFormSchema),
    page: z.number().optional(),
    limit: z.number().optional(),
    hasMore: z.boolean().optional(),
});
export const UserRoleSchema = z.enum(['owner', 'admin', 'member']);
export const TallyWorkspaceMemberSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().optional(),
    role: UserRoleSchema,
    joinedAt: z.string().datetime(),
});
export const TallyWorkspaceSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string().optional(),
    description: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    members: z.array(TallyWorkspaceMemberSchema).optional(),
    formsCount: z.number().optional(),
});
export const TallyWorkspacesResponseSchema = z.object({
    workspaces: z.array(TallyWorkspaceSchema),
    page: z.number().optional(),
    limit: z.number().optional(),
    hasMore: z.boolean().optional(),
});
export const FormAccessLevelSchema = z.enum(['view', 'edit', 'manage', 'admin']);
export const FormPermissionSchema = z.object({
    userId: z.string(),
    formId: z.string(),
    accessLevel: FormAccessLevelSchema,
    inheritFromWorkspace: z.boolean(),
    grantedAt: z.string().datetime(),
    grantedBy: z.string(),
});
export const FormPermissionResponseSchema = z.object({
    userId: z.string(),
    formId: z.string(),
    accessLevel: FormAccessLevelSchema,
    inheritFromWorkspace: z.boolean().optional().default(true),
    grantedAt: z.string().datetime(),
    grantedBy: z.string(),
});
export const FormPermissionInputSchema = z.object({
    userId: z.string(),
    formId: z.string(),
    accessLevel: FormAccessLevelSchema,
    inheritFromWorkspace: z.boolean().default(true),
    grantedAt: z.string().datetime(),
    grantedBy: z.string(),
});
export const BulkFormPermissionSchema = z.object({
    formIds: z.array(z.string()),
    userId: z.string(),
    accessLevel: FormAccessLevelSchema,
    inheritFromWorkspace: z.boolean().default(true),
});
export const FormPermissionSettingsSchema = z.object({
    formId: z.string(),
    workspaceId: z.string(),
    defaultAccessLevel: FormAccessLevelSchema,
    allowWorkspaceInheritance: z.boolean(),
    permissions: z.array(FormPermissionSchema),
});
export const FormPermissionSettingsResponseSchema = z.object({
    formId: z.string(),
    workspaceId: z.string(),
    defaultAccessLevel: FormAccessLevelSchema.optional().default('view'),
    allowWorkspaceInheritance: z.boolean().optional().default(true),
    permissions: z.array(FormPermissionResponseSchema),
});
export const FormPermissionSettingsInputSchema = z.object({
    formId: z.string(),
    workspaceId: z.string(),
    defaultAccessLevel: FormAccessLevelSchema.default('view'),
    allowWorkspaceInheritance: z.boolean().default(true),
    permissions: z.array(FormPermissionInputSchema),
});
export const FormPermissionsResponseSchema = z.object({
    formId: z.string(),
    permissions: z.array(FormPermissionResponseSchema),
    settings: FormPermissionSettingsResponseSchema,
});
export const BulkPermissionResponseSchema = z.object({
    success: z.boolean(),
    updatedCount: z.number(),
    failedCount: z.number(),
    errors: z.array(z.object({
        formId: z.string(),
        error: z.string(),
    })).optional(),
});
export const TallySuccessResponseSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
    data: z.unknown().optional(),
});
export const TallyPaginationSchema = z.object({
    page: z.number(),
    limit: z.number(),
    hasMore: z.boolean(),
    total: z.number().optional(),
});
export const TallyBlockTypeSchema = z.enum([
    'FORM_TITLE',
    'TITLE',
    'INPUT_TEXT',
    'INPUT_EMAIL',
    'INPUT_NUMBER',
    'INPUT_PHONE_NUMBER',
    'INPUT_LINK',
    'INPUT_DATE',
    'INPUT_TIME',
    'TEXTAREA',
    'DROPDOWN',
    'DROPDOWN_OPTION',
    'CHECKBOXES',
    'CHECKBOX',
    'MULTIPLE_CHOICE',
    'MULTIPLE_CHOICE_OPTION',
    'LINEAR_SCALE',
    'RATING',
    'FILE_UPLOAD',
    'SIGNATURE',
    'HIDDEN_FIELDS',
    'CALCULATED_FIELDS',
    'MULTI_SELECT',
    'MATRIX',
    'RANKING',
    'PAYMENT'
]);
export const TallyGroupTypeSchema = z.enum([
    'TEXT',
    'QUESTION',
    'INPUT_TEXT',
    'INPUT_EMAIL',
    'INPUT_NUMBER',
    'INPUT_PHONE_NUMBER',
    'INPUT_LINK',
    'INPUT_DATE',
    'INPUT_TIME',
    'TEXTAREA',
    'DROPDOWN',
    'CHECKBOXES',
    'MULTIPLE_CHOICE',
    'LINEAR_SCALE',
    'RATING',
    'FILE_UPLOAD',
    'SIGNATURE'
]);
export const TallyBlockBasePayloadSchema = z.object({
    html: z.string().optional(),
    title: z.string().optional(),
    isRequired: z.boolean().optional(),
    placeholder: z.string().optional(),
});
export const TallyBlockOptionSchema = z.object({
    id: z.string(),
    text: z.string(),
    index: z.number().optional(),
});
export const TallyChoiceOptionPayloadSchema = TallyBlockBasePayloadSchema.extend({
    index: z.number(),
    text: z.string(),
});
export const TallyInputPayloadSchema = TallyBlockBasePayloadSchema.extend({
    isRequired: z.boolean(),
    placeholder: z.string(),
    options: z.array(TallyBlockOptionSchema).optional(),
});
export const TallyTitlePayloadSchema = z.object({
    html: z.string(),
    title: z.string().optional(),
});
export const TallyBlockPayloadSchema = z.union([
    TallyTitlePayloadSchema,
    TallyInputPayloadSchema,
    TallyChoiceOptionPayloadSchema,
    TallyBlockBasePayloadSchema,
]);
export const TallyBlockSchema = z.object({
    uuid: z.string().uuid('Block UUID must be a valid UUID'),
    type: TallyBlockTypeSchema,
    groupUuid: z.string().uuid('Group UUID must be a valid UUID'),
    groupType: TallyGroupTypeSchema,
    title: z.string(),
    payload: TallyBlockPayloadSchema,
});
export const TallyFormCreatePayloadSchema = z.object({
    status: z.enum(['PUBLISHED', 'DRAFT']).default('PUBLISHED'),
    name: z.string().min(1, 'Form name is required'),
    blocks: z.array(TallyBlockSchema).optional(),
    settings: z.object({
        language: z.string().optional(),
        closeDate: z.string().optional(),
        closeTime: z.string().optional(),
        closeTimezone: z.string().optional(),
        submissionsLimit: z.number().positive().optional(),
        redirectOnCompletion: z.object({
            html: z.string(),
            mentions: z.array(z.any()).optional(),
        }).optional(),
        hasSelfEmailNotifications: z.boolean().optional(),
        selfEmailTo: z.object({
            html: z.string(),
            mentions: z.array(z.any()).optional(),
        }).optional(),
        selfEmailReplyTo: z.object({
            html: z.string(),
            mentions: z.array(z.any()).optional(),
        }).optional(),
        selfEmailSubject: z.string().nullable().optional(),
        selfEmailFromName: z.string().nullable().optional(),
        selfEmailBody: z.object({
            html: z.string(),
            mentions: z.array(z.any()).optional(),
        }).optional(),
        uniqueSubmissionKey: z.object({
            html: z.string(),
            mentions: z.array(z.any()).optional(),
        }).optional(),
    }).optional(),
});
export const TallyFormUpdatePayloadSchema = z.object({
    name: z.string().min(1).optional(),
    status: z.enum(['PUBLISHED', 'DRAFT']).optional(),
    blocks: z.array(TallyBlockSchema).optional(),
    settings: z.object({
        language: z.string().optional(),
        closeDate: z.string().optional(),
        closeTime: z.string().optional(),
        closeTimezone: z.string().optional(),
        submissionsLimit: z.number().positive().optional(),
        redirectOnCompletion: z.object({
            html: z.string(),
            mentions: z.array(z.any()).optional(),
        }).optional(),
        hasSelfEmailNotifications: z.boolean().optional(),
        selfEmailTo: z.object({
            html: z.string(),
            mentions: z.array(z.any()).optional(),
        }).optional(),
        selfEmailReplyTo: z.object({
            html: z.string(),
            mentions: z.array(z.any()).optional(),
        }).optional(),
        selfEmailSubject: z.string().nullable().optional(),
        selfEmailFromName: z.string().nullable().optional(),
        selfEmailBody: z.object({
            html: z.string(),
            mentions: z.array(z.any()).optional(),
        }).optional(),
        uniqueSubmissionKey: z.object({
            html: z.string(),
            mentions: z.array(z.any()).optional(),
        }).optional(),
    }).optional(),
});
export function validateTallyResponse(schema, data) {
    return schema.parse(data);
}
export function safeParseTallyResponse(schema, data) {
    return schema.safeParse(data);
}
export function createTallyValidator(schema) {
    return (data) => schema.parse(data);
}
export function createSafeTallyValidator(schema) {
    return (data) => schema.safeParse(data);
}
//# sourceMappingURL=tally-schemas.js.map
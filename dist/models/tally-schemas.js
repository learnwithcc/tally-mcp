"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TallyPaginationSchema = exports.TallySuccessResponseSchema = exports.BulkPermissionResponseSchema = exports.FormPermissionsResponseSchema = exports.FormPermissionSettingsSchema = exports.BulkFormPermissionSchema = exports.FormPermissionSchema = exports.FormAccessLevelSchema = exports.TallyWorkspacesResponseSchema = exports.TallyWorkspaceSchema = exports.TallyWorkspaceMemberSchema = exports.UserRoleSchema = exports.TallyFormsResponseSchema = exports.TallyFormSchema = exports.TallyWebhookPayloadSchema = exports.TallyWebhookDataSchema = exports.TallyWebhookFieldSchema = exports.TallySubmissionsResponseSchema = exports.TallySubmissionSchema = exports.TallyFormResponseSchema = exports.TallyQuestionSchema = exports.TallyFormFieldSchema = exports.TallyMatrixSchema = exports.TallyOptionSchema = exports.TallyFileUploadSchema = exports.TallyFieldTypeSchema = exports.TallyApiErrorResponseSchema = exports.TallyApiResponseSchema = void 0;
exports.validateTallyResponse = validateTallyResponse;
exports.safeParseTallyResponse = safeParseTallyResponse;
exports.createTallyValidator = createTallyValidator;
exports.createSafeTallyValidator = createSafeTallyValidator;
const zod_1 = require("zod");
exports.TallyApiResponseSchema = zod_1.z.object({
    data: zod_1.z.unknown(),
    page: zod_1.z.number().optional(),
    limit: zod_1.z.number().optional(),
    hasMore: zod_1.z.boolean().optional(),
});
exports.TallyApiErrorResponseSchema = zod_1.z.object({
    error: zod_1.z.object({
        message: zod_1.z.string(),
        code: zod_1.z.string().optional(),
        details: zod_1.z.unknown().optional(),
    }),
});
exports.TallyFieldTypeSchema = zod_1.z.enum([
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
exports.TallyFileUploadSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    url: zod_1.z.string().url(),
    mimeType: zod_1.z.string(),
    size: zod_1.z.number(),
});
exports.TallyOptionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    text: zod_1.z.string(),
});
exports.TallyMatrixSchema = zod_1.z.object({
    rows: zod_1.z.array(exports.TallyOptionSchema),
    columns: zod_1.z.array(exports.TallyOptionSchema),
});
exports.TallyFormFieldSchema = zod_1.z.lazy(() => zod_1.z.object({
    uuid: zod_1.z.string(),
    type: exports.TallyFieldTypeSchema,
    blockGroupUuid: zod_1.z.string().optional(),
    title: zod_1.z.string().optional(),
    id: zod_1.z.string().optional(),
    isTitleModifiedByUser: zod_1.z.boolean().optional(),
    formId: zod_1.z.string().optional(),
    isDeleted: zod_1.z.boolean().optional(),
    numberOfResponses: zod_1.z.number().optional(),
    createdAt: zod_1.z.string().datetime().optional(),
    updatedAt: zod_1.z.string().datetime().optional(),
    fields: zod_1.z.array(exports.TallyFormFieldSchema).optional(),
}));
exports.TallyQuestionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: exports.TallyFieldTypeSchema,
    title: zod_1.z.string(),
    isTitleModifiedByUser: zod_1.z.boolean().optional(),
    formId: zod_1.z.string(),
    isDeleted: zod_1.z.boolean().optional(),
    numberOfResponses: zod_1.z.number().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    fields: zod_1.z.array(exports.TallyFormFieldSchema),
});
exports.TallyFormResponseSchema = zod_1.z.object({
    questionId: zod_1.z.string(),
    value: zod_1.z.union([
        zod_1.z.string(),
        zod_1.z.number(),
        zod_1.z.boolean(),
        zod_1.z.array(zod_1.z.string()),
        zod_1.z.array(exports.TallyFileUploadSchema),
        zod_1.z.record(zod_1.z.array(zod_1.z.string())),
        zod_1.z.null(),
    ]),
});
exports.TallySubmissionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    formId: zod_1.z.string(),
    respondentId: zod_1.z.string(),
    isCompleted: zod_1.z.boolean(),
    submittedAt: zod_1.z.string().datetime(),
    responses: zod_1.z.array(exports.TallyFormResponseSchema),
});
exports.TallySubmissionsResponseSchema = zod_1.z.object({
    page: zod_1.z.number(),
    limit: zod_1.z.number(),
    hasMore: zod_1.z.boolean(),
    totalNumberOfSubmissionsPerFilter: zod_1.z.object({
        all: zod_1.z.number(),
        completed: zod_1.z.number(),
        partial: zod_1.z.number(),
    }),
    questions: zod_1.z.array(exports.TallyQuestionSchema),
    submissions: zod_1.z.array(exports.TallySubmissionSchema),
});
exports.TallyWebhookFieldSchema = zod_1.z.object({
    key: zod_1.z.string(),
    label: zod_1.z.string(),
    type: exports.TallyFieldTypeSchema,
    value: zod_1.z.union([
        zod_1.z.string(),
        zod_1.z.number(),
        zod_1.z.boolean(),
        zod_1.z.array(zod_1.z.string()),
        zod_1.z.array(exports.TallyFileUploadSchema),
        zod_1.z.record(zod_1.z.array(zod_1.z.string())),
    ]),
    options: zod_1.z.array(exports.TallyOptionSchema).optional(),
    rows: zod_1.z.array(exports.TallyOptionSchema).optional(),
    columns: zod_1.z.array(exports.TallyOptionSchema).optional(),
});
exports.TallyWebhookDataSchema = zod_1.z.object({
    responseId: zod_1.z.string(),
    submissionId: zod_1.z.string(),
    respondentId: zod_1.z.string(),
    formId: zod_1.z.string(),
    formName: zod_1.z.string(),
    createdAt: zod_1.z.string().datetime(),
    fields: zod_1.z.array(exports.TallyWebhookFieldSchema),
});
exports.TallyWebhookPayloadSchema = zod_1.z.object({
    eventId: zod_1.z.string(),
    eventType: zod_1.z.literal('FORM_RESPONSE'),
    createdAt: zod_1.z.string().datetime(),
    data: exports.TallyWebhookDataSchema,
});
exports.TallyFormSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    isPublished: zod_1.z.boolean().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    submissionsCount: zod_1.z.number().optional(),
    status: zod_1.z.enum(['published', 'draft', 'archived']).optional(),
    url: zod_1.z.string().url().optional(),
    embedUrl: zod_1.z.string().url().optional(),
});
exports.TallyFormsResponseSchema = zod_1.z.object({
    forms: zod_1.z.array(exports.TallyFormSchema),
    page: zod_1.z.number().optional(),
    limit: zod_1.z.number().optional(),
    hasMore: zod_1.z.boolean().optional(),
});
exports.UserRoleSchema = zod_1.z.enum(['owner', 'admin', 'member']);
exports.TallyWorkspaceMemberSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string().optional(),
    role: exports.UserRoleSchema,
    joinedAt: zod_1.z.string().datetime(),
});
exports.TallyWorkspaceSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    slug: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
    members: zod_1.z.array(exports.TallyWorkspaceMemberSchema).optional(),
    formsCount: zod_1.z.number().optional(),
});
exports.TallyWorkspacesResponseSchema = zod_1.z.object({
    workspaces: zod_1.z.array(exports.TallyWorkspaceSchema),
    page: zod_1.z.number().optional(),
    limit: zod_1.z.number().optional(),
    hasMore: zod_1.z.boolean().optional(),
});
exports.FormAccessLevelSchema = zod_1.z.enum(['view', 'edit', 'manage', 'admin']);
exports.FormPermissionSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    formId: zod_1.z.string(),
    accessLevel: exports.FormAccessLevelSchema,
    inheritFromWorkspace: zod_1.z.boolean().default(true),
    grantedAt: zod_1.z.string().datetime(),
    grantedBy: zod_1.z.string(),
});
exports.BulkFormPermissionSchema = zod_1.z.object({
    formIds: zod_1.z.array(zod_1.z.string()),
    userId: zod_1.z.string(),
    accessLevel: exports.FormAccessLevelSchema,
    inheritFromWorkspace: zod_1.z.boolean().default(true),
});
exports.FormPermissionSettingsSchema = zod_1.z.object({
    formId: zod_1.z.string(),
    workspaceId: zod_1.z.string(),
    defaultAccessLevel: exports.FormAccessLevelSchema.default('view'),
    allowWorkspaceInheritance: zod_1.z.boolean().default(true),
    permissions: zod_1.z.array(exports.FormPermissionSchema),
});
exports.FormPermissionsResponseSchema = zod_1.z.object({
    formId: zod_1.z.string(),
    permissions: zod_1.z.array(exports.FormPermissionSchema),
    settings: exports.FormPermissionSettingsSchema,
});
exports.BulkPermissionResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    updatedCount: zod_1.z.number(),
    failedCount: zod_1.z.number(),
    errors: zod_1.z.array(zod_1.z.object({
        formId: zod_1.z.string(),
        error: zod_1.z.string(),
    })).optional(),
});
exports.TallySuccessResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    message: zod_1.z.string().optional(),
    data: zod_1.z.unknown().optional(),
});
exports.TallyPaginationSchema = zod_1.z.object({
    page: zod_1.z.number(),
    limit: zod_1.z.number(),
    hasMore: zod_1.z.boolean(),
    total: zod_1.z.number().optional(),
});
function validateTallyResponse(schema, data) {
    return schema.parse(data);
}
function safeParseTallyResponse(schema, data) {
    return schema.safeParse(data);
}
function createTallyValidator(schema) {
    return (data) => schema.parse(data);
}
function createSafeTallyValidator(schema) {
    return (data) => schema.safeParse(data);
}
//# sourceMappingURL=tally-schemas.js.map
import { z } from 'zod';

/**
 * Tally.so API Response Schemas
 * 
 * This file contains Zod schemas for validating and typing Tally.so API responses.
 * Based on Tally.so API documentation and webhook payload examples.
 */

// ===============================
// Base Response Types
// ===============================

/**
 * Standard Tally API response wrapper
 */
export const TallyApiResponseSchema = z.object({
  data: z.unknown(),
  page: z.number().optional(),
  limit: z.number().optional(),
  hasMore: z.boolean().optional(),
});

/**
 * Error response from Tally API
 */
export const TallyApiErrorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.unknown().optional(),
  }),
});

// ===============================
// Form Field Types
// ===============================

/**
 * All supported Tally field types
 */
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

/**
 * File upload object structure
 */
export const TallyFileUploadSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().url(),
  mimeType: z.string(),
  size: z.number(),
});

/**
 * Option for multiple choice, dropdown, etc.
 */
export const TallyOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
});

/**
 * Matrix question structure
 */
export const TallyMatrixSchema = z.object({
  rows: z.array(TallyOptionSchema),
  columns: z.array(TallyOptionSchema),
});

// ===============================
// Form Question/Field Schema
// ===============================

/**
 * Form field/question structure (using lazy evaluation for recursive reference)
 */
export const TallyFormFieldSchema: z.ZodSchema<any> = z.lazy(() => z.object({
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

/**
 * Form question with extended properties
 */
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

// ===============================
// Form Response/Submission Types
// ===============================

/**
 * Individual response to a form field
 */
export const TallyFormResponseSchema = z.object({
  questionId: z.string(),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.array(TallyFileUploadSchema),
    z.record(z.array(z.string())), // For matrix responses
    z.null(),
  ]),
});

/**
 * Complete form submission
 */
export const TallySubmissionSchema = z.object({
  id: z.string(),
  formId: z.string(),
  respondentId: z.string(),
  isCompleted: z.boolean(),
  submittedAt: z.string().datetime(),
  responses: z.array(TallyFormResponseSchema),
});

/**
 * Submission list response
 */
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

export type SubmissionStatusFilter = 'all' | 'completed' | 'partial';

export interface SubmissionFilters {
  status?: SubmissionStatusFilter;
  startDate?: string;
  endDate?: string;
  afterId?: string;
}

// ===============================
// Webhook Payload Types
// ===============================

/**
 * Webhook field response structure
 */
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
    z.record(z.array(z.string())), // For matrix responses
  ]),
  options: z.array(TallyOptionSchema).optional(),
  rows: z.array(TallyOptionSchema).optional(),
  columns: z.array(TallyOptionSchema).optional(),
});

/**
 * Webhook payload data structure
 */
export const TallyWebhookDataSchema = z.object({
  responseId: z.string(),
  submissionId: z.string(),
  respondentId: z.string(),
  formId: z.string(),
  formName: z.string(),
  createdAt: z.string().datetime(),
  fields: z.array(TallyWebhookFieldSchema),
});

/**
 * Complete webhook payload
 */
export const TallyWebhookPayloadSchema = z.object({
  eventId: z.string(),
  eventType: z.literal('FORM_RESPONSE'),
  createdAt: z.string().datetime(),
  data: TallyWebhookDataSchema,
});

// ===============================
// Form Management Types
// ===============================

/**
 * Form metadata structure
 */
export const TallyFormSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  isPublished: z.boolean().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  submissionsCount: z.number().optional(),
  url: z.string().url().optional(),
  embedUrl: z.string().url().optional(),
  status: z.string().optional(),
});

/**
 * Form list response
 */
export const TallyFormsResponseSchema = z.object({
  forms: z.array(TallyFormSchema),
  page: z.number().optional(),
  limit: z.number().optional(),
  hasMore: z.boolean().optional(),
});

// ===============================
// Workspace/Organization Types
// ===============================

export const UserRoleSchema = z.enum(['owner', 'admin', 'member']);
export type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * Workspace member
 */
export const TallyWorkspaceMemberSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  role: UserRoleSchema,
  joinedAt: z.string().datetime(),
});

/**
 * Workspace structure
 */
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

/**
 * Workspace list response
 */
export const TallyWorkspacesResponseSchema = z.object({
  workspaces: z.array(TallyWorkspaceSchema),
  page: z.number().optional(),
  limit: z.number().optional(),
  hasMore: z.boolean().optional(),
});

// ===============================
// Form Permission Types
// ===============================

/**
 * Form access levels
 */
export const FormAccessLevelSchema = z.enum(['view', 'edit', 'manage', 'admin']);
export type FormAccessLevel = z.infer<typeof FormAccessLevelSchema>;

/**
 * Form permission entry for a specific user (strict for requests)
 */
export const FormPermissionSchema = z.object({
  userId: z.string(),
  formId: z.string(),
  accessLevel: FormAccessLevelSchema,
  inheritFromWorkspace: z.boolean(),
  grantedAt: z.string().datetime(),
  grantedBy: z.string(),
});

/**
 * Form permission entry for API responses (lenient)
 */
export const FormPermissionResponseSchema = z.object({
  userId: z.string(),
  formId: z.string(),
  accessLevel: FormAccessLevelSchema,
  inheritFromWorkspace: z.boolean().optional().default(true),
  grantedAt: z.string().datetime(),
  grantedBy: z.string(),
});

/**
 * Form permission input schema (with defaults for creation)
 */
export const FormPermissionInputSchema = z.object({
  userId: z.string(),
  formId: z.string(),
  accessLevel: FormAccessLevelSchema,
  inheritFromWorkspace: z.boolean().default(true),
  grantedAt: z.string().datetime(),
  grantedBy: z.string(),
});

/**
 * Bulk form permission operation
 */
export const BulkFormPermissionSchema = z.object({
  formIds: z.array(z.string()),
  userId: z.string(),
  accessLevel: FormAccessLevelSchema,
  inheritFromWorkspace: z.boolean().default(true),
});

/**
 * Form permission settings (strict for requests)
 */
export const FormPermissionSettingsSchema = z.object({
  formId: z.string(),
  workspaceId: z.string(),
  defaultAccessLevel: FormAccessLevelSchema,
  allowWorkspaceInheritance: z.boolean(),
  permissions: z.array(FormPermissionSchema),
});

/**
 * Form permission settings for API responses (lenient)
 */
export const FormPermissionSettingsResponseSchema = z.object({
  formId: z.string(),
  workspaceId: z.string(),
  defaultAccessLevel: FormAccessLevelSchema.optional().default('view'),
  allowWorkspaceInheritance: z.boolean().optional().default(true),
  permissions: z.array(FormPermissionResponseSchema),
});

/**
 * Form permission settings input schema (with defaults)
 */
export const FormPermissionSettingsInputSchema = z.object({
  formId: z.string(),
  workspaceId: z.string(),
  defaultAccessLevel: FormAccessLevelSchema.default('view'),
  allowWorkspaceInheritance: z.boolean().default(true),
  permissions: z.array(FormPermissionInputSchema),
});

/**
 * Form permissions response
 */
export const FormPermissionsResponseSchema = z.object({
  formId: z.string(),
  permissions: z.array(FormPermissionResponseSchema),
  settings: FormPermissionSettingsResponseSchema,
});

/**
 * Bulk permission operation response
 */
export const BulkPermissionResponseSchema = z.object({
  success: z.boolean(),
  updatedCount: z.number(),
  failedCount: z.number(),
  errors: z.array(z.object({
    formId: z.string(),
    error: z.string(),
  })).optional(),
});

// ===============================
// API Operation Response Types
// ===============================

/**
 * Generic success response
 */
export const TallySuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

/**
 * Pagination metadata
 */
export const TallyPaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
  total: z.number().optional(),
});

// ===============================
// TypeScript Types
// ===============================

export type TallyApiResponse = z.infer<typeof TallyApiResponseSchema>;
export type TallyApiErrorResponse = z.infer<typeof TallyApiErrorResponseSchema>;
export type TallyFieldType = z.infer<typeof TallyFieldTypeSchema>;
export type TallyFileUpload = z.infer<typeof TallyFileUploadSchema>;
export type TallyOption = z.infer<typeof TallyOptionSchema>;
export type TallyMatrix = z.infer<typeof TallyMatrixSchema>;
export type TallyFormField = z.infer<typeof TallyFormFieldSchema>;
export type TallyQuestion = z.infer<typeof TallyQuestionSchema>;
export type TallyFormResponse = z.infer<typeof TallyFormResponseSchema>;
export type TallySubmission = z.infer<typeof TallySubmissionSchema>;
export type TallySubmissionsResponse = z.infer<typeof TallySubmissionsResponseSchema>;
export type TallyWebhookField = z.infer<typeof TallyWebhookFieldSchema>;
export type TallyWebhookData = z.infer<typeof TallyWebhookDataSchema>;
export type TallyWebhookPayload = z.infer<typeof TallyWebhookPayloadSchema>;
export type TallyForm = z.infer<typeof TallyFormSchema>;
export type TallyFormsResponse = z.infer<typeof TallyFormsResponseSchema>;
export type TallyWorkspaceMember = z.infer<typeof TallyWorkspaceMemberSchema>;
export type TallyWorkspace = z.infer<typeof TallyWorkspaceSchema>;
export type TallyWorkspacesResponse = z.infer<typeof TallyWorkspacesResponseSchema>;
export type FormPermission = z.infer<typeof FormPermissionSchema>;
export type FormPermissionResponse = z.infer<typeof FormPermissionResponseSchema>;
export type FormPermissionInput = z.infer<typeof FormPermissionInputSchema>;
export type BulkFormPermission = z.infer<typeof BulkFormPermissionSchema>;
export type FormPermissionSettings = z.infer<typeof FormPermissionSettingsSchema>;
export type FormPermissionSettingsResponse = z.infer<typeof FormPermissionSettingsResponseSchema>;
export type FormPermissionSettingsInput = z.infer<typeof FormPermissionSettingsInputSchema>;
export type FormPermissionsResponse = z.infer<typeof FormPermissionsResponseSchema>;
export type BulkPermissionResponse = z.infer<typeof BulkPermissionResponseSchema>;
export type TallySuccessResponse = z.infer<typeof TallySuccessResponseSchema>;
export type TallyPagination = z.infer<typeof TallyPaginationSchema>;

// ===============================
// Form Block Schemas for API Requests
// ===============================

/**
 * Tally block types for form creation
 */
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

/**
 * Tally group types for blocks
 */
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

/**
 * Basic payload structure that all blocks share
 */
export const TallyBlockBasePayloadSchema = z.object({
  html: z.string().optional(),
  title: z.string().optional(),
  isRequired: z.boolean().optional(),
  placeholder: z.string().optional(),
});

/**
 * Option structure for choice-based questions
 */
export const TallyBlockOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  index: z.number().optional(),
});

/**
 * Payload for dropdown/multiple choice option blocks
 */
export const TallyChoiceOptionPayloadSchema = TallyBlockBasePayloadSchema.extend({
  index: z.number(),
  text: z.string(),
});

/**
 * Payload for input blocks (text, email, etc.)
 */
export const TallyInputPayloadSchema = TallyBlockBasePayloadSchema.extend({
  isRequired: z.boolean(),
  placeholder: z.string(),
  options: z.array(TallyBlockOptionSchema).optional(),
});

/**
 * Payload for title blocks (FORM_TITLE, TITLE)
 */
export const TallyTitlePayloadSchema = z.object({
  html: z.string(),
  title: z.string().optional(),
});

/**
 * Union of all possible block payload types
 */
export const TallyBlockPayloadSchema = z.union([
  TallyTitlePayloadSchema,
  TallyInputPayloadSchema,
  TallyChoiceOptionPayloadSchema,
  TallyBlockBasePayloadSchema,
]);

/**
 * Complete Tally block structure for API requests
 */
export const TallyBlockSchema = z.object({
  uuid: z.string().uuid('Block UUID must be a valid UUID'),
  type: TallyBlockTypeSchema,
  groupUuid: z.string().uuid('Group UUID must be a valid UUID'),
  groupType: TallyGroupTypeSchema,
  title: z.string(),
  payload: TallyBlockPayloadSchema,
});

/**
 * Form creation payload structure for Tally API
 */
export const TallyFormCreatePayloadSchema = z.object({
  status: z.enum(['PUBLISHED', 'DRAFT']).default('PUBLISHED'),
  name: z.string().min(1, 'Form name is required'),
  blocks: z.array(TallyBlockSchema).min(1, 'At least one block is required'),
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

/**
 * Form update payload structure for Tally API
 */
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

// ===============================
// Schema Validation Utilities
// ===============================

/**
 * Validates and parses Tally API response data
 * @param schema - Zod schema to validate against
 * @param data - Raw response data
 * @returns Parsed and validated data
 * @throws ZodError if validation fails
 */
export function validateTallyResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  return schema.parse(data);
}

/**
 * Safely validates Tally API response data
 * @param schema - Zod schema to validate against  
 * @param data - Raw response data
 * @returns Validation result with success flag and parsed data or error
 */
export function safeParseTallyResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): z.SafeParseReturnType<unknown, T> {
  return schema.safeParse(data);
}

/**
 * Creates a validator function for a specific schema
 * @param schema - Zod schema to create validator for
 * @returns Validator function that throws on invalid data
 */
export function createTallyValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => schema.parse(data);
}

/**
 * Creates a safe validator function for a specific schema
 * @param schema - Zod schema to create validator for
 * @returns Safe validator function that returns result object
 */
export function createSafeTallyValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): z.SafeParseReturnType<unknown, T> => schema.safeParse(data);
}

export type TallyBlockType = z.infer<typeof TallyBlockTypeSchema>;
export type TallyGroupType = z.infer<typeof TallyGroupTypeSchema>;
export type TallyBlockBasePayload = z.infer<typeof TallyBlockBasePayloadSchema>;
export type TallyBlockOption = z.infer<typeof TallyBlockOptionSchema>;
export type TallyChoiceOptionPayload = z.infer<typeof TallyChoiceOptionPayloadSchema>;
export type TallyInputPayload = z.infer<typeof TallyInputPayloadSchema>;
export type TallyTitlePayload = z.infer<typeof TallyTitlePayloadSchema>;
export type TallyBlockPayload = z.infer<typeof TallyBlockPayloadSchema>;
export type TallyBlock = z.infer<typeof TallyBlockSchema>;
export type TallyFormCreatePayload = z.infer<typeof TallyFormCreatePayloadSchema>;
export type TallyFormUpdatePayload = z.infer<typeof TallyFormUpdatePayloadSchema>; 
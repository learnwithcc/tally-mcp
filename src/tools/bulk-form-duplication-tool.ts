import { z } from 'zod';
import { Tool } from './tool';
import { TallyApiService } from '../services';
import { TallyApiClientConfig } from '../services/TallyApiClient';
import { FormConfig } from '../models/form-config';

// ===========================
// Input Validation Schemas
// ===========================

/**
 * Schema for naming pattern configuration
 */
const NamingPatternSchema = z.object({
  template: z.string()
    .min(1, 'Template cannot be empty')
    .describe('Template for naming duplicated forms (use {n} for counter, {original} for original name)'),
  startIndex: z.number()
    .int()
    .min(1)
    .default(1)
    .describe('Starting index for numbering (default: 1)'),
  prefix: z.string()
    .optional()
    .describe('Optional prefix to add to all duplicated form names'),
  suffix: z.string()
    .optional()
    .describe('Optional suffix to add to all duplicated form names')
});

/**
 * Schema for field modifications during duplication
 */
const FieldModificationSchema = z.object({
  fieldId: z.string()
    .min(1, 'Field ID cannot be empty')
    .describe('ID of the field to modify'),
  action: z.enum(['add', 'remove', 'modify'])
    .describe('Action to perform on the field'),
  newValue: z.any()
    .optional()
    .describe('New value for the field (required for add/modify actions)'),
  targetIndex: z.number()
    .int()
    .min(0)
    .optional()
    .describe('Index position for add action (optional, defaults to end)')
});

/**
 * Schema for bulk modifications to apply during duplication
 */
const BulkModificationsSchema = z.object({
  titleModifications: z.object({
    append: z.string().optional().describe('Text to append to form titles'),
    prepend: z.string().optional().describe('Text to prepend to form titles'),
    replace: z.object({
      search: z.string().describe('Text to search for in titles'),
      replacement: z.string().describe('Replacement text')
    }).optional().describe('Text replacement in titles')
  }).optional().describe('Modifications to apply to form titles'),
  
  fieldModifications: z.array(FieldModificationSchema)
    .optional()
    .describe('Array of field modifications to apply'),
  
  metadataChanges: z.record(z.any())
    .optional()
    .describe('Changes to form metadata (custom properties)')
});

/**
 * Schema for workspace and permission validation
 */
const WorkspacePermissionSchema = z.object({
  workspaceId: z.string()
    .min(1, 'Workspace ID cannot be empty')
    .describe('Target workspace ID for duplication'),
  validatePermissions: z.boolean()
    .default(true)
    .describe('Whether to validate user permissions before duplication'),
  inheritPermissions: z.boolean()
    .default(true)
    .describe('Whether duplicated forms should inherit original permissions')
});

/**
 * Schema for batch processing configuration
 */
const BatchProcessingSchema = z.object({
  batchSize: z.number()
    .int()
    .min(1)
    .max(50)
    .default(5)
    .describe('Number of forms to process per batch (1-50, default: 5)'),
  delayBetweenBatches: z.number()
    .int()
    .min(0)
    .max(30000)
    .default(1000)
    .describe('Milliseconds to wait between batches (0-30000, default: 1000)'),
  maxRetries: z.number()
    .int()
    .min(0)
    .max(5)
    .default(3)
    .describe('Maximum retry attempts per form (0-5, default: 3)'),
  continueOnError: z.boolean()
    .default(false)
    .describe('Whether to continue processing if individual forms fail')
});

/**
 * Schema for progress tracking options
 */
const ProgressTrackingSchema = z.object({
  enableProgressUpdates: z.boolean()
    .default(true)
    .describe('Enable real-time progress updates via SSE'),
  updateInterval: z.number()
    .int()
    .min(100)
    .max(5000)
    .default(500)
    .describe('Milliseconds between progress updates (100-5000, default: 500)'),
  includeDetailedLogs: z.boolean()
    .default(false)
    .describe('Include detailed operation logs in progress updates')
});

/**
 * Schema for rollback configuration
 */
const RollbackConfigSchema = z.object({
  enableRollback: z.boolean()
    .default(true)
    .describe('Enable automatic rollback on batch failure'),
  rollbackThreshold: z.number()
    .min(0)
    .max(1)
    .default(0.5)
    .describe('Failure percentage threshold to trigger rollback (0-1, default: 0.5)'),
  keepPartialResults: z.boolean()
    .default(false)
    .describe('Keep successfully created forms even if batch fails')
});

/**
 * Main input schema for bulk form duplication
 */
export const BulkFormDuplicationInputSchema = z.object({
  sourceFormIds: z.array(z.string().min(1, 'Form ID cannot be empty'))
    .min(1, 'At least one source form ID is required')
    .max(20, 'Maximum 20 source forms allowed per operation')
    .describe('Array of source form IDs to duplicate'),
  
  duplicateCount: z.number()
    .int()
    .min(1, 'Must create at least 1 duplicate')
    .max(100, 'Maximum 100 duplicates allowed per source form')
    .default(1)
    .describe('Number of duplicates to create per source form'),
  
  namingPattern: NamingPatternSchema
    .default({
      template: '{original} - Copy {n}',
      startIndex: 1
    })
    .describe('Configuration for naming duplicated forms'),
  
  bulkModifications: BulkModificationsSchema
    .optional()
    .describe('Bulk modifications to apply during duplication'),
  
  workspaceSettings: WorkspacePermissionSchema
    .optional()
    .describe('Workspace and permission settings'),
  
  batchProcessing: BatchProcessingSchema
    .default({
      batchSize: 5,
      delayBetweenBatches: 1000,
      maxRetries: 3,
      continueOnError: false
    })
    .describe('Batch processing configuration'),
  
  progressTracking: ProgressTrackingSchema
    .default({
      enableProgressUpdates: true,
      updateInterval: 500,
      includeDetailedLogs: false
    })
    .describe('Progress tracking configuration'),
  
  rollbackConfig: RollbackConfigSchema
    .default({
      enableRollback: true,
      rollbackThreshold: 0.5,
      keepPartialResults: false
    })
    .describe('Rollback configuration for failed operations'),
  
  dryRun: z.boolean()
    .default(false)
    .describe('Preview the duplication operation without actually creating forms')
});

/**
 * Type definitions derived from schemas
 */
export type BulkFormDuplicationInput = z.infer<typeof BulkFormDuplicationInputSchema>;
export type NamingPattern = z.infer<typeof NamingPatternSchema>;
export type FieldModification = z.infer<typeof FieldModificationSchema>;
export type BulkModifications = z.infer<typeof BulkModificationsSchema>;
export type WorkspacePermission = z.infer<typeof WorkspacePermissionSchema>;
export type BatchProcessing = z.infer<typeof BatchProcessingSchema>;
export type ProgressTracking = z.infer<typeof ProgressTrackingSchema>;
export type RollbackConfig = z.infer<typeof RollbackConfigSchema>;

/**
 * Output schema for bulk duplication result
 */
export const BulkFormDuplicationResultSchema = z.object({
  success: z.boolean().describe('Whether the operation completed successfully'),
  summary: z.object({
    totalSourceForms: z.number().describe('Number of source forms processed'),
    totalDuplicatesRequested: z.number().describe('Total number of duplicates requested'),
    totalDuplicatesCreated: z.number().describe('Total number of duplicates actually created'),
    totalErrors: z.number().describe('Total number of errors encountered'),
    operationDuration: z.number().describe('Operation duration in milliseconds')
  }),
  results: z.array(z.object({
    sourceFormId: z.string().describe('ID of the source form'),
    sourceFormName: z.string().optional().describe('Name of the source form'),
    duplicates: z.array(z.object({
      formId: z.string().describe('ID of the created duplicate'),
      formName: z.string().describe('Name of the created duplicate'),
      formUrl: z.string().optional().describe('URL of the created duplicate'),
      status: z.enum(['success', 'failed', 'skipped']).describe('Status of this duplicate creation'),
      error: z.string().optional().describe('Error message if creation failed')
    }))
  })),
  errors: z.array(z.object({
    formId: z.string().describe('Form ID associated with the error'),
    error: z.string().describe('Error message'),
    timestamp: z.string().describe('ISO timestamp of the error')
  })),
  rollbackInfo: z.object({
    wasTriggered: z.boolean().describe('Whether rollback was triggered'),
    rolledBackForms: z.array(z.string()).optional().describe('IDs of forms that were rolled back'),
    rollbackErrors: z.array(z.string()).optional().describe('Errors encountered during rollback')
  }).optional()
});

export type BulkFormDuplicationResult = z.infer<typeof BulkFormDuplicationResultSchema>;

/**
 * Validation utility functions
 */
export class BulkDuplicationValidator {
  /**
   * Validate and parse bulk duplication input
   */
  static validateInput(input: unknown): { success: boolean; data?: BulkFormDuplicationInput; error?: string } {
    try {
      const result = BulkFormDuplicationInputSchema.safeParse(input);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        const errorMessages = result.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join('; ');
        return { success: false, error: errorMessages };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      };
    }
  }

  /**
   * Validate form ID format
   */
  static isValidFormId(formId: string): boolean {
    // Basic validation - alphanumeric with hyphens and underscores
    return /^[a-zA-Z0-9_-]+$/.test(formId) && formId.length > 0 && formId.length <= 50;
  }

  /**
   * Validate workspace ID format
   */
  static isValidWorkspaceId(workspaceId: string): boolean {
    // Similar validation to form ID
    return /^[a-zA-Z0-9_-]+$/.test(workspaceId) && workspaceId.length > 0 && workspaceId.length <= 50;
  }

  /**
   * Validate naming pattern template
   */
  static validateNamingPattern(pattern: NamingPattern): { valid: boolean; error?: string } {
    const { template, startIndex } = pattern;
    
    // Check if template contains required placeholders
    if (!template.includes('{original}') && !template.includes('{n}')) {
      return { 
        valid: false, 
        error: 'Template must contain either {original} or {n} placeholder' 
      };
    }
    
    // Check for valid placeholder format
    const validPlaceholders = ['{original}', '{n}', '{prefix}', '{suffix}'];
    const placeholderRegex = /{([^}]+)}/g;
    let match;
    
    while ((match = placeholderRegex.exec(template)) !== null) {
      const placeholder = match[0];
      if (!validPlaceholders.includes(placeholder)) {
        return { 
          valid: false, 
          error: `Invalid placeholder '${placeholder}'. Valid placeholders: ${validPlaceholders.join(', ')}` 
        };
      }
    }
    
    if (startIndex < 1) {
      return { 
        valid: false, 
        error: 'Start index must be at least 1' 
      };
    }
    
    return { valid: true };
  }

  /**
   * Validate bulk modifications
   */
  static validateBulkModifications(modifications: BulkModifications): { valid: boolean; error?: string } {
    const { fieldModifications } = modifications;
    
    if (fieldModifications) {
      for (const mod of fieldModifications) {
        if ((mod.action === 'add' || mod.action === 'modify') && mod.newValue === undefined) {
          return { 
            valid: false, 
            error: `Field modification for '${mod.fieldId}' with action '${mod.action}' requires newValue` 
          };
        }
        
        if (mod.action === 'add' && mod.targetIndex !== undefined && mod.targetIndex < 0) {
          return { 
            valid: false, 
            error: `Target index for field '${mod.fieldId}' cannot be negative` 
          };
        }
      }
    }
    
    return { valid: true };
  }

  /**
   * Calculate total operations for progress tracking
   */
  static calculateTotalOperations(input: BulkFormDuplicationInput): number {
    return input.sourceFormIds.length * input.duplicateCount;
  }

  /**
   * Estimate operation duration based on input parameters
   */
  static estimateOperationDuration(input: BulkFormDuplicationInput): number {
    const totalOperations = this.calculateTotalOperations(input);
    const { batchSize, delayBetweenBatches } = input.batchProcessing;
    
    // Estimate ~2 seconds per form creation + batch delays
    const estimatedFormCreationTime = totalOperations * 2000;
    const numberOfBatches = Math.ceil(totalOperations / batchSize);
    const totalBatchDelays = (numberOfBatches - 1) * delayBetweenBatches;
    
    return estimatedFormCreationTime + totalBatchDelays;
  }
} 
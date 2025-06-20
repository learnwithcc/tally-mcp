import { z } from 'zod';
import { Tool } from './tool';
import { TallyApiService } from '../services';
import { TallyApiClientConfig } from '../services/TallyApiClient';
import { FormConfig } from '../models/form-config';
import { TallyForm, TallyFormSchema, TallyFormsResponse } from '../models/tally-schemas';
import { SubmissionBehavior } from '../models/form-config';

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

// ===========================
// Form Retrieval and Validation
// ===========================

/**
 * Schema for form accessibility result
 */
export const FormAccessibilitySchema = z.object({
  formId: z.string().describe('ID of the form'),
  accessible: z.boolean().describe('Whether the form is accessible'),
  reason: z.string().optional().describe('Reason if form is not accessible'),
  permissions: z.array(z.string()).optional().describe('Available permissions for the form')
});

export type FormAccessibility = z.infer<typeof FormAccessibilitySchema>;

/**
 * Schema for validated form structure
 */
export const ValidatedFormStructureSchema = z.object({
  formId: z.string().describe('ID of the form'),
  originalForm: TallyFormSchema.describe('Original form data from Tally API'),
  isValid: z.boolean().describe('Whether the form structure is valid for duplication'),
  validationErrors: z.array(z.string()).describe('List of validation errors if any'),
  complexityScore: z.number().min(1).max(10).describe('Complexity score for the form (1-10)'),
  estimatedDuplicationTime: z.number().describe('Estimated time to duplicate this form in milliseconds'),
  dependencies: z.array(z.string()).optional().describe('IDs of other forms this form depends on'),
  metadata: z.record(z.any()).optional().describe('Additional metadata about the form')
});

export type ValidatedFormStructure = z.infer<typeof ValidatedFormStructureSchema>;

/**
 * Schema for form relationship tracking
 */
export const FormRelationshipSchema = z.object({
  originalFormId: z.string().describe('ID of the original form'),
  duplicatedFormId: z.string().describe('ID of the duplicated form'),
  duplicatedFormName: z.string().describe('Name of the duplicated form'),
  relationshipType: z.enum(['duplicate', 'template_instance', 'variant']).describe('Type of relationship'),
  createdAt: z.string().datetime().describe('When the relationship was created'),
  createdBy: z.string().describe('Who created the duplicate'),
  modifications: z.array(z.object({
    field: z.string().describe('Field that was modified'),
    originalValue: z.any().describe('Original value'),
    newValue: z.any().describe('New value'),
    reason: z.string().optional().describe('Reason for the modification')
  })).optional().describe('List of modifications made during duplication'),
  tags: z.array(z.string()).optional().describe('Tags associated with this relationship')
});

export type FormRelationship = z.infer<typeof FormRelationshipSchema>;

/**
 * Form retrieval and validation service for bulk duplication
 */
export class FormRetrievalService {
  private tallyApiService: TallyApiService;

  constructor(apiClientConfig: TallyApiClientConfig) {
    this.tallyApiService = new TallyApiService(apiClientConfig);
  }

  /**
   * Retrieve and validate source forms for duplication
   */
  async retrieveAndValidateForms(
    sourceFormIds: string[],
    workspaceSettings?: WorkspacePermission
  ): Promise<{
    validatedForms: ValidatedFormStructure[];
    accessibilityResults: FormAccessibility[];
    totalValidForms: number;
    totalErrors: number;
    errors: string[];
  }> {
    const validatedForms: ValidatedFormStructure[] = [];
    const accessibilityResults: FormAccessibility[] = [];
    const errors: string[] = [];

    // Retrieve forms in parallel for better performance
    const formRetrievalPromises = sourceFormIds.map(async (formId) => {
      try {
        // Check form accessibility first
        const accessibility = await this.checkFormAccessibility(formId, workspaceSettings);
        accessibilityResults.push(accessibility);

        if (!accessibility.accessible) {
          errors.push(`Form ${formId} is not accessible: ${accessibility.reason}`);
          return null;
        }

        // Retrieve form structure
        const form = await this.tallyApiService.getForm(formId);
        
        // Validate form structure
        const validatedStructure = await this.validateFormStructure(form);
        
        if (!validatedStructure.isValid) {
          errors.push(...validatedStructure.validationErrors.map(err => `Form ${formId}: ${err}`));
          return null;
        }

        validatedForms.push(validatedStructure);
        return validatedStructure;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to retrieve form ${formId}: ${errorMessage}`);
        accessibilityResults.push({
          formId,
          accessible: false,
          reason: `API Error: ${errorMessage}`
        });
        return null;
      }
    });

    await Promise.all(formRetrievalPromises);

    return {
      validatedForms,
      accessibilityResults,
      totalValidForms: validatedForms.length,
      totalErrors: errors.length,
      errors
    };
  }

  /**
   * Check if a form is accessible for duplication
   */
  async checkFormAccessibility(
    formId: string,
    workspaceSettings?: WorkspacePermission
  ): Promise<FormAccessibility> {
    try {
      // Basic validation
      if (!BulkDuplicationValidator.isValidFormId(formId)) {
        return {
          formId,
          accessible: false,
          reason: 'Invalid form ID format'
        };
      }

      // Try to retrieve basic form info
      const form = await this.tallyApiService.getForm(formId);
      
      if (!form) {
        return {
          formId,
          accessible: false,
          reason: 'Form not found'
        };
      }

      // Check workspace permissions if specified
      if (workspaceSettings?.workspaceId) {
        const hasWorkspaceAccess = await this.checkWorkspacePermissions(
          form,
          workspaceSettings.workspaceId
        );
        
        if (!hasWorkspaceAccess) {
          return {
            formId,
            accessible: false,
            reason: 'Insufficient workspace permissions'
          };
        }
      }

      // Check form status - drafts may not be suitable for duplication
      if (form.status === 'draft' || form.status === 'archived') {
        return {
          formId,
          accessible: true,
          reason: `Form is in ${form.status} status - duplication may be limited`,
          permissions: ['read', 'duplicate']
        };
      }

      return {
        formId,
        accessible: true,
        permissions: ['read', 'duplicate', 'modify']
      };
    } catch (error) {
      return {
        formId,
        accessible: false,
        reason: error instanceof Error ? error.message : 'Access check failed'
      };
    }
  }

  /**
   * Validate form structure for duplication compatibility
   */
  async validateFormStructure(form: TallyForm): Promise<ValidatedFormStructure> {
    const validationErrors: string[] = [];
    let complexityScore = 1;
    let estimatedDuplicationTime = 2000; // Base 2 seconds

    // Basic required fields validation
    if (!form.id) {
      validationErrors.push('Form ID is missing');
    }

    if (!form.name && !form.title) {
      validationErrors.push('Form must have a name or title');
    }

    // Analyze form complexity
    const complexityAnalysis = this.analyzeFormComplexity(form);
    complexityScore = complexityAnalysis.score;
    estimatedDuplicationTime = complexityAnalysis.estimatedTime;

    // Validate form structure for duplication
    if (form.status === 'deleted') {
      validationErrors.push('Cannot duplicate deleted forms');
    }

    // Check for unsupported field types or configurations
    const unsupportedFeatures = this.checkForUnsupportedFeatures(form);
    if (unsupportedFeatures.length > 0) {
      validationErrors.push(...unsupportedFeatures.map(feature => 
        `Unsupported feature: ${feature}`
      ));
    }

    // Extract dependencies
    const dependencies = this.extractFormDependencies(form);

    return {
      formId: form.id,
      originalForm: form,
      isValid: validationErrors.length === 0,
      validationErrors,
      complexityScore,
      estimatedDuplicationTime,
      dependencies,
      metadata: {
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
        submissionsCount: form.submissionsCount || 0,
        hasEmbedUrl: !!form.embedUrl,
        hasPublicUrl: !!form.url || !!form.shareUrl || !!form.publicUrl
      }
    };
  }

  /**
   * Analyze form complexity to determine duplication difficulty
   */
  private analyzeFormComplexity(form: TallyForm): { score: number; estimatedTime: number } {
    let score = 1;
    let timeMultiplier = 1;

    // Base complexity factors
    if (form.submissionsCount && form.submissionsCount > 1000) {
      score += 1;
      timeMultiplier += 0.2;
    }

    if (form.description && form.description.length > 500) {
      score += 0.5;
    }

    // Form has public/share URLs - may have complex sharing settings
    if (form.url || form.shareUrl || form.publicUrl || form.embedUrl) {
      score += 1;
      timeMultiplier += 0.3;
    }

    // Recent updates might indicate active development
    if (form.updatedAt) {
      const daysSinceUpdate = (Date.now() - new Date(form.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 7) {
        score += 0.5;
      }
    }

    // Published forms are generally more complex
    if (form.isPublished) {
      score += 1;
      timeMultiplier += 0.2;
    }

    // Ensure score is within bounds
    score = Math.min(Math.max(score, 1), 10);
    
    // Calculate estimated time (base 2 seconds + complexity factors)
    const estimatedTime = Math.round(2000 * timeMultiplier * (score / 5));

    return { score, estimatedTime };
  }

  /**
   * Check for features that may not be supported in duplication
   */
  private checkForUnsupportedFeatures(form: TallyForm): string[] {
    const unsupported: string[] = [];

    // Add checks for specific features that are difficult to duplicate
    // This is extensible based on actual API limitations discovered during testing

    return unsupported;
  }

  /**
   * Extract form dependencies (e.g., references to other forms)
   */
  private extractFormDependencies(form: TallyForm): string[] {
    const dependencies: string[] = [];

    // Check for form references in description or other fields
    // This would be based on actual form structure analysis
    
    return dependencies;
  }

  /**
   * Check workspace permissions for form access
   */
  private async checkWorkspacePermissions(
    form: TallyForm,
    workspaceId: string
  ): Promise<boolean> {
    try {
      // Basic workspace ID validation
      if (!BulkDuplicationValidator.isValidWorkspaceId(workspaceId)) {
        return false;
      }

      // This would integrate with actual workspace permission checking
      // For now, we'll assume access is granted if the workspace ID is valid
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Form relationship tracking service
 */
export class FormRelationshipTracker {
  private relationships: Map<string, FormRelationship[]> = new Map();

  /**
   * Track a new form relationship
   */
  addRelationship(relationship: FormRelationship): void {
    const { originalFormId } = relationship;
    
    if (!this.relationships.has(originalFormId)) {
      this.relationships.set(originalFormId, []);
    }
    
    this.relationships.get(originalFormId)!.push(relationship);
  }

  /**
   * Get all relationships for a source form
   */
  getRelationships(originalFormId: string): FormRelationship[] {
    return this.relationships.get(originalFormId) || [];
  }

  /**
   * Get all tracked relationships
   */
  getAllRelationships(): Map<string, FormRelationship[]> {
    return new Map(this.relationships);
  }

  /**
   * Find duplicates of a specific form
   */
  findDuplicates(originalFormId: string): FormRelationship[] {
    return this.getRelationships(originalFormId).filter(
      rel => rel.relationshipType === 'duplicate'
    );
  }

  /**
   * Track bulk duplication operation relationships
   */
  trackBulkDuplication(
    sourceFormIds: string[],
    createdForms: Array<{
      originalFormId: string;
      duplicatedFormId: string;
      duplicatedFormName: string;
      modifications?: Array<{
        field: string;
        originalValue: any;
        newValue: any;
        reason?: string;
      }>;
    }>,
    createdBy: string,
    operationTags?: string[]
  ): void {
    const now = new Date().toISOString();

    createdForms.forEach(form => {
      const relationship: FormRelationship = {
        originalFormId: form.originalFormId,
        duplicatedFormId: form.duplicatedFormId,
        duplicatedFormName: form.duplicatedFormName,
        relationshipType: 'duplicate',
        createdAt: now,
        createdBy,
        modifications: form.modifications,
        tags: [
          'bulk-operation',
          ...(operationTags || [])
        ]
      };

      this.addRelationship(relationship);
    });
  }

  /**
   * Export relationships for persistence
   */
  exportRelationships(): Record<string, FormRelationship[]> {
    const exported: Record<string, FormRelationship[]> = {};
    
    this.relationships.forEach((relationships, formId) => {
      exported[formId] = relationships;
    });
    
    return exported;
  }

  /**
   * Import relationships from persistence
   */
  importRelationships(data: Record<string, FormRelationship[]>): void {
    this.relationships.clear();
    
    Object.entries(data).forEach(([formId, relationships]) => {
      this.relationships.set(formId, relationships);
    });
  }

  /**
   * Clear all relationships
   */
  clearRelationships(): void {
    this.relationships.clear();
  }

  /**
   * Get relationship statistics
   */
  getStatistics(): {
    totalOriginalForms: number;
    totalDuplicates: number;
    averageDuplicatesPerForm: number;
    relationshipTypes: Record<string, number>;
  } {
    let totalDuplicates = 0;
    const relationshipTypes: Record<string, number> = {};

    this.relationships.forEach(relationships => {
      totalDuplicates += relationships.length;
      
      relationships.forEach(rel => {
        relationshipTypes[rel.relationshipType] = 
          (relationshipTypes[rel.relationshipType] || 0) + 1;
      });
    });

    return {
      totalOriginalForms: this.relationships.size,
      totalDuplicates,
      averageDuplicatesPerForm: this.relationships.size > 0 
        ? totalDuplicates / this.relationships.size 
        : 0,
      relationshipTypes
    };
  }
}

// ===========================
// Bulk Duplication Engine
// ===========================

/**
 * Core engine responsible for performing the actual duplication work in batches while
 * respecting rate-limits, retry logic and progress callbacks. This is deliberately
 * implemented with a very defensive approach – all external API interactions are wrapped
 * in try/catch blocks so the engine can continue processing when `continueOnError` is set.
 *
 * NOTE: The implementation focuses on architectural correctness and unit-testability. It
 * does not attempt to clone every nuance of the source form – that will be addressed in
 * later subtasks (39.4 & 39.5). For now we create an extremely basic `FormConfig` based on
 * the original form title so we have an end-to-end working pipeline that can be expanded
 * incrementally.
 */
export class BulkDuplicationEngine {
  private tallyApiService: TallyApiService;
  private formRetrievalService: FormRetrievalService;
  private relationshipTracker: FormRelationshipTracker;

  private progressCallback?: (progress: {
    completed: number;
    total: number;
    message?: string;
    currentBatch?: number;
    totalBatches?: number;
  }) => void;

  constructor(
    apiConfig: TallyApiClientConfig,
    relationshipTracker: FormRelationshipTracker,
    progressCallback?: (progress: {
      completed: number;
      total: number;
      message?: string;
      currentBatch?: number;
      totalBatches?: number;
    }) => void
  ) {
    this.tallyApiService = new TallyApiService(apiConfig);
    this.formRetrievalService = new FormRetrievalService(apiConfig);
    this.relationshipTracker = relationshipTracker;
    this.progressCallback = progressCallback;
  }

  /**
   * Perform bulk duplication.
   */
  async duplicateForms(
    rawInput: unknown,
    userId: string = 'system'
  ): Promise<BulkFormDuplicationResult> {
    // 1. Validate input -----------------------------------------------------
    const validation = BulkDuplicationValidator.validateInput(rawInput);
    if (!validation.success || !validation.data) {
      throw new Error(validation.error || 'Invalid input');
    }
    const input = validation.data;

    const startTime = Date.now();

    // 2. Retrieve & validate source forms -----------------------------------
    const retrievalResult = await this.formRetrievalService.retrieveAndValidateForms(
      input.sourceFormIds,
      input.workspaceSettings
    );

    const errors: Array<{ formId: string; error: string; timestamp: string }> = [];
    const creationResults: Array<{
      sourceFormId: string;
      sourceFormName?: string;
      duplicates: Array<{
        formId: string;
        formName: string;
        formUrl?: string;
        status: 'success' | 'failed' | 'skipped';
        error?: string;
      }>;
    }> = [];

    // Map accessibility errors
    retrievalResult.accessibilityResults.forEach(acc => {
      if (!acc.accessible) {
        errors.push({ formId: acc.formId, error: acc.reason || 'Inaccessible form', timestamp: new Date().toISOString() });
      }
    });

    // Filter out invalid forms before we continue
    const validForms = retrievalResult.validatedForms.filter(v => v.isValid);

    const totalOperations = validForms.length * input.duplicateCount;

    let completedOperations = 0;

    const { batchSize, delayBetweenBatches, maxRetries, continueOnError } = input.batchProcessing;

    const batches: ValidatedFormStructure[][] = [];
    for (let i = 0; i < validForms.length; i += batchSize) {
      batches.push(validForms.slice(i, i + batchSize));
    }

    // Helper to send progress updates
    const updateProgress = (msg?: string, batchIdx?: number) => {
      if (this.progressCallback && input.progressTracking.enableProgressUpdates) {
        this.progressCallback({
          completed: completedOperations,
          total: totalOperations,
          message: msg,
          currentBatch: batchIdx !== undefined ? batchIdx + 1 : undefined,
          totalBatches: batches.length,
        });
      }
    };

    updateProgress('Starting duplication operation');

    // 3. Process batches -----------------------------------------------------
    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const batch = batches[batchIdx] || [];

      // eslint-disable-next-line no-loop-func
      await Promise.all(
        batch.map(async (validatedForm) => {
          const originalName = (validatedForm.originalForm.name || validatedForm.originalForm.title || 'Duplicate');
          const duplicatesForForm: Array<{
            formId: string;
            formName: string;
            formUrl?: string;
            status: 'success' | 'failed' | 'skipped';
            error?: string;
          }> = [];

          for (let dupIdx = 0; dupIdx < input.duplicateCount; dupIdx++) {
            const sequenceNumber = input.namingPattern.startIndex + dupIdx;
            const formName = this.generateDuplicateName(
              originalName,
              input.namingPattern,
              sequenceNumber
            );

            if (input.dryRun) {
              // Dry-run – we do not call the API
              duplicatesForForm.push({
                formId: 'dry-run',
                formName,
                status: 'skipped'
              });
              completedOperations++;
              continue;
            }

            // Retry logic ---------------------------------------------------
            let attempt = 0;
            let success = false;
            let createdFormId = '';
            let createdFormUrl: string | undefined;
            let lastError: any;
            while (attempt <= maxRetries && !success) {
              try {
                const formConfig = this.buildFormConfigFromSource(validatedForm, formName, input.bulkModifications);
                const createdForm = await this.tallyApiService.createForm(formConfig as any);
                createdFormId = createdForm.id;
                createdFormUrl = (createdForm as any).url;
                success = true;
              } catch (err) {
                lastError = err;
                attempt++;
                if (attempt > maxRetries) break;
              }
            }

            if (success) {
              duplicatesForForm.push({
                formId: createdFormId,
                formName,
                formUrl: createdFormUrl,
                status: 'success'
              });
            } else {
              duplicatesForForm.push({
                formId: 'unknown',
                formName,
                status: 'failed',
                error: (lastError as Error)?.message || 'Unknown error'
              });
              errors.push({
                formId: validatedForm.formId,
                error: (lastError as Error)?.message || 'Unknown error',
                timestamp: new Date().toISOString()
              });
              if (!continueOnError) {
                throw lastError;
              }
            }

            completedOperations++;
            updateProgress(`Processed ${completedOperations}/${totalOperations}`);
          }

          creationResults.push({
            sourceFormId: validatedForm.formId,
            sourceFormName: originalName,
            duplicates: duplicatesForForm
          });
        })
      );

      // Send batch completion progress
      updateProgress('Completed batch', batchIdx);

      // Delay between batches
      if (batchIdx < batches.length - 1 && delayBetweenBatches > 0) {
        await this.delay(delayBetweenBatches);
      }
    }

    // 4. Track relationships -----------------------------------------------
    const allCreatedFormsFlat: Array<{
      originalFormId: string;
      duplicatedFormId: string;
      duplicatedFormName: string;
    }> = [];
    creationResults.forEach(cr => {
      cr.duplicates.forEach(d => {
        if (d.status === 'success') {
          allCreatedFormsFlat.push({
            originalFormId: cr.sourceFormId,
            duplicatedFormId: d.formId,
            duplicatedFormName: d.formName
          });
        }
      });
    });

    this.relationshipTracker.trackBulkDuplication(
      validForms.map(v => v.formId),
      allCreatedFormsFlat,
      userId,
      ['bulk-duplication']
    );

    // 5. Compile summary ----------------------------------------------------
    const endTime = Date.now();

    const result: BulkFormDuplicationResult = {
      success: errors.length === 0,
      summary: {
        totalSourceForms: input.sourceFormIds.length,
        totalDuplicatesRequested: input.sourceFormIds.length * input.duplicateCount,
        totalDuplicatesCreated: allCreatedFormsFlat.length,
        totalErrors: errors.length,
        operationDuration: endTime - startTime
      },
      results: creationResults,
      errors
    };

    updateProgress('Duplication operation completed');

    return result;
  }

  /**
   * Generates a duplicate name based on the naming pattern
   */
  private generateDuplicateName(
    originalName: string,
    pattern: NamingPattern,
    sequenceNumber: number
  ): string {
    let name = pattern.template
      .replace('{n}', sequenceNumber.toString())
      .replace('{original}', originalName);

    if (pattern.prefix) {
      name = `${pattern.prefix} ${name}`;
    }

    if (pattern.suffix) {
      name = `${name} ${pattern.suffix}`;
    }

    return name.trim();
  }

  /**
   * Builds a minimal FormConfig from the source form. Later subtasks will enrich this.
   */
  private buildFormConfigFromSource(
    source: ValidatedFormStructure,
    newTitle: string,
    modifications?: BulkModifications
  ): Partial<FormConfig> {
    // Start with a shallow clone from the source form where possible
    const baseConfig: Partial<FormConfig> = {
      title: newTitle,
      description: source.originalForm.description,
      metadata: {
        ...(source.originalForm as any).metadata,
      },
      questions: [], // TODO: mapping blocks ➜ questions (out-of-scope for minimal support)
      settings: {
        submissionBehavior: SubmissionBehavior.MESSAGE,
      },
    };

    if (modifications) {
      this.applyBulkModifications(baseConfig, modifications);
    }

    return baseConfig;
  }

  /**
   * Apply bulk modifications (title, fields, metadata) to a FormConfig instance.
   * This intentionally supports only a subset of all possible operations – enough
   * for functional testing of Task 39.4. More advanced logic (e.g. full field
   * mapping from Tally blocks) can be layered on later without breaking the API.
   */
  private applyBulkModifications(
    config: Partial<FormConfig>,
    mods: BulkModifications
  ): void {
    // Title modifications --------------------------------------------------
    if (mods.titleModifications) {
      let title = config.title ?? '';

      const { prepend, append, replace } = mods.titleModifications;

      if (prepend) {
        title = `${prepend}${title}`;
      }

      if (append) {
        title = `${title}${append}`;
      }

      if (replace) {
        const { search, replacement } = replace;
        title = title.split(search).join(replacement);
      }

      config.title = title;
    }

    // Metadata changes -----------------------------------------------------
    if (mods.metadataChanges) {
      config.metadata = {
        ...(config.metadata || {}),
        ...mods.metadataChanges,
      };
    }

    // Field modifications --------------------------------------------------
    // This minimal implementation only works if questions[] is populated.
    if (mods.fieldModifications && mods.fieldModifications.length > 0 && Array.isArray(config.questions)) {
      mods.fieldModifications.forEach((fm) => {
        switch (fm.action) {
          case 'add':
            if (fm.newValue) {
              const index = fm.targetIndex !== undefined ? fm.targetIndex : config.questions!.length;
              (config.questions as any[]).splice(index, 0, fm.newValue);
            }
            break;
          case 'remove':
            (config.questions as any[]).splice(
              (config.questions as any[]).findIndex((q: any) => q.id === fm.fieldId),
              1
            );
            break;
          case 'modify':
            const idx = (config.questions as any[]).findIndex((q: any) => q.id === fm.fieldId);
            if (idx >= 0 && fm.newValue) {
              (config.questions as any[])[idx] = {
                ...(config.questions as any[])[idx],
                ...fm.newValue,
              };
            }
            break;
          default:
            break;
        }
      });
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 
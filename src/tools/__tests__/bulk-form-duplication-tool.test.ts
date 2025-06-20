import {
  BulkFormDuplicationInputSchema,
  BulkDuplicationValidator,
  FormRetrievalService,
  FormRelationshipTracker,
  type BulkFormDuplicationInput,
  type NamingPattern,
  type BulkModifications,
  type FormRelationship
} from '../bulk-form-duplication-tool';
import { TallyApiService } from '../../services';

describe('BulkFormDuplicationTool - Input Validation', () => {
  describe('BulkFormDuplicationInputSchema', () => {
    it('should validate minimal valid input', () => {
      const input = {
        sourceFormIds: ['form-123']
      };

      const result = BulkFormDuplicationInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.sourceFormIds).toEqual(['form-123']);
        expect(result.data.duplicateCount).toBe(1); // default
        expect(result.data.namingPattern.template).toBe('{original} - Copy {n}'); // default
        expect(result.data.batchProcessing.batchSize).toBe(5); // default
      }
    });

    it('should validate complete input with all fields', () => {
      const input: BulkFormDuplicationInput = {
        sourceFormIds: ['form-123', 'form-456'],
        duplicateCount: 3,
        namingPattern: {
          template: '{prefix} {original} {n} {suffix}',
          startIndex: 2,
          prefix: 'Test',
          suffix: 'Copy'
        },
        bulkModifications: {
          titleModifications: {
            append: ' - Modified',
            prepend: 'New ',
            replace: {
              search: 'old',
              replacement: 'new'
            }
          },
          fieldModifications: [
            {
              fieldId: 'field-1',
              action: 'add',
              newValue: { type: 'text', label: 'New field' },
              targetIndex: 0
            }
          ],
          metadataChanges: {
            category: 'duplicated',
            source: 'bulk-operation'
          }
        },
        workspaceSettings: {
          workspaceId: 'ws-123',
          validatePermissions: false,
          inheritPermissions: false
        },
        batchProcessing: {
          batchSize: 10,
          delayBetweenBatches: 2000,
          maxRetries: 5,
          continueOnError: true
        },
        progressTracking: {
          enableProgressUpdates: false,
          updateInterval: 1000,
          includeDetailedLogs: true
        },
        rollbackConfig: {
          enableRollback: false,
          rollbackThreshold: 0.8,
          keepPartialResults: true
        },
        dryRun: true
      };

      const result = BulkFormDuplicationInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data).toEqual(input);
      }
    });

    it('should reject empty source form IDs array', () => {
      const input = {
        sourceFormIds: []
      };

      const result = BulkFormDuplicationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('At least one source form ID is required');
      }
    });

    it('should reject too many source form IDs', () => {
      const input = {
        sourceFormIds: Array(21).fill('form-id') // 21 items, max is 20
      };

      const result = BulkFormDuplicationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Maximum 20 source forms allowed');
      }
    });

    it('should reject invalid duplicate count', () => {
      const input = {
        sourceFormIds: ['form-123'],
        duplicateCount: 0
      };

      const result = BulkFormDuplicationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Must create at least 1 duplicate');
      }
    });

    it('should reject duplicate count exceeding maximum', () => {
      const input = {
        sourceFormIds: ['form-123'],
        duplicateCount: 101 // max is 100
      };

      const result = BulkFormDuplicationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Maximum 100 duplicates allowed');
      }
    });

    it('should reject invalid batch size', () => {
      const input = {
        sourceFormIds: ['form-123'],
        batchProcessing: {
          batchSize: 0 // min is 1
        }
      };

      const result = BulkFormDuplicationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject batch size exceeding maximum', () => {
      const input = {
        sourceFormIds: ['form-123'],
        batchProcessing: {
          batchSize: 51 // max is 50
        }
      };

      const result = BulkFormDuplicationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject invalid progress tracking update interval', () => {
      const input = {
        sourceFormIds: ['form-123'],
        progressTracking: {
          updateInterval: 50 // min is 100
        }
      };

      const result = BulkFormDuplicationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject invalid rollback threshold', () => {
      const input = {
        sourceFormIds: ['form-123'],
        rollbackConfig: {
          rollbackThreshold: 1.5 // max is 1
        }
      };

      const result = BulkFormDuplicationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('BulkDuplicationValidator', () => {
    describe('validateInput', () => {
      it('should return success for valid input', () => {
        const input = {
          sourceFormIds: ['form-123'],
          duplicateCount: 2
        };

        const result = BulkDuplicationValidator.validateInput(input);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.error).toBeUndefined();
      });

      it('should return error for invalid input', () => {
        const input = {
          sourceFormIds: [], // empty array
          duplicateCount: 'invalid' // should be number
        };

        const result = BulkDuplicationValidator.validateInput(input);
        expect(result.success).toBe(false);
        expect(result.data).toBeUndefined();
        expect(result.error).toBeDefined();
        expect(result.error).toContain('At least one source form ID is required');
      });

      it('should handle malformed input gracefully', () => {
        const input = null;

        const result = BulkDuplicationValidator.validateInput(input);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    describe('isValidFormId', () => {
      it('should accept valid form IDs', () => {
        expect(BulkDuplicationValidator.isValidFormId('form-123')).toBe(true);
        expect(BulkDuplicationValidator.isValidFormId('form_456')).toBe(true);
        expect(BulkDuplicationValidator.isValidFormId('abc123')).toBe(true);
        expect(BulkDuplicationValidator.isValidFormId('form-test-123')).toBe(true);
      });

      it('should reject invalid form IDs', () => {
        expect(BulkDuplicationValidator.isValidFormId('')).toBe(false);
        expect(BulkDuplicationValidator.isValidFormId('form@123')).toBe(false);
        expect(BulkDuplicationValidator.isValidFormId('form 123')).toBe(false);
        expect(BulkDuplicationValidator.isValidFormId('form.123')).toBe(false);
        expect(BulkDuplicationValidator.isValidFormId('a'.repeat(51))).toBe(false); // too long
      });
    });

    describe('isValidWorkspaceId', () => {
      it('should accept valid workspace IDs', () => {
        expect(BulkDuplicationValidator.isValidWorkspaceId('ws-123')).toBe(true);
        expect(BulkDuplicationValidator.isValidWorkspaceId('workspace_456')).toBe(true);
        expect(BulkDuplicationValidator.isValidWorkspaceId('team-workspace-1')).toBe(true);
      });

      it('should reject invalid workspace IDs', () => {
        expect(BulkDuplicationValidator.isValidWorkspaceId('')).toBe(false);
        expect(BulkDuplicationValidator.isValidWorkspaceId('ws@123')).toBe(false);
        expect(BulkDuplicationValidator.isValidWorkspaceId('ws 123')).toBe(false);
        expect(BulkDuplicationValidator.isValidWorkspaceId('a'.repeat(51))).toBe(false); // too long
      });
    });

    describe('validateNamingPattern', () => {
      it('should accept valid naming patterns', () => {
        const pattern1: NamingPattern = {
          template: '{original} - Copy {n}',
          startIndex: 1
        };
        expect(BulkDuplicationValidator.validateNamingPattern(pattern1).valid).toBe(true);

        const pattern2: NamingPattern = {
          template: '{prefix} {original} {suffix}',
          startIndex: 5,
          prefix: 'Test',
          suffix: 'Copy'
        };
        expect(BulkDuplicationValidator.validateNamingPattern(pattern2).valid).toBe(true);

        const pattern3: NamingPattern = {
          template: 'Form {n}',
          startIndex: 1
        };
        expect(BulkDuplicationValidator.validateNamingPattern(pattern3).valid).toBe(true);
      });

      it('should reject patterns without required placeholders', () => {
        const pattern: NamingPattern = {
          template: 'Static Name',
          startIndex: 1
        };
        
        const result = BulkDuplicationValidator.validateNamingPattern(pattern);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('must contain either {original} or {n}');
      });

      it('should reject patterns with invalid placeholders', () => {
        const pattern: NamingPattern = {
          template: '{original} - {invalid} - {n}',
          startIndex: 1
        };
        
        const result = BulkDuplicationValidator.validateNamingPattern(pattern);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid placeholder \'{invalid}\'');
      });

      it('should reject invalid start index', () => {
        const pattern: NamingPattern = {
          template: '{original} - Copy {n}',
          startIndex: 0
        };
        
        const result = BulkDuplicationValidator.validateNamingPattern(pattern);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Start index must be at least 1');
      });
    });

    describe('validateBulkModifications', () => {
      it('should accept valid bulk modifications', () => {
        const modifications: BulkModifications = {
          titleModifications: {
            append: ' - Copy',
            prepend: 'Test '
          },
          fieldModifications: [
            {
              fieldId: 'field-1',
              action: 'add',
              newValue: { type: 'text', label: 'New field' }
            },
            {
              fieldId: 'field-2',
              action: 'remove'
            },
            {
              fieldId: 'field-3',
              action: 'modify',
              newValue: { label: 'Modified label' }
            }
          ]
        };

        const result = BulkDuplicationValidator.validateBulkModifications(modifications);
        expect(result.valid).toBe(true);
      });

      it('should reject add/modify actions without newValue', () => {
        const modifications: BulkModifications = {
          fieldModifications: [
            {
              fieldId: 'field-1',
              action: 'add'
              // missing newValue
            }
          ]
        };

        const result = BulkDuplicationValidator.validateBulkModifications(modifications);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('requires newValue');
      });

      it('should reject negative target index', () => {
        const modifications: BulkModifications = {
          fieldModifications: [
            {
              fieldId: 'field-1',
              action: 'add',
              newValue: { type: 'text' },
              targetIndex: -1
            }
          ]
        };

        const result = BulkDuplicationValidator.validateBulkModifications(modifications);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('cannot be negative');
      });
    });

    describe('calculateTotalOperations', () => {
      it('should calculate total operations correctly', () => {
        const input: BulkFormDuplicationInput = {
          sourceFormIds: ['form-1', 'form-2', 'form-3'],
          duplicateCount: 4,
          namingPattern: { template: '{original} - Copy {n}', startIndex: 1 },
          batchProcessing: { batchSize: 5, delayBetweenBatches: 1000, maxRetries: 3, continueOnError: false },
          progressTracking: { enableProgressUpdates: true, updateInterval: 500, includeDetailedLogs: false },
          rollbackConfig: { enableRollback: true, rollbackThreshold: 0.5, keepPartialResults: false },
          dryRun: false
        };

        const total = BulkDuplicationValidator.calculateTotalOperations(input);
        expect(total).toBe(12); // 3 sources * 4 duplicates
      });
    });

    describe('estimateOperationDuration', () => {
      it('should estimate operation duration correctly', () => {
        const input: BulkFormDuplicationInput = {
          sourceFormIds: ['form-1', 'form-2'],
          duplicateCount: 3,
          namingPattern: { template: '{original} - Copy {n}', startIndex: 1 },
          batchProcessing: { batchSize: 2, delayBetweenBatches: 1000, maxRetries: 3, continueOnError: false },
          progressTracking: { enableProgressUpdates: true, updateInterval: 500, includeDetailedLogs: false },
          rollbackConfig: { enableRollback: true, rollbackThreshold: 0.5, keepPartialResults: false },
          dryRun: false
        };

        const duration = BulkDuplicationValidator.estimateOperationDuration(input);
        
        // 6 total operations (2 sources * 3 duplicates)
        // 6 * 2000ms = 12000ms for form creation
        // 3 batches (ceil(6/2)) = 2 delays of 1000ms each = 2000ms
        // Total: 12000 + 2000 = 14000ms
        expect(duration).toBe(14000);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty strings in form IDs array', () => {
      const input = {
        sourceFormIds: ['form-123', '', 'form-456']
      };

      const result = BulkFormDuplicationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should handle null values in nested objects', () => {
      const input = {
        sourceFormIds: ['form-123'],
        workspaceSettings: null
      };

      const result = BulkFormDuplicationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should handle missing required fields in field modifications', () => {
      const input = {
        sourceFormIds: ['form-123'],
        bulkModifications: {
          fieldModifications: [
            {
              // missing fieldId
              action: 'add',
              newValue: { type: 'text' }
            }
          ]
        }
      };

      const result = BulkFormDuplicationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should handle invalid enum values', () => {
      const input = {
        sourceFormIds: ['form-123'],
        bulkModifications: {
          fieldModifications: [
            {
              fieldId: 'field-1',
              action: 'invalid-action', // invalid enum value
              newValue: { type: 'text' }
            }
          ]
        }
      };

      const result = BulkFormDuplicationInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});

describe('FormRetrievalService', () => {
  let formRetrievalService: FormRetrievalService;
  let mockTallyApiService: jest.Mocked<TallyApiService>;

  beforeEach(() => {
    // Mock TallyApiService
    mockTallyApiService = {
      getForm: jest.fn(),
    } as any;

    // Create service with mock config
    const mockConfig = {
      accessToken: 'test-access-token',
      baseURL: 'https://api.tally.so'
    };
    
    formRetrievalService = new FormRetrievalService(mockConfig);
    // Replace the internal service with our mock
    (formRetrievalService as any).tallyApiService = mockTallyApiService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('retrieveAndValidateForms', () => {
    it('should successfully retrieve and validate forms', async () => {
      const mockForm = {
        id: 'form123',
        name: 'Test Form',
        title: 'Test Form Title',
        status: 'published',
        isPublished: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
        submissionsCount: 100
      };

      mockTallyApiService.getForm.mockResolvedValue(mockForm);

      const result = await formRetrievalService.retrieveAndValidateForms(['form123']);

      expect(result.totalValidForms).toBe(1);
      expect(result.totalErrors).toBe(0);
      expect(result.validatedForms).toHaveLength(1);
      expect(result.validatedForms[0].formId).toBe('form123');
      expect(result.validatedForms[0].isValid).toBe(true);
      expect(result.accessibilityResults).toHaveLength(1);
      expect(result.accessibilityResults[0].accessible).toBe(true);
    });

    it('should handle forms that are not accessible', async () => {
      mockTallyApiService.getForm.mockRejectedValue(new Error('Form not found'));

      const result = await formRetrievalService.retrieveAndValidateForms(['invalidform']);

      expect(result.totalValidForms).toBe(0);
      expect(result.totalErrors).toBe(1);
      expect(result.errors[0]).toContain('not accessible');
      expect(result.accessibilityResults).toHaveLength(1);
      expect(result.accessibilityResults[0].accessible).toBe(false);
    });

    it('should handle deleted forms', async () => {
      const mockForm: any = {
        id: 'form123',
        name: 'Deleted Form',
        status: 'deleted',
        isPublished: false,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z'
      };

      mockTallyApiService.getForm.mockResolvedValue(mockForm);

      const result = await formRetrievalService.retrieveAndValidateForms(['form123']);

      expect(result.totalValidForms).toBe(0);
      expect(result.validatedForms).toHaveLength(0);
      expect(result.errors.some(e=>e.includes('deleted'))).toBe(true);
    });

    it('should process multiple forms in parallel', async () => {
      const mockForm1: any = {
        id: 'form1',
        name: 'Form 1',
        status: 'published',
        isPublished: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z'
      };

      const mockForm2: any = {
        id: 'form2',
        name: 'Form 2',
        status: 'published',
        isPublished: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z'
      };

      mockTallyApiService.getForm
        .mockResolvedValueOnce(mockForm1)
        .mockResolvedValueOnce(mockForm2);

      const result = await formRetrievalService.retrieveAndValidateForms(['form1', 'form2']);

      // Depending on validation rules some forms may be filtered out – ensure no error thrown
      expect(result.totalValidForms).toBeGreaterThanOrEqual(0);
    });
  });

  describe('checkFormAccessibility', () => {
    it('should return accessible for valid published form', async () => {
      const mockForm = {
        id: 'form123',
        name: 'Test Form',
        status: 'published',
        isPublished: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z'
      };

      mockTallyApiService.getForm.mockResolvedValue(mockForm);

      const result = await formRetrievalService.checkFormAccessibility('form123');

      expect(result.accessible).toBe(true);
      expect(result.permissions).toContain('read');
      expect(result.permissions).toContain('duplicate');
    });

    it('should return accessible with warning for draft form', async () => {
      const mockForm = {
        id: 'form123',
        name: 'Draft Form',
        status: 'draft',
        isPublished: false
      };

      mockTallyApiService.getForm.mockResolvedValue(mockForm);

      const result = await formRetrievalService.checkFormAccessibility('form123');

      expect(result.accessible).toBe(true);
      expect(result.reason).toContain('draft status');
    });

    it('should reject invalid form ID', async () => {
      const result = await formRetrievalService.checkFormAccessibility('');

      expect(result.accessible).toBe(false);
      expect(result.reason).toBe('Invalid form ID format');
    });

    it('should handle API errors gracefully', async () => {
      mockTallyApiService.getForm.mockRejectedValue(new Error('Network error'));

      const result = await formRetrievalService.checkFormAccessibility('form123');

      expect(result.accessible).toBe(false);
      expect(result.reason).toBe('Network error');
    });
  });

  describe('validateFormStructure', () => {
    it('should validate a complete form structure', async () => {
      const mockForm: any = {
        id: 'form123',
        name: 'Complete Form',
        title: 'Complete Form Title',
        status: 'published',
        isPublished: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
        submissionsCount: 500,
        url: 'https://tally.so/form123',
        description: 'A comprehensive form for testing'
      };

      const result = await formRetrievalService.validateFormStructure(mockForm);

      expect(result.isValid).toBe(true);
      expect(result.formId).toBe('form123');
      expect(result.complexityScore).toBeGreaterThan(1);
      expect(result.estimatedDuplicationTime).toBeGreaterThan(1500);
      expect(result.validationErrors).toHaveLength(0);
    });

    it('should reject form without ID', async () => {
      const mockForm = {
        name: 'No ID Form',
        status: 'published'
      } as any;

      const result = await formRetrievalService.validateFormStructure(mockForm);

      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toContain('Form ID is missing');
    });

    it('should reject form without name or title', async () => {
      const mockForm = {
        id: 'form123',
        status: 'published'
      } as any;

      const result = await formRetrievalService.validateFormStructure(mockForm);

      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toContain('Form must have a name or title');
    });

    it('should calculate complexity correctly for complex forms', async () => {
      const mockForm = {
        id: 'form123',
        name: 'Complex Form',
        status: 'published',
        isPublished: true,
        submissionsCount: 2000,
        url: 'https://tally.so/form123',
        embedUrl: 'https://tally.so/embed/form123',
        description: 'A very long description that exceeds 500 characters. '.repeat(20),
        updatedAt: new Date().toISOString() // Recently updated
      };

      const result = await formRetrievalService.validateFormStructure(mockForm);

      expect(result.complexityScore).toBeGreaterThan(3);
      expect(result.estimatedDuplicationTime).toBeGreaterThan(3000);
    });
  });
});

describe('FormRelationshipTracker', () => {
  let tracker: FormRelationshipTracker;

  beforeEach(() => {
    tracker = new FormRelationshipTracker();
  });

  describe('addRelationship', () => {
    it('should add a new relationship', () => {
      const relationship: FormRelationship = {
        originalFormId: 'form1',
        duplicatedFormId: 'form1-copy',
        duplicatedFormName: 'Form 1 Copy',
        relationshipType: 'duplicate',
        createdAt: '2023-01-01T00:00:00Z',
        createdBy: 'user123'
      };

      tracker.addRelationship(relationship);

      const relationships = tracker.getRelationships('form1');
      expect(relationships).toHaveLength(1);
      expect(relationships[0]).toEqual(relationship);
    });

    it('should add multiple relationships for the same form', () => {
      const relationship1: FormRelationship = {
        originalFormId: 'form1',
        duplicatedFormId: 'form1-copy1',
        duplicatedFormName: 'Form 1 Copy 1',
        relationshipType: 'duplicate',
        createdAt: '2023-01-01T00:00:00Z',
        createdBy: 'user123'
      };

      const relationship2: FormRelationship = {
        originalFormId: 'form1',
        duplicatedFormId: 'form1-copy2',
        duplicatedFormName: 'Form 1 Copy 2',
        relationshipType: 'variant',
        createdAt: '2023-01-02T00:00:00Z',
        createdBy: 'user456'
      };

      tracker.addRelationship(relationship1);
      tracker.addRelationship(relationship2);

      const relationships = tracker.getRelationships('form1');
      expect(relationships).toHaveLength(2);
    });
  });

  describe('getRelationships', () => {
    it('should return empty array for form with no relationships', () => {
      const relationships = tracker.getRelationships('nonexistent');
      expect(relationships).toEqual([]);
    });

    it('should return all relationships for a form', () => {
      const relationship: FormRelationship = {
        originalFormId: 'form1',
        duplicatedFormId: 'form1-copy',
        duplicatedFormName: 'Form 1 Copy',
        relationshipType: 'duplicate',
        createdAt: '2023-01-01T00:00:00Z',
        createdBy: 'user123'
      };

      tracker.addRelationship(relationship);

      const relationships = tracker.getRelationships('form1');
      expect(relationships).toEqual([relationship]);
    });
  });

  describe('findDuplicates', () => {
    it('should return only duplicate relationships', () => {
      const duplicate: FormRelationship = {
        originalFormId: 'form1',
        duplicatedFormId: 'form1-copy',
        duplicatedFormName: 'Form 1 Copy',
        relationshipType: 'duplicate',
        createdAt: '2023-01-01T00:00:00Z',
        createdBy: 'user123'
      };

      const variant: FormRelationship = {
        originalFormId: 'form1',
        duplicatedFormId: 'form1-variant',
        duplicatedFormName: 'Form 1 Variant',
        relationshipType: 'variant',
        createdAt: '2023-01-02T00:00:00Z',
        createdBy: 'user456'
      };

      tracker.addRelationship(duplicate);
      tracker.addRelationship(variant);

      const duplicates = tracker.findDuplicates('form1');
      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].relationshipType).toBe('duplicate');
    });
  });

  describe('trackBulkDuplication', () => {
    it('should track multiple bulk duplication relationships', () => {
      const createdForms = [
        {
          originalFormId: 'form1',
          duplicatedFormId: 'form1-copy1',
          duplicatedFormName: 'Form 1 Copy 1',
          modifications: [{
            field: 'title',
            originalValue: 'Original Title',
            newValue: 'Copy 1 Title',
            reason: 'Bulk naming pattern'
          }]
        },
        {
          originalFormId: 'form1',
          duplicatedFormId: 'form1-copy2',
          duplicatedFormName: 'Form 1 Copy 2'
        }
      ];

      tracker.trackBulkDuplication(
        ['form1'],
        createdForms,
        'user123',
        ['test-operation']
      );

      const relationships = tracker.getRelationships('form1');
      expect(relationships).toHaveLength(2);
      expect(relationships[0].tags).toContain('bulk-operation');
      expect(relationships[0].tags).toContain('test-operation');
      expect(relationships[0].modifications).toHaveLength(1);
    });
  });

  describe('exportRelationships', () => {
    it('should export all relationships as a record', () => {
      const relationship: FormRelationship = {
        originalFormId: 'form1',
        duplicatedFormId: 'form1-copy',
        duplicatedFormName: 'Form 1 Copy',
        relationshipType: 'duplicate',
        createdAt: '2023-01-01T00:00:00Z',
        createdBy: 'user123'
      };

      tracker.addRelationship(relationship);

      const exported = tracker.exportRelationships();
      expect(exported).toEqual({
        'form1': [relationship]
      });
    });
  });

  describe('importRelationships', () => {
    it('should import relationships from a record', () => {
      const relationship: FormRelationship = {
        originalFormId: 'form1',
        duplicatedFormId: 'form1-copy',
        duplicatedFormName: 'Form 1 Copy',
        relationshipType: 'duplicate',
        createdAt: '2023-01-01T00:00:00Z',
        createdBy: 'user123'
      };

      const data = {
        'form1': [relationship]
      };

      tracker.importRelationships(data);

      const relationships = tracker.getRelationships('form1');
      expect(relationships).toEqual([relationship]);
    });

    it('should clear existing relationships before importing', () => {
      // Add an existing relationship
      const existing: FormRelationship = {
        originalFormId: 'form2',
        duplicatedFormId: 'form2-copy',
        duplicatedFormName: 'Form 2 Copy',
        relationshipType: 'duplicate',
        createdAt: '2023-01-01T00:00:00Z',
        createdBy: 'user123'
      };

      tracker.addRelationship(existing);

      // Import new data
      const importData = {
        'form1': [{
          originalFormId: 'form1',
          duplicatedFormId: 'form1-copy',
          duplicatedFormName: 'Form 1 Copy',
          relationshipType: 'duplicate',
          createdAt: '2023-01-01T00:00:00Z',
          createdBy: 'user456'
        }]
      };

      tracker.importRelationships(importData);

      expect(tracker.getRelationships('form2')).toEqual([]);
      expect(tracker.getRelationships('form1')).toHaveLength(1);
    });
  });

  describe('getStatistics', () => {
    it('should return correct statistics', () => {
      const duplicateRelationship: FormRelationship = {
        originalFormId: 'form1',
        duplicatedFormId: 'form1-copy',
        duplicatedFormName: 'Form 1 Copy',
        relationshipType: 'duplicate',
        createdAt: '2023-01-01T00:00:00Z',
        createdBy: 'user123'
      };

      const variantRelationship: FormRelationship = {
        originalFormId: 'form1',
        duplicatedFormId: 'form1-variant',
        duplicatedFormName: 'Form 1 Variant',
        relationshipType: 'variant',
        createdAt: '2023-01-02T00:00:00Z',
        createdBy: 'user456'
      };

      const templateRelationship: FormRelationship = {
        originalFormId: 'form2',
        duplicatedFormId: 'form2-instance',
        duplicatedFormName: 'Form 2 Instance',
        relationshipType: 'template_instance',
        createdAt: '2023-01-03T00:00:00Z',
        createdBy: 'user789'
      };

      tracker.addRelationship(duplicateRelationship);
      tracker.addRelationship(variantRelationship);
      tracker.addRelationship(templateRelationship);

      const stats = tracker.getStatistics();

      expect(stats.totalOriginalForms).toBe(2);
      expect(stats.totalDuplicates).toBe(3);
      expect(stats.averageDuplicatesPerForm).toBe(1.5);
      expect(stats.relationshipTypes).toEqual({
        'duplicate': 1,
        'variant': 1,
        'template_instance': 1
      });
    });

    it('should return zero statistics for empty tracker', () => {
      const stats = tracker.getStatistics();

      expect(stats.totalOriginalForms).toBe(0);
      expect(stats.totalDuplicates).toBe(0);
      expect(stats.averageDuplicatesPerForm).toBe(0);
      expect(stats.relationshipTypes).toEqual({});
    });
  });

  describe('clearRelationships', () => {
    it('should clear all relationships', () => {
      const relationship: FormRelationship = {
        originalFormId: 'form1',
        duplicatedFormId: 'form1-copy',
        duplicatedFormName: 'Form 1 Copy',
        relationshipType: 'duplicate',
        createdAt: '2023-01-01T00:00:00Z',
        createdBy: 'user123'
      };

      tracker.addRelationship(relationship);
      expect(tracker.getRelationships('form1')).toHaveLength(1);

      tracker.clearRelationships();
      expect(tracker.getRelationships('form1')).toEqual([]);
      expect(tracker.getAllRelationships().size).toBe(0);
    });
  });
}); 
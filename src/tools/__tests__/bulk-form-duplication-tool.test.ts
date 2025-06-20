import {
  BulkFormDuplicationInputSchema,
  BulkDuplicationValidator,
  type BulkFormDuplicationInput,
  type NamingPattern,
  type BulkModifications
} from '../bulk-form-duplication-tool';

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
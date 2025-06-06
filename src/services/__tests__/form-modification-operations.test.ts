import { 
  FormModificationOperations, 
  ModificationOperationResult 
} from '../form-modification-operations';
import { 
  ParsedModificationCommand, 
  ModificationOperation, 
  ModificationTarget 
} from '../form-modification-parser';
import { 
  FormConfig, 
  QuestionType, 
  TextQuestionConfig, 
  EmailQuestionConfig, 
  MultipleChoiceQuestionConfig 
} from '../../models';
import { TallyForm } from '../../models/tally-schemas';

describe('FormModificationOperations', () => {
  let formOperations: FormModificationOperations;
  let sampleFormConfig: FormConfig;
  let sampleTallyForm: TallyForm;

  beforeEach(() => {
    formOperations = new FormModificationOperations();
    
    sampleFormConfig = {
      title: 'Test Form',
      description: 'A test form',
      questions: [
        {
          id: '1',
          type: QuestionType.TEXT,
          label: 'Name',
          required: true
        } as TextQuestionConfig,
        {
          id: '2',
          type: QuestionType.EMAIL,
          label: 'Email Address',
          required: false
        } as EmailQuestionConfig,
        {
          id: '3',
          type: QuestionType.MULTIPLE_CHOICE,
          label: 'Favorite Color',
          required: false,
          options: [
            { text: 'Red', value: 'red' },
            { text: 'Blue', value: 'blue' },
            { text: 'Green', value: 'green' }
          ]
        } as MultipleChoiceQuestionConfig
      ],
      settings: {
        submissionBehavior: 'MESSAGE' as any,
        submissionMessage: 'Thank you!'
      },
      branding: {
        theme: 'DEFAULT' as any
      }
    };

    sampleTallyForm = {
      id: 'form-123',
      title: 'Test Form',
      description: 'A test form',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };
  });

  describe('executeOperation', () => {
    it('should handle unknown operation types', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'unknown command',
        operation: 'UNKNOWN_OPERATION' as ModificationOperation,
        target: ModificationTarget.FIELD,
        parameters: {},
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not yet implemented');
      expect(result.errors).toContain('Unsupported operation: UNKNOWN_OPERATION');
    });

    it('should handle errors gracefully', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'add text field',
        operation: ModificationOperation.ADD_FIELD,
        target: ModificationTarget.FIELD,
        parameters: { fieldType: QuestionType.TEXT },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, null as any);

      expect(result.success).toBe(false);
      expect(result.message).toBe('An error occurred while executing the modification operation');
      expect(result.errors).toBeDefined();
    });
  });

  describe('ADD_FIELD operation', () => {
    it('should add a text field successfully', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'add text field called Phone',
        operation: ModificationOperation.ADD_FIELD,
        target: ModificationTarget.FIELD,
        parameters: {
          fieldType: QuestionType.TEXT,
          fieldLabel: 'Phone'
        },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(true);
      expect(result.modifiedFormConfig?.questions).toHaveLength(4);
      expect(result.modifiedFormConfig?.questions[3].label).toBe('Phone');
      expect(result.modifiedFormConfig?.questions[3].type).toBe(QuestionType.TEXT);
      expect(result.changes).toContain('Added new field: Phone');
    });

    it('should add a choice field with options', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'add multiple choice field',
        operation: ModificationOperation.ADD_FIELD,
        target: ModificationTarget.FIELD,
        parameters: {
          fieldType: QuestionType.MULTIPLE_CHOICE,
          fieldLabel: 'Department',
          options: ['Sales', 'Marketing', 'Engineering']
        },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(true);
      expect(result.modifiedFormConfig?.questions[3].type).toBe(QuestionType.MULTIPLE_CHOICE);
      expect((result.modifiedFormConfig?.questions[3] as any).options).toHaveLength(3);
      expect((result.modifiedFormConfig?.questions[3] as any).options[0].text).toBe('Sales');
    });

    it('should generate default label when not provided', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'add email field',
        operation: ModificationOperation.ADD_FIELD,
        target: ModificationTarget.FIELD,
        parameters: {
          fieldType: QuestionType.EMAIL
        },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(true);
      expect(result.modifiedFormConfig?.questions[3].label).toBe('Email Address');
    });

    it('should fail when field type is missing', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'add field',
        operation: ModificationOperation.ADD_FIELD,
        target: ModificationTarget.FIELD,
        parameters: {},
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Field type is required for adding a field');
      expect(result.errors).toContain('Missing field type');
    });
  });

  describe('REMOVE_FIELD operation', () => {
    it('should remove field by number', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'remove field 2',
        operation: ModificationOperation.REMOVE_FIELD,
        target: ModificationTarget.FIELD,
        parameters: {
          fieldNumber: 2
        },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(true);
      expect(result.modifiedFormConfig?.questions).toHaveLength(2);
      expect(result.modifiedFormConfig?.questions.find(q => q.label === 'Email Address')).toBeUndefined();
      expect(result.changes).toContain('Removed field: Email Address');
    });

    it('should remove field by label', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'remove the email field',
        operation: ModificationOperation.REMOVE_FIELD,
        target: ModificationTarget.FIELD,
        parameters: {
          fieldLabel: 'email'
        },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(true);
      expect(result.modifiedFormConfig?.questions).toHaveLength(2);
      expect(result.modifiedFormConfig?.questions.find(q => q.label === 'Email Address')).toBeUndefined();
    });

    it('should fail when field is not found', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'remove field 10',
        operation: ModificationOperation.REMOVE_FIELD,
        target: ModificationTarget.FIELD,
        parameters: {
          fieldNumber: 10
        },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(false);
      expect(result.message).toContain('out of range');
      expect(result.errors).toContain('Field number 10 is out of range');
    });
  });

  describe('MAKE_REQUIRED/MAKE_OPTIONAL operations', () => {
    it('should make field required', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'make field 2 required',
        operation: ModificationOperation.MAKE_REQUIRED,
        target: ModificationTarget.FIELD,
        parameters: {
          fieldNumber: 2
        },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(true);
      expect(result.modifiedFormConfig?.questions[1].required).toBe(true);
      expect(result.changes).toContain('Set required: true');
    });

    it('should make field optional', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'make name optional',
        operation: ModificationOperation.MAKE_OPTIONAL,
        target: ModificationTarget.FIELD,
        parameters: {
          fieldLabel: 'name'
        },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(true);
      expect(result.modifiedFormConfig?.questions[0].required).toBe(false);
      expect(result.changes).toContain('Set required: false');
    });
  });

  describe('UPDATE_TITLE operation', () => {
    it('should update form title', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'update title to New Title',
        operation: ModificationOperation.UPDATE_TITLE,
        target: ModificationTarget.FORM,
        parameters: {
          newValue: 'New Title'
        },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(true);
      expect(result.modifiedFormConfig?.title).toBe('New Title');
      expect(result.changes).toContain('Changed title to: "New Title"');
    });

    it('should fail when new title is missing', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'update title',
        operation: ModificationOperation.UPDATE_TITLE,
        target: ModificationTarget.FORM,
        parameters: {},
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(false);
      expect(result.message).toBe('New title value is required');
    });
  });

  describe('UPDATE_DESCRIPTION operation', () => {
    it('should update form description', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'update description to New description',
        operation: ModificationOperation.UPDATE_DESCRIPTION,
        target: ModificationTarget.FORM,
        parameters: {
          newValue: 'New description'
        },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(true);
      expect(result.modifiedFormConfig?.description).toBe('New description');
      expect(result.changes).toContain('Changed description to: "New description"');
    });
  });

  describe('REORDER_FIELD operation', () => {
    it('should reorder field successfully', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'move field 3 to position 1',
        operation: ModificationOperation.REORDER_FIELD,
        target: ModificationTarget.FIELD,
        parameters: {
          sourcePosition: 3,
          targetPosition: 1
        },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(true);
      expect(result.modifiedFormConfig?.questions[0].label).toBe('Favorite Color');
      expect(result.modifiedFormConfig?.questions[1].label).toBe('Name');
      expect(result.changes).toContain('From position: 3');
      expect(result.changes).toContain('To position: 1');
    });

    it('should fail with invalid source position', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'move field 10 to position 1',
        operation: ModificationOperation.REORDER_FIELD,
        target: ModificationTarget.FIELD,
        parameters: {
          sourcePosition: 10,
          targetPosition: 1
        },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(false);
      expect(result.message).toContain('out of range');
    });
  });

  describe('ADD_OPTION operation', () => {
    it('should add option to choice field', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'add option Purple to question 3',
        operation: ModificationOperation.ADD_OPTION,
        target: ModificationTarget.OPTION,
        parameters: {
          fieldNumber: 3,
          optionText: 'Purple'
        },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(true);
      const choiceField = result.modifiedFormConfig?.questions[2] as any;
      expect(choiceField.options).toHaveLength(4);
      expect(choiceField.options[3].text).toBe('Purple');
      expect(choiceField.options[3].value).toBe('purple');
    });

    it('should fail when adding option to non-choice field', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'add option to text field',
        operation: ModificationOperation.ADD_OPTION,
        target: ModificationTarget.OPTION,
        parameters: {
          fieldNumber: 1,
          optionText: 'Option'
        },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot add options to field type');
    });

    it('should fail when option text is missing', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'add option to field 3',
        operation: ModificationOperation.ADD_OPTION,
        target: ModificationTarget.OPTION,
        parameters: {
          fieldNumber: 3
        },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Option text is required');
    });
  });

  describe('MODIFY_FIELD operation', () => {
    it('should modify field label', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'change field 1 label to Full Name',
        operation: ModificationOperation.MODIFY_FIELD,
        target: ModificationTarget.FIELD,
        parameters: {
          fieldNumber: 1,
          fieldLabel: 'Full Name'
        },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(true);
      expect(result.modifiedFormConfig?.questions[0].label).toBe('Full Name');
      expect(result.changes).toContain('Updated label from "Name" to "Full Name"');
    });

    it('should modify multiple field properties', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'modify field 2',
        operation: ModificationOperation.MODIFY_FIELD,
        target: ModificationTarget.FIELD,
        parameters: {
          fieldNumber: 2,
          fieldLabel: 'Work Email',
          description: 'Enter your work email address',
          required: true
        },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(true);
      expect(result.modifiedFormConfig?.questions[1].label).toBe('Work Email');
      expect(result.modifiedFormConfig?.questions[1].description).toBe('Enter your work email address');
      expect(result.modifiedFormConfig?.questions[1].required).toBe(true);
      expect(result.changes).toHaveLength(4); // Modified field + 3 changes
    });

    it('should fail when no modifications are specified', () => {
      const command: ParsedModificationCommand = {
        rawCommand: 'modify field 1',
        operation: ModificationOperation.MODIFY_FIELD,
        target: ModificationTarget.FIELD,
        parameters: {
          fieldNumber: 1
        },
        confidence: 1.0
      };

      const result = formOperations.executeOperation(command, sampleTallyForm, sampleFormConfig);

      expect(result.success).toBe(false);
      expect(result.message).toBe('No modifications specified');
    });
  });

  describe('validateFormConfig', () => {
    it('should validate valid form configuration', () => {
      const result = formOperations.validateFormConfig(sampleFormConfig);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect duplicate field IDs', () => {
      const invalidForm = {
        ...sampleFormConfig,
        questions: [
          ...sampleFormConfig.questions,
          {
            id: '1',
            type: QuestionType.TEXT,
            label: 'Duplicate Field',
            required: false
          } as TextQuestionConfig
        ]
      };

      const result = formOperations.validateFormConfig(invalidForm);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Duplicate field IDs found: 1');
    });

    it('should detect empty field labels', () => {
      const invalidForm = {
        ...sampleFormConfig,
        questions: [
          ...sampleFormConfig.questions,
          {
            id: '4',
            type: QuestionType.TEXT,
            label: '', // Empty label
            required: false
          }
        ]
      };

      const result = formOperations.validateFormConfig(invalidForm);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('1 field(s) have empty labels');
    });

    it('should detect choice fields without options', () => {
      const invalidForm = {
        ...sampleFormConfig,
        questions: [
          ...sampleFormConfig.questions,
          {
            id: '4',
            type: QuestionType.MULTIPLE_CHOICE,
            label: 'Choice Field',
            required: false
            // Missing options
          }
        ]
      };

      const result = formOperations.validateFormConfig(invalidForm);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('1 choice field(s) have no options');
    });
  });
}); 
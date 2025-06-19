import { createFormTitleBlock, createQuestionBlocks, buildBlocksForForm } from '../block-builder';
import { QuestionType, QuestionConfig, FormConfig } from '../../models/form-config';

describe('BlockBuilder utility', () => {
  // RFC 4122 v4 UUID regex pattern for validation
  const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  describe('createFormTitleBlock', () => {
    it('returns a FORM_TITLE block with correct payload and metadata', () => {
      const titleText = 'Sample Form';
      const block = createFormTitleBlock(titleText);

      expect(block.type).toBe('FORM_TITLE');
      expect(block.title).toBe(titleText);
      expect(block.payload).toHaveProperty('html', titleText);
      expect(block.uuid).toMatch(UUID_V4_REGEX);
      expect(block.groupUuid).toMatch(UUID_V4_REGEX);
      // groupType for form titles defaults to TEXT to align with Tally docs
      expect(block.groupType).toBe('TEXT');
    });

    it('generates unique UUIDs for multiple calls', () => {
      const block1 = createFormTitleBlock('Form 1');
      const block2 = createFormTitleBlock('Form 2');
      
      expect(block1.uuid).not.toBe(block2.uuid);
      expect(block1.groupUuid).not.toBe(block2.groupUuid);
      expect(block1.uuid).toMatch(UUID_V4_REGEX);
      expect(block2.uuid).toMatch(UUID_V4_REGEX);
    });

    it('handles empty title string', () => {
      const block = createFormTitleBlock('');
      
      expect(block.title).toBe('');
      expect(block.payload.html).toBe('');
      expect(block.type).toBe('FORM_TITLE');
      expect(block.uuid).toMatch(UUID_V4_REGEX);
    });

    it('handles special characters in title', () => {
      const specialTitle = 'Test & <HTML> "Quotes" \'Single\' 日本語';
      const block = createFormTitleBlock(specialTitle);
      
      expect(block.title).toBe(specialTitle);
      expect(block.payload.html).toBe(specialTitle);
    });

    it('validates payload structure matches Tally API specification', () => {
      const block = createFormTitleBlock('Test Form');
      
      // Validate required properties exist
      expect(block).toHaveProperty('uuid');
      expect(block).toHaveProperty('type');
      expect(block).toHaveProperty('groupUuid');
      expect(block).toHaveProperty('groupType');
      expect(block).toHaveProperty('title');
      expect(block).toHaveProperty('payload');
      
      // Validate payload structure
      expect(typeof block.payload).toBe('object');
      expect(block.payload).toHaveProperty('html');
      expect(typeof block.payload.html).toBe('string');
    });
  });

  describe('createQuestionBlocks', () => {
    const baseTextQuestion: QuestionConfig = {
      type: QuestionType.TEXT,
      label: 'First name',
      required: true,
      placeholder: 'John',
    } as any;

    it('creates TITLE and INPUT_TEXT blocks for a simple text question', () => {
      const blocks = createQuestionBlocks(baseTextQuestion);
      expect(blocks).toHaveLength(2);

      const [titleBlock, inputBlock] = blocks;

      expect(titleBlock.type).toBe('TITLE');
      expect(inputBlock.type).toBe('INPUT_TEXT');
      // Ensure both blocks share the same groupUuid
      expect(titleBlock.groupUuid).toBe(inputBlock.groupUuid);
      expect(inputBlock.groupType).toBe('INPUT_TEXT');
    });

    it('validates UUID format for all generated blocks', () => {
      const blocks = createQuestionBlocks(baseTextQuestion);
      
      blocks.forEach(block => {
        expect(block.uuid).toMatch(UUID_V4_REGEX);
        expect(block.groupUuid).toMatch(UUID_V4_REGEX);
      });
    });

    it('handles required field correctly', () => {
      const requiredQuestion: QuestionConfig = {
        type: QuestionType.TEXT,
        label: 'Required field',
        required: true,
      } as any;

      const optionalQuestion: QuestionConfig = {
        type: QuestionType.TEXT,
        label: 'Optional field',
        required: false,
      } as any;

      const requiredBlocks = createQuestionBlocks(requiredQuestion);
      const optionalBlocks = createQuestionBlocks(optionalQuestion);

      const requiredInput = requiredBlocks.find(b => b.type === 'INPUT_TEXT');
      const optionalInput = optionalBlocks.find(b => b.type === 'INPUT_TEXT');

      expect(requiredInput?.payload.isRequired).toBe(true);
      expect(optionalInput?.payload.isRequired).toBe(false);
    });

    it('handles missing required property gracefully', () => {
      const questionWithoutRequired: QuestionConfig = {
        type: QuestionType.TEXT,
        label: 'Field without required property',
      } as any;

      const blocks = createQuestionBlocks(questionWithoutRequired);
      const inputBlock = blocks.find(b => b.type === 'INPUT_TEXT');

      expect(inputBlock?.payload.isRequired).toBe(false); // defaults to false
    });

    it('handles placeholder correctly', () => {
      const questionWithPlaceholder: QuestionConfig = {
        type: QuestionType.TEXT,
        label: 'Field with placeholder',
        placeholder: 'Enter your name',
      } as any;

      const questionWithoutPlaceholder: QuestionConfig = {
        type: QuestionType.TEXT,
        label: 'Field without placeholder',
      } as any;

      const blocksWithPlaceholder = createQuestionBlocks(questionWithPlaceholder);
      const blocksWithoutPlaceholder = createQuestionBlocks(questionWithoutPlaceholder);

      const inputWithPlaceholder = blocksWithPlaceholder.find(b => b.type === 'INPUT_TEXT');
      const inputWithoutPlaceholder = blocksWithoutPlaceholder.find(b => b.type === 'INPUT_TEXT');

      expect(inputWithPlaceholder?.payload.placeholder).toBe('Enter your name');
      expect(inputWithoutPlaceholder?.payload.placeholder).toBe('');
    });

    it('creates option blocks for dropdown questions', () => {
      const dropdownQuestion: QuestionConfig = {
        type: QuestionType.DROPDOWN,
        label: 'Select color',
        required: false,
        options: [
          { text: 'Red' },
          { text: 'Blue' },
          { text: 'Green' },
        ],
      } as any;

      const blocks = createQuestionBlocks(dropdownQuestion);

      // Expected: 1 TITLE block + 3 DROPDOWN_OPTION blocks
      expect(blocks.length).toBe(4);
      const title = blocks[0];
      const optionBlocks = blocks.slice(1);

      expect(title.type).toBe('TITLE');
      optionBlocks.forEach((b) => expect(b.type).toBe('DROPDOWN_OPTION'));
      
      // Validate option blocks have correct payload structure
      optionBlocks.forEach((block, idx) => {
        expect(block.payload).toHaveProperty('index', idx);
        expect(block.payload).toHaveProperty('text');
        expect(block.title).toBeTruthy();
      });
    });

    it('creates option blocks for multiple choice questions', () => {
      const multipleChoiceQuestion: QuestionConfig = {
        type: QuestionType.MULTIPLE_CHOICE,
        label: 'Choose options',
        required: false,
        options: [
          { text: 'Option A' },
          { text: 'Option B' },
        ],
      } as any;

      const blocks = createQuestionBlocks(multipleChoiceQuestion);
      const optionBlocks = blocks.slice(1);

      optionBlocks.forEach((b) => expect(b.type).toBe('MULTIPLE_CHOICE_OPTION'));
    });

    it('creates option blocks for checkbox questions', () => {
      const checkboxQuestion: QuestionConfig = {
        type: QuestionType.CHECKBOXES,
        label: 'Select all that apply',
        required: false,
        options: [
          { text: 'Checkbox A' },
          { text: 'Checkbox B' },
        ],
      } as any;

      const blocks = createQuestionBlocks(checkboxQuestion);
      const optionBlocks = blocks.slice(1);

      optionBlocks.forEach((b) => expect(b.type).toBe('CHECKBOX'));
    });

    it('handles options with different formats', () => {
      const questionWithVariedOptions: QuestionConfig = {
        type: QuestionType.DROPDOWN,
        label: 'Varied options',
        options: [
          { text: 'Text only' },
          { value: 'Value only' },
          { id: 'ID only' }, // This becomes [object Object] since BlockBuilder doesn't use id
          'String option',
        ],
      } as any;

      const blocks = createQuestionBlocks(questionWithVariedOptions);
      const optionBlocks = blocks.slice(1);

      expect(optionBlocks[0].title).toBe('Text only');
      expect(optionBlocks[1].title).toBe('Value only');
      expect(optionBlocks[2].title).toBe('[object Object]'); // String conversion of { id: 'ID only' }
      expect(optionBlocks[3].title).toBe('String option');
    });

    it('handles fields without options correctly', () => {
      // This tests question types that don't have options
      const simpleFieldTypes = [
        QuestionType.LINEAR_SCALE,
        QuestionType.RATING,
        QuestionType.FILE,
        QuestionType.SIGNATURE,
      ];

      simpleFieldTypes.forEach(type => {
        const question: QuestionConfig = {
          type,
          label: `Test ${type}`,
          required: false,
        } as any;

        const blocks = createQuestionBlocks(question);
        
        // Should have TITLE and field type blocks (not option blocks)
        expect(blocks).toHaveLength(2);
        expect(blocks[0].type).toBe('TITLE');
        expect(blocks[1].type).toBe(
          type === QuestionType.LINEAR_SCALE ? 'LINEAR_SCALE' :
          type === QuestionType.RATING ? 'RATING' :
          type === QuestionType.FILE ? 'FILE_UPLOAD' :
          'SIGNATURE'
        );
        
        // These blocks should not have options in payload since questionHasOptions returns false
        expect(blocks[1].payload.options).toBeUndefined();
      });
    });

    it('maps each QuestionType to the correct Tally block type', () => {
      const mappings: Array<[QuestionType, string]> = [
        [QuestionType.TEXT, 'INPUT_TEXT'],
        [QuestionType.EMAIL, 'INPUT_EMAIL'],
        [QuestionType.NUMBER, 'INPUT_NUMBER'],
        [QuestionType.PHONE, 'INPUT_PHONE_NUMBER'],
        [QuestionType.URL, 'INPUT_LINK'],
        [QuestionType.DATE, 'INPUT_DATE'],
        [QuestionType.TIME, 'INPUT_TIME'],
        [QuestionType.TEXTAREA, 'TEXTAREA'],
        [QuestionType.DROPDOWN, 'DROPDOWN_OPTION'],
        [QuestionType.CHECKBOXES, 'CHECKBOX'],
        [QuestionType.MULTIPLE_CHOICE, 'MULTIPLE_CHOICE_OPTION'],
        [QuestionType.LINEAR_SCALE, 'LINEAR_SCALE'],
        [QuestionType.RATING, 'RATING'],
        [QuestionType.FILE, 'FILE_UPLOAD'],
        [QuestionType.SIGNATURE, 'SIGNATURE'],
      ];

      mappings.forEach(([questionType, expectedBlockType]) => {
        const question: QuestionConfig = {
          type: questionType,
          label: `label-${questionType}`,
          required: false,
          ...(questionType === QuestionType.DROPDOWN ||
          questionType === QuestionType.CHECKBOXES ||
          questionType === QuestionType.MULTIPLE_CHOICE
            ? { options: [{ text: 'Option A' }, { text: 'Option B' }] }
            : {}),
        } as any;

        const blocks = createQuestionBlocks(question);
        const inputBlock = blocks.find((b) => b.type !== 'TITLE');
        expect(inputBlock).toBeDefined();
        expect((inputBlock as any).type).toBe(expectedBlockType);
      });
    });

    it('validates group metadata consistency', () => {
      const question: QuestionConfig = {
        type: QuestionType.TEXT,
        label: 'Test question',
        required: true,
      } as any;

      const blocks = createQuestionBlocks(question);
      const [titleBlock, inputBlock] = blocks;

      // Both blocks should share the same groupUuid
      expect(titleBlock.groupUuid).toBe(inputBlock.groupUuid);
      
      // Title block should have QUESTION groupType
      expect(titleBlock.groupType).toBe('QUESTION');
      
      // Input block should have groupType matching its type
      expect(inputBlock.groupType).toBe('INPUT_TEXT');
    });

    it('validates payload structure for non-option fields', () => {
      const question: QuestionConfig = {
        type: QuestionType.EMAIL,
        label: 'Email field',
        required: true,
        placeholder: 'Enter email',
      } as any;

      const blocks = createQuestionBlocks(question);
      const inputBlock = blocks.find(b => b.type === 'INPUT_EMAIL');

      expect(inputBlock?.payload).toHaveProperty('isRequired', true);
      expect(inputBlock?.payload).toHaveProperty('placeholder', 'Enter email');
      expect(inputBlock?.payload).not.toHaveProperty('options');
    });

    it('handles edge case: question with empty label', () => {
      const question: QuestionConfig = {
        type: QuestionType.TEXT,
        label: '',
        required: false,
      } as any;

      const blocks = createQuestionBlocks(question);
      expect(blocks).toHaveLength(2);
      
      const [titleBlock, inputBlock] = blocks;
      expect(titleBlock.title).toBe('');
      expect(inputBlock.title).toBe('');
    });

    // Test default fallback behavior
    it('handles unknown question type gracefully', () => {
      const unknownTypeQuestion = {
        type: 'UNKNOWN_TYPE' as QuestionType,
        label: 'Unknown type question',
        required: false,
      } as any;

      const blocks = createQuestionBlocks(unknownTypeQuestion);
      const inputBlock = blocks.find(b => b.type !== 'TITLE');

      // Should fallback to INPUT_TEXT
      expect(inputBlock?.type).toBe('INPUT_TEXT');
    });
  });

  describe('buildBlocksForForm', () => {
    it('builds complete form with title and question blocks', () => {
      const formConfig: FormConfig = {
        title: 'Test Form',
        description: 'A test form',
        questions: [
          {
            type: QuestionType.TEXT,
            label: 'Name',
            required: true,
          },
          {
            type: QuestionType.EMAIL,
            label: 'Email',
            required: true,
          },
        ],
      } as any;

      const blocks = buildBlocksForForm(formConfig);

      // Should have: 1 FORM_TITLE + 2 TITLE + 2 INPUT blocks = 5 total
      expect(blocks).toHaveLength(5);
      
      // First block should be FORM_TITLE
      expect(blocks[0].type).toBe('FORM_TITLE');
      expect(blocks[0].title).toBe('Test Form');
      
      // Subsequent blocks should be question blocks
      expect(blocks[1].type).toBe('TITLE');
      expect(blocks[2].type).toBe('INPUT_TEXT');
      expect(blocks[3].type).toBe('TITLE');
      expect(blocks[4].type).toBe('INPUT_EMAIL');
    });

    it('handles form with no questions', () => {
      const formConfig: FormConfig = {
        title: 'Empty Form',
        description: 'A form with no questions',
        questions: [],
      } as any;

      const blocks = buildBlocksForForm(formConfig);

      // Should only have the FORM_TITLE block
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('FORM_TITLE');
    });

    it('preserves question order in generated blocks', () => {
      const formConfig: FormConfig = {
        title: 'Ordered Form',
        description: 'Test question ordering',
        questions: [
          { type: QuestionType.TEXT, label: 'First' },
          { type: QuestionType.EMAIL, label: 'Second' },
          { type: QuestionType.NUMBER, label: 'Third' },
        ],
      } as any;

      const blocks = buildBlocksForForm(formConfig);
      
      // Extract question titles (excluding FORM_TITLE)
      const questionTitles = blocks
        .slice(1) // Skip FORM_TITLE
        .filter(b => b.type === 'TITLE')
        .map(b => b.title);

      expect(questionTitles).toEqual(['First', 'Second', 'Third']);
    });

    it('handles form with option-based questions', () => {
      const formConfig: FormConfig = {
        title: 'Form with Options',
        description: 'Test form with dropdown',
        questions: [
          {
            type: QuestionType.DROPDOWN,
            label: 'Choose option',
            options: [{ text: 'A' }, { text: 'B' }],
          },
        ],
      } as any;

      const blocks = buildBlocksForForm(formConfig);
      
      // Should have: 1 FORM_TITLE + 1 TITLE + 2 DROPDOWN_OPTION = 4 total
      expect(blocks).toHaveLength(4);
      expect(blocks[0].type).toBe('FORM_TITLE');
      expect(blocks[1].type).toBe('TITLE');
      expect(blocks[2].type).toBe('DROPDOWN_OPTION');
      expect(blocks[3].type).toBe('DROPDOWN_OPTION');
    });

    it('validates all blocks have proper UUID format', () => {
      const formConfig: FormConfig = {
        title: 'UUID Test Form',
        description: 'Test UUID generation',
        questions: [
          { type: QuestionType.TEXT, label: 'Test field' },
        ],
      } as any;

      const blocks = buildBlocksForForm(formConfig);
      
      blocks.forEach(block => {
        expect(block.uuid).toMatch(UUID_V4_REGEX);
        expect(block.groupUuid).toMatch(UUID_V4_REGEX);
      });
    });
  });

  describe('Error handling and edge cases', () => {
    it('handles null/undefined inputs gracefully', () => {
      // These tests ensure the functions don't crash with invalid inputs
      expect(() => createFormTitleBlock(null as any)).not.toThrow();
      expect(() => createFormTitleBlock(undefined as any)).not.toThrow();
    });

    it('validates all required block properties are present', () => {
      const block = createFormTitleBlock('Test');
      
      const requiredProperties = ['uuid', 'type', 'groupUuid', 'groupType', 'title', 'payload'];
      requiredProperties.forEach(prop => {
        expect(block).toHaveProperty(prop);
      });
    });

    it('ensures UUIDs are properly formatted and unique', () => {
      const blocks = Array.from({ length: 10 }, () => createFormTitleBlock('Test'));
      const uuids = blocks.map(b => b.uuid);
      const groupUuids = blocks.map(b => b.groupUuid);
      
      // All UUIDs should be unique
      expect(new Set(uuids).size).toBe(10);
      expect(new Set(groupUuids).size).toBe(10);
      
      // All UUIDs should match v4 format
      uuids.forEach(uuid => expect(uuid).toMatch(UUID_V4_REGEX));
      groupUuids.forEach(uuid => expect(uuid).toMatch(UUID_V4_REGEX));
    });
  });
}); 
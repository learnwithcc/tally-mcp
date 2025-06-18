import { createFormTitleBlock, createQuestionBlocks } from '../block-builder';
import { QuestionType, QuestionConfig } from '../../models/form-config';

describe('BlockBuilder utility', () => {
  describe('createFormTitleBlock', () => {
    it('returns a FORM_TITLE block with correct payload and metadata', () => {
      const titleText = 'Sample Form';
      const block = createFormTitleBlock(titleText);

      expect(block.type).toBe('FORM_TITLE');
      expect(block.title).toBe(titleText);
      expect(block.payload).toHaveProperty('html', titleText);
      expect(block.uuid).toMatch(/[0-9a-f-]{36}/);
      expect(block.groupUuid).toMatch(/[0-9a-f-]{36}/);
      // groupType for form titles defaults to TEXT to align with Tally docs
      expect(block.groupType).toBe('TEXT');
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
  });
}); 
import { randomUUID } from 'crypto';
import { FormConfig, QuestionConfig, QuestionType, questionHasOptions } from '../models/form-config';
import { EnrichedFieldConfiguration } from '../types';

/**
 * Tally block type strings (partial list, extend as needed)
 */
export type TallyBlockType =
  | 'FORM_TITLE'
  | 'INPUT_TEXT'
  | 'INPUT_EMAIL'
  | 'INPUT_NUMBER'
  | 'INPUT_PHONE_NUMBER'
  | 'INPUT_LINK'
  | 'INPUT_DATE'
  | 'INPUT_TIME'
  | 'TEXTAREA'
  | 'TITLE'
  | 'DROPDOWN'
  | 'CHECKBOXES'
  | 'MULTIPLE_CHOICE'
  | 'LINEAR_SCALE'
  | 'RATING'
  | 'FILE_UPLOAD'
  | 'SIGNATURE'
  | 'DROPDOWN_OPTION'
  | 'MULTIPLE_CHOICE_OPTION'
  | 'CHECKBOX';

/**
 * Base structure for a Tally block used by the public API
 */
export interface TallyBlock {
  uuid: string;
  type: TallyBlockType;
  /**
   * Logical grouping ID – generally shared across blocks that belong to the same page/section
   */
  groupUuid: string;
  /**
   * Tally expects groupType to mirror the primary block type for most simple use-cases
   */
  groupType: string;
  /**
   * Block-specific payload; the exact shape depends on the block type
   */
  payload: Record<string, any>;
  title: string;
}

/**
 * Maps internal QuestionType → TallyBlockType.
 * The mapping is based on the subset of types currently supported by the create_form tool.
 * When new question types are introduced, extend this mapping accordingly.
 */
function mapQuestionTypeToBlockType(type: QuestionType): TallyBlockType {
  switch (type) {
    case QuestionType.TEXT:
      return 'INPUT_TEXT';
    case QuestionType.EMAIL:
      return 'INPUT_EMAIL';
    case QuestionType.NUMBER:
      return 'INPUT_NUMBER';
    case QuestionType.PHONE:
      return 'INPUT_PHONE_NUMBER';
    case QuestionType.URL:
      return 'INPUT_LINK';
    case QuestionType.DATE:
      return 'INPUT_DATE';
    case QuestionType.TIME:
      return 'INPUT_TIME';
    case QuestionType.TEXTAREA:
      return 'TEXTAREA';
    case QuestionType.DROPDOWN:
      return 'DROPDOWN';
    case QuestionType.CHECKBOXES:
      return 'CHECKBOXES';
    case QuestionType.MULTIPLE_CHOICE:
      return 'MULTIPLE_CHOICE';
    case QuestionType.LINEAR_SCALE:
      return 'LINEAR_SCALE';
    case QuestionType.RATING:
      return 'RATING';
    case QuestionType.FILE:
      return 'FILE_UPLOAD';
    case QuestionType.SIGNATURE:
      return 'SIGNATURE';
    default:
      // Fallback to simple text input; adjust as mapping grows.
      return 'INPUT_TEXT';
  }
}

/**
 * Generate a FORM_TITLE block with the provided title.
 */
export function createFormTitleBlock(title: string): TallyBlock {
  return {
    uuid: randomUUID(),
    type: 'FORM_TITLE',
    groupUuid: randomUUID(),
    groupType: 'TEXT',
    title,
    payload: {
      html: title,
    },
  };
}

/**
 * Generate a Tally block from a QuestionConfig definition.
 * This keeps the payload intentionally minimal for MVP support – additional
 * field-specific properties (validations, formatting, etc.) should be appended
 * in future iterations as downstream tasks address advanced mapping.
 */
export function createQuestionBlocks(question: QuestionConfig): TallyBlock[] {
  const blocks: TallyBlock[] = [];
  const groupUuid = randomUUID();

  // Title block for question label
  blocks.push({
    uuid: randomUUID(),
    type: 'TITLE',
    groupUuid,
    groupType: 'QUESTION',
    title: question.label,
    payload: {
      html: question.label,
    },
  });

  // Input block
  const blockType = mapQuestionTypeToBlockType(question.type);
  const payload: Record<string, any> = {
    isRequired: question.required ?? false,
    placeholder: 'placeholder' in question && question.placeholder ? question.placeholder : '',
  };

  if (questionHasOptions(question)) {
    payload.options = question.options.map((opt) => ({
      id: randomUUID(),
      text: opt.text ?? opt.value ?? opt.id ?? String(opt),
    }));
  }

  // For choice-based questions where Tally expects each option as its own block
  if (questionHasOptions(question) && ['DROPDOWN', 'MULTIPLE_CHOICE', 'CHECKBOXES'].includes(blockType)) {
    const optionBlocks: TallyBlock[] = [];
    const optionGroupUuid = randomUUID();

    question.options.forEach((opt, idx) => {
      let optionType: TallyBlockType | 'DROPDOWN_OPTION' | 'MULTIPLE_CHOICE_OPTION' | 'CHECKBOX';
      switch (blockType) {
        case 'DROPDOWN':
          optionType = 'DROPDOWN_OPTION';
          break;
        case 'MULTIPLE_CHOICE':
          optionType = 'MULTIPLE_CHOICE_OPTION';
          break;
        case 'CHECKBOXES':
          optionType = 'CHECKBOX';
          break;
        default:
          optionType = 'DROPDOWN_OPTION';
      }

      optionBlocks.push({
        uuid: randomUUID(),
        type: optionType as TallyBlockType, // cast for index signature; runtime value is correct per docs
        groupUuid: optionGroupUuid,
        groupType: blockType,
        title: opt.text ?? opt.value ?? String(opt),
        payload: {
          index: idx,
          text: opt.text ?? opt.value ?? String(opt),
        },
      } as unknown as TallyBlock);
    });

    blocks.push(...optionBlocks);
    return blocks;
  }

  blocks.push({
    uuid: randomUUID(),
    type: blockType,
    groupUuid,
    groupType: blockType,
    title: question.label,
    payload,
  });

  return blocks;
}

/**
 * Build the full blocks array for a FormConfig – title block first, followed
 * by field blocks mirroring the order of the input questions array.
 */
export function buildBlocksForForm(formConfig: FormConfig): TallyBlock[] {
  const blocks: TallyBlock[] = [];
  blocks.push(createFormTitleBlock(formConfig.title));
  formConfig.questions.forEach((q) => {
    blocks.push(...createQuestionBlocks(q));
  });
  return blocks;
}

/**
 * Enhanced result from building blocks that includes field ID mappings
 */
export interface BlockBuilderResult {
  /**
   * Array of Tally blocks for the API request
   */
  blocks: TallyBlock[];
  
  /**
   * Array of generated field IDs in the order they appear in the form
   */
  fieldIds: string[];
  
  /**
   * Mapping between question indices and their corresponding block UUIDs
   */
  fieldBlockMapping: Array<{
    questionIndex: number;
    questionId: string;
    blockUuid: string;
    blockType: TallyBlockType;
    label: string;
  }>;
}

/**
 * Enhanced version of createQuestionBlocks that returns blocks and field mapping info
 */
export function createQuestionBlocksWithMapping(question: QuestionConfig, questionIndex: number): {
  blocks: TallyBlock[];
  fieldMapping: {
    questionIndex: number;
    questionId: string;
    blockUuid: string;
    blockType: TallyBlockType;
    label: string;
  };
} {
  const blocks: TallyBlock[] = [];
  const groupUuid = randomUUID();

  // Title block for question label
  blocks.push({
    uuid: randomUUID(),
    type: 'TITLE',
    groupUuid,
    groupType: 'QUESTION',
    title: question.label,
    payload: {
      html: question.label,
    },
  });

  // Input block
  const blockType = mapQuestionTypeToBlockType(question.type);
  const inputBlockUuid = randomUUID();
  const payload: Record<string, any> = {
    isRequired: question.required ?? false,
    placeholder: 'placeholder' in question && question.placeholder ? question.placeholder : '',
  };

  if (questionHasOptions(question)) {
    payload.options = question.options.map((opt) => ({
      id: randomUUID(),
      text: opt.text ?? opt.value ?? opt.id ?? String(opt),
    }));
  }

  // For choice-based questions where Tally expects each option as its own block
  if (questionHasOptions(question) && ['DROPDOWN', 'MULTIPLE_CHOICE', 'CHECKBOXES'].includes(blockType)) {
    const optionBlocks: TallyBlock[] = [];
    const optionGroupUuid = randomUUID();

    question.options.forEach((opt, idx) => {
      let optionType: TallyBlockType | 'DROPDOWN_OPTION' | 'MULTIPLE_CHOICE_OPTION' | 'CHECKBOX';
      switch (blockType) {
        case 'DROPDOWN':
          optionType = 'DROPDOWN_OPTION';
          break;
        case 'MULTIPLE_CHOICE':
          optionType = 'MULTIPLE_CHOICE_OPTION';
          break;
        case 'CHECKBOXES':
          optionType = 'CHECKBOX';
          break;
        default:
          optionType = 'DROPDOWN_OPTION';
      }

      optionBlocks.push({
        uuid: randomUUID(),
        type: optionType as TallyBlockType,
        groupUuid: optionGroupUuid,
        groupType: blockType,
        title: opt.text ?? opt.value ?? String(opt),
        payload: {
          index: idx,
          text: opt.text ?? opt.value ?? String(opt),
        },
      } as unknown as TallyBlock);
    });

    blocks.push(...optionBlocks);
    
    return {
      blocks,
      fieldMapping: {
        questionIndex,
        questionId: question.id || '',
        blockUuid: inputBlockUuid, // Use the main input block UUID for mapping
        blockType,
        label: question.label
      }
    };
  }

  blocks.push({
    uuid: inputBlockUuid,
    type: blockType,
    groupUuid,
    groupType: blockType,
    title: question.label,
    payload,
  });

  return {
    blocks,
    fieldMapping: {
      questionIndex,
      questionId: question.id || '',
      blockUuid: inputBlockUuid,
      blockType,
      label: question.label
    }
  };
}

/**
 * Enhanced version of buildBlocksForForm that returns field mapping information
 */
export function buildBlocksForFormWithMapping(formConfig: FormConfig): BlockBuilderResult {
  const blocks: TallyBlock[] = [];
  const fieldIds: string[] = [];
  const fieldBlockMapping: Array<{
    questionIndex: number;
    questionId: string;
    blockUuid: string;
    blockType: TallyBlockType;
    label: string;
  }> = [];

  // Add form title block
  blocks.push(createFormTitleBlock(formConfig.title));

  // Add question blocks with mapping
  formConfig.questions.forEach((question, index) => {
    const result = createQuestionBlocksWithMapping(question, index);
    blocks.push(...result.blocks);
    fieldIds.push(result.fieldMapping.questionId);
    fieldBlockMapping.push(result.fieldMapping);
  });

  return {
    blocks,
    fieldIds,
    fieldBlockMapping
  };
}

/**
 * Generate enriched field configurations from FormConfig and block mapping
 */
export function generateEnrichedFieldConfigurations(
  formConfig: FormConfig,
  fieldBlockMapping: BlockBuilderResult['fieldBlockMapping']
): EnrichedFieldConfiguration[] {
  if (!formConfig.questions) {
    return [];
  }

  return formConfig.questions.map((question, index) => {
    const mapping = fieldBlockMapping[index];
    const fieldId = mapping?.questionId || question.id || '';
    
    const enrichedConfig: EnrichedFieldConfiguration = {
      id: fieldId,
      type: question.type,
      label: question.label,
      description: question.description,
      required: question.required || false,
      placeholder: question.placeholder,
      order: index + 1,
      metadata: {
        originalIndex: index,
        createdAt: new Date().toISOString(),
        blockUuid: mapping?.blockUuid,
        blockType: mapping?.blockType
      }
    };

    // Add validation rules if present
    if (question.validation) {
      enrichedConfig.validationRules = {
        rules: Array.isArray(question.validation.rules) 
          ? question.validation.rules.map(rule => ({
              ...rule,
              errorMessage: rule.errorMessage,
              enabled: rule.enabled !== false
            }))
          : []
      };
    }

    // Add options for choice-based questions
    if ('options' in question && question.options) {
      enrichedConfig.options = question.options.map((option: any, optIndex: number) => ({
        id: option.id || `${fieldId}_option_${optIndex}`,
        label: option.label || option.text || option.value,
        value: option.value || option.text || option.label
      }));
    }

    // Add conditional logic if present
    if ('conditionalLogic' in question && question.conditionalLogic) {
      const logic = question.conditionalLogic as any;
      enrichedConfig.conditionalLogic = {
        showIf: logic.showIf,
        hideIf: logic.hideIf,
        requireIf: logic.requireIf
      };
    }

    // Add type-specific properties
    const typeSpecific = extractTypeSpecificProperties(question as any);
    if (typeSpecific) {
      enrichedConfig.typeSpecificProperties = typeSpecific;
    }

    return enrichedConfig;
  });
}

/**
 * Extract type-specific properties from a question configuration
 */
function extractTypeSpecificProperties(question: any): { [key: string]: any } | undefined {
  const typeSpecific: { [key: string]: any } = {};
  
  // Extract type-specific properties based on question type
  switch (question.type) {
    case 'number':
      if (question.min !== undefined) typeSpecific.min = question.min;
      if (question.max !== undefined) typeSpecific.max = question.max;
      if (question.step !== undefined) typeSpecific.step = question.step;
      if (question.numberCurrency !== undefined) typeSpecific.currency = question.numberCurrency;
      break;
    case 'text':
    case 'textarea':
      if (question.minLength !== undefined) typeSpecific.minLength = question.minLength;
      if (question.maxLength !== undefined) typeSpecific.maxLength = question.maxLength;
      if (question.textRows !== undefined) typeSpecific.rows = question.textRows;
      break;
    case 'rating':
      if (question.ratingMax !== undefined) typeSpecific.maxRating = question.ratingMax;
      if (question.ratingStyle !== undefined) typeSpecific.style = question.ratingStyle;
      break;
    case 'date':
      if (question.dateFormat !== undefined) typeSpecific.format = question.dateFormat;
      if (question.minDate !== undefined) typeSpecific.minDate = question.minDate;
      if (question.maxDate !== undefined) typeSpecific.maxDate = question.maxDate;
      break;
    case 'time':
      if (question.timeFormat !== undefined) typeSpecific.format = question.timeFormat;
      break;
    case 'file':
      if (question.fileTypes !== undefined) typeSpecific.allowedTypes = question.fileTypes;
      if (question.maxFileSize !== undefined) typeSpecific.maxSize = question.maxFileSize;
      if (question.maxFiles !== undefined) typeSpecific.maxFiles = question.maxFiles;
      break;
    case 'matrix':
      if (question.matrixRows !== undefined) typeSpecific.rows = question.matrixRows;
      if (question.matrixColumns !== undefined) typeSpecific.columns = question.matrixColumns;
      if (question.matrixResponseType !== undefined) typeSpecific.responseType = question.matrixResponseType;
      break;
    case 'payment':
      if (question.paymentMethods !== undefined) typeSpecific.methods = question.paymentMethods;
      if (question.paymentAmount !== undefined) typeSpecific.amount = question.paymentAmount;
      if (question.paymentCurrency !== undefined) typeSpecific.currency = question.paymentCurrency;
      break;
  }
  
  return Object.keys(typeSpecific).length > 0 ? typeSpecific : undefined;
} 
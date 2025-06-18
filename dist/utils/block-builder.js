import { randomUUID } from 'crypto';
import { QuestionType, questionHasOptions } from '../models/form-config';
/**
 * Maps internal QuestionType → TallyBlockType.
 * The mapping is based on the subset of types currently supported by the create_form tool.
 * When new question types are introduced, extend this mapping accordingly.
 */
function mapQuestionTypeToBlockType(type) {
    switch (type) {
        case QuestionType.TEXT:
            return 'INPUT_TEXT';
        case QuestionType.EMAIL:
            return 'INPUT_EMAIL';
        case QuestionType.NUMBER:
            return 'INPUT_NUMBER';
        case QuestionType.TEXTAREA:
            return 'TEXTAREA';
        case QuestionType.DROPDOWN:
            return 'DROPDOWN';
        case QuestionType.CHECKBOXES:
            return 'CHECKBOXES';
        case QuestionType.MULTIPLE_CHOICE:
            return 'MULTIPLE_CHOICE';
        default:
            // Fallback to simple text input; adjust as mapping grows.
            return 'INPUT_TEXT';
    }
}
/**
 * Generate a FORM_TITLE block with the provided title.
 */
export function createFormTitleBlock(title) {
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
export function createQuestionBlocks(question) {
    const blocks = [];
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
    const payload = {
        isRequired: question.required ?? false,
        placeholder: 'placeholder' in question && question.placeholder ? question.placeholder : '',
    };
    if (questionHasOptions(question)) {
        payload.options = question.options.map((opt) => ({
            id: randomUUID(),
            text: opt.text ?? opt.value ?? opt.id ?? String(opt),
        }));
    }
    blocks.push({
        uuid: randomUUID(),
        type: blockType,
        groupUuid,
        groupType: 'QUESTION',
        title: question.label,
        payload,
    });
    return blocks;
}
/**
 * Build the full blocks array for a FormConfig – title block first, followed
 * by field blocks mirroring the order of the input questions array.
 */
export function buildBlocksForForm(formConfig) {
    const blocks = [];
    blocks.push(createFormTitleBlock(formConfig.title));
    formConfig.questions.forEach((q) => {
        blocks.push(...createQuestionBlocks(q));
    });
    return blocks;
}

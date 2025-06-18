import { randomUUID } from 'crypto';
import { QuestionType, questionHasOptions } from '../models/form-config';
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
            return 'INPUT_TEXT';
    }
}
export function createFormTitleBlock(title) {
    return {
        uuid: randomUUID(),
        type: 'FORM_TITLE',
        blockGroupUuid: randomUUID(),
        groupType: 'FORM_TITLE',
        title,
        payload: {
            text: title,
            html: `<h1>${title}</h1>`,
        },
    };
}
export function createFieldBlock(question) {
    const blockType = mapQuestionTypeToBlockType(question.type);
    const payload = {
        required: question.required ?? false,
        placeholder: 'placeholder' in question && question.placeholder ? question.placeholder : undefined,
    };
    const base = {
        uuid: randomUUID(),
        type: blockType,
        blockGroupUuid: randomUUID(),
        groupType: blockType,
        title: question.label,
        payload,
    };
    if (questionHasOptions(question)) {
        base.payload.options = question.options.map((opt) => ({
            id: randomUUID(),
            text: opt.text ?? opt.value ?? opt.id ?? String(opt),
        }));
    }
    return base;
}
export function buildBlocksForForm(formConfig) {
    const blocks = [];
    blocks.push(createFormTitleBlock(formConfig.title));
    formConfig.questions.forEach((question) => blocks.push(createFieldBlock(question)));
    return blocks;
}
//# sourceMappingURL=block-builder.js.map
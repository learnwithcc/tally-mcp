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
            return 'INPUT_TEXT';
    }
}
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
export function createQuestionBlocks(question) {
    const blocks = [];
    const groupUuid = randomUUID();
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
        groupType: blockType,
        title: question.label,
        payload,
    });
    return blocks;
}
export function buildBlocksForForm(formConfig) {
    const blocks = [];
    blocks.push(createFormTitleBlock(formConfig.title));
    formConfig.questions.forEach((q) => {
        blocks.push(...createQuestionBlocks(q));
    });
    return blocks;
}
//# sourceMappingURL=block-builder.js.map
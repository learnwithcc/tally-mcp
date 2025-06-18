import { FormConfig, QuestionConfig } from '../models/form-config';
export type TallyBlockType = 'FORM_TITLE' | 'INPUT_TEXT' | 'INPUT_EMAIL' | 'INPUT_NUMBER' | 'INPUT_PHONE_NUMBER' | 'INPUT_LINK' | 'INPUT_DATE' | 'INPUT_TIME' | 'TEXTAREA' | 'TITLE' | 'DROPDOWN' | 'CHECKBOXES' | 'MULTIPLE_CHOICE' | 'LINEAR_SCALE' | 'RATING' | 'FILE_UPLOAD' | 'SIGNATURE';
export interface TallyBlock {
    uuid: string;
    type: TallyBlockType;
    groupUuid: string;
    groupType: string;
    payload: Record<string, any>;
    title: string;
}
export declare function createFormTitleBlock(title: string): TallyBlock;
export declare function createQuestionBlocks(question: QuestionConfig): TallyBlock[];
export declare function buildBlocksForForm(formConfig: FormConfig): TallyBlock[];
//# sourceMappingURL=block-builder.d.ts.map
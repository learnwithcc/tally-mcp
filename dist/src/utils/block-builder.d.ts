import { FormConfig, QuestionConfig } from '../models/form-config';
export type TallyBlockType = 'FORM_TITLE' | 'INPUT_TEXT' | 'INPUT_EMAIL' | 'INPUT_NUMBER' | 'TEXTAREA' | 'DROPDOWN' | 'CHECKBOXES' | 'MULTIPLE_CHOICE';
export interface TallyBlock {
    uuid: string;
    type: TallyBlockType;
    blockGroupUuid: string;
    groupType: string;
    payload: Record<string, any>;
    title: string;
}
export declare function createFormTitleBlock(title: string): TallyBlock;
export declare function createFieldBlock(question: QuestionConfig): TallyBlock;
export declare function buildBlocksForForm(formConfig: FormConfig): TallyBlock[];
//# sourceMappingURL=block-builder.d.ts.map
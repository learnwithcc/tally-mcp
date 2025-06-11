import { FormConfig } from '../models';
import { TallyForm } from '../models/tally-schemas';
import { ParsedModificationCommand } from './form-modification-parser';
export interface ModificationOperationResult {
    success: boolean;
    modifiedFormConfig?: FormConfig;
    message: string;
    changes: string[];
    errors?: string[];
}
export interface FieldLookupOptions {
    formConfig: FormConfig;
    fieldNumber?: number;
    fieldId?: string;
    fieldLabel?: string;
}
export declare class FormModificationOperations {
    executeOperation(command: ParsedModificationCommand, baseForm: TallyForm | null, currentFormConfig?: FormConfig): ModificationOperationResult;
    private addField;
    private removeField;
    private makeFieldRequired;
    private updateFormTitle;
    private updateFormDescription;
    private reorderField;
    private addOption;
    private modifyField;
    private findField;
    private generateNextFieldId;
    private generateDefaultFieldLabel;
    private isChoiceField;
    private createQuestionConfig;
    private createRatingQuestionConfig;
    private createDateQuestionConfig;
    private createNumberQuestionConfig;
    private createLinearScaleQuestionConfig;
    private createChoiceQuestionConfig;
    private createTimeQuestionConfig;
    private createFileQuestionConfig;
    private createSignatureQuestionConfig;
    private createPaymentQuestionConfig;
    private createMatrixQuestionConfig;
    convertTallyFormToFormConfig(tallyForm: TallyForm & {
        questions?: any[];
        settings?: any;
    }): FormConfig;
    validateFormConfig(formConfig: FormConfig): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=form-modification-operations.d.ts.map
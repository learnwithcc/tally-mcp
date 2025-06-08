import { FormConfig, QuestionType, ValidationRules, ConditionalLogic } from '../models';
export interface NlpServiceConfig {
}
export interface ParsedForm {
    title?: string | undefined;
    description?: string | undefined;
    questions: ExtractedQuestion[];
}
export interface ExtractedQuestion {
    rawText: string;
    type?: QuestionType;
    title?: string;
    description?: string;
    options?: string[];
    validation?: ValidationRules;
    logic?: ConditionalLogic;
}
export interface ModificationCommand {
    action: 'add' | 'remove' | 'update';
    entity: 'question' | 'title' | 'description';
    payload: any;
}
export declare class NlpService {
    private questionTypeMap;
    constructor(_config?: NlpServiceConfig);
    parse(prompt: string): ParsedForm;
    private isQuestion;
    private extractQuestionDetails;
    private extractValidationRules;
    private extractConditionalLogic;
    generateFormConfig(prompt: string): FormConfig;
    customizeFormConfig(prompt: string, baseConfig: FormConfig): FormConfig;
    private parseModificationCommands;
    private applyCommand;
}
//# sourceMappingURL=nlp-service.d.ts.map
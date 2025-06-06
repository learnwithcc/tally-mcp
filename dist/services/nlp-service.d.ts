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
export declare class NlpService {
    private config;
    private questionTypeMap;
    constructor(config?: NlpServiceConfig);
    parse(prompt: string): ParsedForm;
    private isQuestion;
    private extractQuestionDetails;
    private extractValidationRules;
    private extractConditionalLogic;
    generateFormConfig(prompt: string): FormConfig;
}
//# sourceMappingURL=nlp-service.d.ts.map
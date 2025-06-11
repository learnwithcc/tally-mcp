import { QuestionType } from '../models';
export declare enum ModificationOperation {
    ADD_FIELD = "add_field",
    REMOVE_FIELD = "remove_field",
    MODIFY_FIELD = "modify_field",
    REORDER_FIELD = "reorder_field",
    MAKE_REQUIRED = "make_required",
    MAKE_OPTIONAL = "make_optional",
    UPDATE_TITLE = "update_title",
    UPDATE_DESCRIPTION = "update_description",
    ADD_OPTION = "add_option",
    REMOVE_OPTION = "remove_option"
}
export declare enum ModificationTarget {
    FIELD = "field",
    QUESTION = "question",
    OPTION = "option",
    FORM = "form"
}
export interface ParsedModificationCommand {
    operation: ModificationOperation;
    target: ModificationTarget;
    parameters: ModificationParameters;
    confidence: number;
    rawCommand: string;
    ambiguous?: boolean;
    clarificationNeeded?: string;
}
export interface ModificationParameters {
    fieldType?: QuestionType | undefined;
    fieldId?: string | undefined;
    fieldNumber?: number | undefined;
    fieldLabel?: string | undefined;
    targetPosition?: number | undefined;
    sourcePosition?: number | undefined;
    newValue?: string | undefined;
    optionText?: string | undefined;
    optionValue?: string | undefined;
    required?: boolean | undefined;
    description?: string | undefined;
    placeholder?: string | undefined;
    options?: string[] | undefined;
}
export declare class FormModificationParser {
    private questionTypeMap;
    private commandPatterns;
    constructor();
    parseCommand(command: string): ParsedModificationCommand;
    parseMultipleCommands(input: string): ParsedModificationCommand[];
    needsClarification(parsed: ParsedModificationCommand): boolean;
    generateSuggestions(command: string): string[];
    private initializeQuestionTypeMap;
    private initializeCommandPatterns;
    private normalizeCommand;
    private splitCommands;
    private isAmbiguous;
    private generateDefaultLabel;
}
//# sourceMappingURL=form-modification-parser.d.ts.map
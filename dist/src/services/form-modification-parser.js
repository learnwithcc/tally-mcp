import { QuestionType } from '../models';
export var ModificationOperation;
(function (ModificationOperation) {
    ModificationOperation["ADD_FIELD"] = "add_field";
    ModificationOperation["REMOVE_FIELD"] = "remove_field";
    ModificationOperation["MODIFY_FIELD"] = "modify_field";
    ModificationOperation["REORDER_FIELD"] = "reorder_field";
    ModificationOperation["MAKE_REQUIRED"] = "make_required";
    ModificationOperation["MAKE_OPTIONAL"] = "make_optional";
    ModificationOperation["UPDATE_TITLE"] = "update_title";
    ModificationOperation["UPDATE_DESCRIPTION"] = "update_description";
    ModificationOperation["ADD_OPTION"] = "add_option";
    ModificationOperation["REMOVE_OPTION"] = "remove_option";
})(ModificationOperation || (ModificationOperation = {}));
export var ModificationTarget;
(function (ModificationTarget) {
    ModificationTarget["FIELD"] = "field";
    ModificationTarget["QUESTION"] = "question";
    ModificationTarget["OPTION"] = "option";
    ModificationTarget["FORM"] = "form";
})(ModificationTarget || (ModificationTarget = {}));
export class FormModificationParser {
    constructor() {
        this.initializeQuestionTypeMap();
        this.initializeCommandPatterns();
    }
    parseCommand(command) {
        const normalizedCommand = this.normalizeCommand(command);
        for (const pattern of this.commandPatterns) {
            const match = normalizedCommand.match(pattern.pattern);
            if (match) {
                const parameters = pattern.extractor(match);
                return {
                    operation: pattern.operation,
                    target: pattern.target,
                    parameters,
                    confidence: pattern.confidence,
                    rawCommand: command,
                    ambiguous: this.isAmbiguous(parameters, pattern.operation)
                };
            }
        }
        return {
            operation: ModificationOperation.MODIFY_FIELD,
            target: ModificationTarget.FIELD,
            parameters: {},
            confidence: 0,
            rawCommand: command,
            ambiguous: true,
            clarificationNeeded: `I couldn't understand the command "${command}". Please try rephrasing it using patterns like "add [field type] field", "make [field] required", or "remove question [number]".`
        };
    }
    parseMultipleCommands(input) {
        const commands = this.splitCommands(input);
        return commands.map(cmd => this.parseCommand(cmd));
    }
    needsClarification(parsed) {
        return parsed.ambiguous === true || parsed.confidence < 0.7;
    }
    generateSuggestions(command) {
        const suggestions = [];
        const normalized = this.normalizeCommand(command);
        if (normalized.includes('add')) {
            suggestions.push('add text field', 'add email field', 'add phone field');
        }
        if (normalized.includes('required') || normalized.includes('require')) {
            suggestions.push('make field 1 required', 'make email required');
        }
        if (normalized.includes('remove') || normalized.includes('delete')) {
            suggestions.push('remove question 3', 'remove field 2');
        }
        return suggestions;
    }
    initializeQuestionTypeMap() {
        this.questionTypeMap = new Map([
            ['text', QuestionType.TEXT],
            ['input', QuestionType.TEXT],
            ['textarea', QuestionType.TEXTAREA],
            ['long text', QuestionType.TEXTAREA],
            ['email', QuestionType.EMAIL],
            ['email address', QuestionType.EMAIL],
            ['number', QuestionType.NUMBER],
            ['numeric', QuestionType.NUMBER],
            ['phone', QuestionType.PHONE],
            ['phone number', QuestionType.PHONE],
            ['url', QuestionType.URL],
            ['website', QuestionType.URL],
            ['link', QuestionType.URL],
            ['date', QuestionType.DATE],
            ['time', QuestionType.TIME],
            ['rating', QuestionType.RATING],
            ['stars', QuestionType.RATING],
            ['file', QuestionType.FILE],
            ['upload', QuestionType.FILE],
            ['attachment', QuestionType.FILE],
            ['signature', QuestionType.SIGNATURE],
            ['sign', QuestionType.SIGNATURE],
            ['payment', QuestionType.PAYMENT],
            ['pay', QuestionType.PAYMENT],
            ['choice', QuestionType.MULTIPLE_CHOICE],
            ['multiple choice', QuestionType.MULTIPLE_CHOICE],
            ['select', QuestionType.DROPDOWN],
            ['dropdown', QuestionType.DROPDOWN],
            ['checkboxes', QuestionType.CHECKBOXES],
            ['checkbox', QuestionType.CHECKBOXES],
            ['multi select', QuestionType.CHECKBOXES],
            ['scale', QuestionType.LINEAR_SCALE],
            ['linear scale', QuestionType.LINEAR_SCALE],
            ['slider', QuestionType.LINEAR_SCALE]
        ]);
    }
    initializeCommandPatterns() {
        this.commandPatterns = [
            {
                pattern: /add\s+(?:a\s+)?(?:new\s+)?(\w+(?:\s+\w+)*)\s+(?:field|question|input)/i,
                operation: ModificationOperation.ADD_FIELD,
                target: ModificationTarget.FIELD,
                confidence: 0.9,
                extractor: (match) => {
                    const fieldTypeKey = match[1]?.toLowerCase();
                    return {
                        fieldType: fieldTypeKey ? this.questionTypeMap.get(fieldTypeKey) : undefined,
                        fieldLabel: fieldTypeKey ? this.generateDefaultLabel(fieldTypeKey) : undefined
                    };
                }
            },
            {
                pattern: /(?:remove|delete)\s+(?:question|field)\s+(?:number\s+)?(\d+)/i,
                operation: ModificationOperation.REMOVE_FIELD,
                target: ModificationTarget.FIELD,
                confidence: 0.95,
                extractor: (match) => ({
                    fieldNumber: match[1] ? parseInt(match[1]) : undefined
                })
            },
            {
                pattern: /(?:remove|delete)\s+(?:the\s+)?(.+?)\s+(?:field|question)/i,
                operation: ModificationOperation.REMOVE_FIELD,
                target: ModificationTarget.FIELD,
                confidence: 0.8,
                extractor: (match) => ({
                    fieldLabel: match[1]?.trim()
                })
            },
            {
                pattern: /make\s+(?:question|field)\s+(?:number\s+)?(\d+)\s+required/i,
                operation: ModificationOperation.MAKE_REQUIRED,
                target: ModificationTarget.FIELD,
                confidence: 0.9,
                extractor: (match) => ({
                    fieldNumber: match[1] ? parseInt(match[1]) : undefined,
                    required: true
                })
            },
            {
                pattern: /make\s+(?:the\s+)?(.+?)\s+(?:field|question)\s+required/i,
                operation: ModificationOperation.MAKE_REQUIRED,
                target: ModificationTarget.FIELD,
                confidence: 0.85,
                extractor: (match) => ({
                    fieldLabel: match[1]?.trim(),
                    required: true
                })
            },
            {
                pattern: /make\s+(?:question|field)\s+(?:number\s+)?(\d+)\s+optional/i,
                operation: ModificationOperation.MAKE_OPTIONAL,
                target: ModificationTarget.FIELD,
                confidence: 0.9,
                extractor: (match) => ({
                    fieldNumber: match[1] ? parseInt(match[1]) : undefined,
                    required: false
                })
            },
            {
                pattern: /(?:update|change|set)\s+(?:the\s+)?(?:form\s+)?title\s+to\s+"([^"]+)"/i,
                operation: ModificationOperation.UPDATE_TITLE,
                target: ModificationTarget.FORM,
                confidence: 0.95,
                extractor: (match) => ({
                    newValue: match[1]
                })
            },
            {
                pattern: /(?:update|change|set)\s+(?:the\s+)?(?:form\s+)?description\s+to\s+"([^"]+)"/i,
                operation: ModificationOperation.UPDATE_DESCRIPTION,
                target: ModificationTarget.FORM,
                confidence: 0.95,
                extractor: (match) => ({
                    newValue: match[1]
                })
            },
            {
                pattern: /move\s+(?:question|field)\s+(\d+)\s+(?:to\s+)?(?:position\s+)?(\d+)/i,
                operation: ModificationOperation.REORDER_FIELD,
                target: ModificationTarget.FIELD,
                confidence: 0.9,
                extractor: (match) => ({
                    sourcePosition: match[1] ? parseInt(match[1]) : undefined,
                    targetPosition: match[2] ? parseInt(match[2]) : undefined
                })
            },
            {
                pattern: /add\s+option\s+"([^"]+)"\s+to\s+(?:question|field)\s+(\d+)/i,
                operation: ModificationOperation.ADD_OPTION,
                target: ModificationTarget.OPTION,
                confidence: 0.9,
                extractor: (match) => ({
                    optionText: match[1],
                    fieldNumber: match[2] ? parseInt(match[2]) : undefined
                })
            },
            {
                pattern: /(?:update|change|modify)\s+(?:question|field)\s+(\d+)/i,
                operation: ModificationOperation.MODIFY_FIELD,
                target: ModificationTarget.FIELD,
                confidence: 0.7,
                extractor: (match) => ({
                    fieldNumber: match[1] ? parseInt(match[1]) : undefined
                })
            }
        ];
    }
    normalizeCommand(command) {
        let normalized = command.trim();
        const quotedStrings = [];
        normalized = normalized.replace(/"([^"]+)"/g, (_match, content) => {
            quotedStrings.push(content);
            return `"__QUOTED_${quotedStrings.length - 1}__"`;
        });
        normalized = normalized
            .toLowerCase()
            .replace(/[^\w\s"_]/g, ' ')
            .replace(/\s+/g, ' ');
        quotedStrings.forEach((content, index) => {
            normalized = normalized.replace(`"__quoted_${index}__"`, `"${content}"`);
        });
        return normalized;
    }
    splitCommands(input) {
        const separators = /(?:\s*[,;]\s*)|(?:\s+and\s+)|(?:\s+then\s+)/i;
        return input.split(separators)
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0);
    }
    isAmbiguous(parameters, operation) {
        switch (operation) {
            case ModificationOperation.ADD_FIELD:
                return !parameters.fieldType;
            case ModificationOperation.REMOVE_FIELD:
            case ModificationOperation.MODIFY_FIELD:
                return !parameters.fieldNumber && !parameters.fieldLabel;
            case ModificationOperation.MAKE_REQUIRED:
            case ModificationOperation.MAKE_OPTIONAL:
                return !parameters.fieldNumber && !parameters.fieldLabel;
            default:
                return false;
        }
    }
    generateDefaultLabel(fieldType) {
        const typeLabel = fieldType.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        return `${typeLabel} Field`;
    }
}
//# sourceMappingURL=form-modification-parser.js.map
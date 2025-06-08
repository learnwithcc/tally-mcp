import { QuestionType } from '../models';

/**
 * Types of operations that can be performed on forms
 */
export enum ModificationOperation {
  ADD_FIELD = 'add_field',
  REMOVE_FIELD = 'remove_field',
  MODIFY_FIELD = 'modify_field',
  REORDER_FIELD = 'reorder_field',
  MAKE_REQUIRED = 'make_required',
  MAKE_OPTIONAL = 'make_optional',
  UPDATE_TITLE = 'update_title',
  UPDATE_DESCRIPTION = 'update_description',
  ADD_OPTION = 'add_option',
  REMOVE_OPTION = 'remove_option'
}

/**
 * Target types for modification operations
 */
export enum ModificationTarget {
  FIELD = 'field',
  QUESTION = 'question',
  OPTION = 'option',
  FORM = 'form'
}

/**
 * Parsed modification command structure
 */
export interface ParsedModificationCommand {
  operation: ModificationOperation;
  target: ModificationTarget;
  parameters: ModificationParameters;
  confidence: number; // 0-1, how confident we are in the parsing
  rawCommand: string;
  ambiguous?: boolean;
  clarificationNeeded?: string;
}

/**
 * Parameters for modification operations
 */
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

/**
 * Pattern matching rules for command recognition
 */
interface CommandPattern {
  pattern: RegExp;
  operation: ModificationOperation;
  target: ModificationTarget;
  confidence: number;
  extractor: (match: RegExpMatchArray) => Partial<ModificationParameters>;
}

export class FormModificationParser {
  private questionTypeMap!: Map<string, QuestionType>;
  private commandPatterns!: CommandPattern[];

  constructor() {
    this.initializeQuestionTypeMap();
    this.initializeCommandPatterns();
  }

  /**
   * Parse a natural language command into a structured modification operation
   */
  public parseCommand(command: string): ParsedModificationCommand {
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

    // If no pattern matches, return an ambiguous result
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

  /**
   * Parse multiple commands from a single input
   */
  public parseMultipleCommands(input: string): ParsedModificationCommand[] {
    const commands = this.splitCommands(input);
    return commands.map(cmd => this.parseCommand(cmd));
  }

  /**
   * Check if a command needs clarification
   */
  public needsClarification(parsed: ParsedModificationCommand): boolean {
    return parsed.ambiguous === true || parsed.confidence < 0.7;
  }

  /**
   * Generate suggestions for ambiguous commands
   */
  public generateSuggestions(command: string): string[] {
    const suggestions: string[] = [];
    const normalized = this.normalizeCommand(command);

    // If it mentions adding, suggest add patterns
    if (normalized.includes('add')) {
      suggestions.push('add text field', 'add email field', 'add phone field');
    }

    // If it mentions required, suggest requirement patterns
    if (normalized.includes('required') || normalized.includes('require')) {
      suggestions.push('make field 1 required', 'make email required');
    }

    // If it mentions remove, suggest removal patterns
    if (normalized.includes('remove') || normalized.includes('delete')) {
      suggestions.push('remove question 3', 'remove field 2');
    }

    return suggestions;
  }

  private initializeQuestionTypeMap(): void {
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

  private initializeCommandPatterns(): void {
    this.commandPatterns = [
      // Add field patterns
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
      
      // Remove field by number
      {
        pattern: /(?:remove|delete)\s+(?:question|field)\s+(?:number\s+)?(\d+)/i,
        operation: ModificationOperation.REMOVE_FIELD,
        target: ModificationTarget.FIELD,
        confidence: 0.95,
        extractor: (match) => ({
          fieldNumber: match[1] ? parseInt(match[1]) : undefined
        })
      },

      // Remove field by label/name
      {
        pattern: /(?:remove|delete)\s+(?:the\s+)?(.+?)\s+(?:field|question)/i,
        operation: ModificationOperation.REMOVE_FIELD,
        target: ModificationTarget.FIELD,
        confidence: 0.8,
        extractor: (match) => ({
          fieldLabel: match[1]?.trim()
        })
      },

      // Make field required
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

      // Make field required by name
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

      // Make field optional
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

      // Update form title
      {
        pattern: /(?:update|change|set)\s+(?:the\s+)?(?:form\s+)?title\s+to\s+"([^"]+)"/i,
        operation: ModificationOperation.UPDATE_TITLE,
        target: ModificationTarget.FORM,
        confidence: 0.95,
        extractor: (match) => ({
          newValue: match[1]
        })
      },

      // Update form description
      {
        pattern: /(?:update|change|set)\s+(?:the\s+)?(?:form\s+)?description\s+to\s+"([^"]+)"/i,
        operation: ModificationOperation.UPDATE_DESCRIPTION,
        target: ModificationTarget.FORM,
        confidence: 0.95,
        extractor: (match) => ({
          newValue: match[1]
        })
      },

      // Reorder fields
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

      // Add option to choice field
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

      // Generic field modification
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

  private normalizeCommand(command: string): string {
    // Preserve quoted strings while normalizing the rest
    let normalized = command.trim();
    const quotedStrings: string[] = [];
    
    // Extract quoted strings
    normalized = normalized.replace(/"([^"]+)"/g, (_match, content) => {
      quotedStrings.push(content);
      return `"__QUOTED_${quotedStrings.length - 1}__"`;
    });
    
    // Normalize non-quoted parts
    normalized = normalized
      .toLowerCase()
      .replace(/[^\w\s"_]/g, ' ')
      .replace(/\s+/g, ' ');
    
    // Restore quoted strings
    quotedStrings.forEach((content, index) => {
      normalized = normalized.replace(`"__quoted_${index}__"`, `"${content}"`);
    });
    
    return normalized;
  }

  private splitCommands(input: string): string[] {
    // Split on common separators while preserving quoted strings
    const separators = /(?:\s*[,;]\s*)|(?:\s+and\s+)|(?:\s+then\s+)/i;
    return input.split(separators)
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
  }

  private isAmbiguous(parameters: ModificationParameters, operation: ModificationOperation): boolean {
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

  private generateDefaultLabel(fieldType: string): string {
    const typeLabel = fieldType.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return `${typeLabel} Field`;
  }
} 
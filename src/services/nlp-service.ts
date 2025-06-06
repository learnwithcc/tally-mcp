import { FormConfig, QuestionConfig, SubmissionBehavior, FormTheme, QuestionType, ValidationRules, ConditionalLogic, LogicOperator, LogicCombinator, ConditionalAction } from '../models';

export interface NlpServiceConfig {
  // Configuration for the NLP service will be defined in future tasks.
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

export class NlpService {
  private config: NlpServiceConfig;
  private questionTypeMap: Map<string, QuestionType>;

  constructor(config: NlpServiceConfig = {}) {
    this.config = config;
    this.questionTypeMap = new Map([
        ['text', QuestionType.TEXT],
        ['long text', QuestionType.TEXTAREA],
        ['email', QuestionType.EMAIL],
        ['number', QuestionType.NUMBER],
        ['phone', QuestionType.PHONE],
        ['url', QuestionType.URL],
        ['date', QuestionType.DATE],
        ['time', QuestionType.TIME],
        ['rating', QuestionType.RATING],
        ['file', QuestionType.FILE],
        ['signature', QuestionType.SIGNATURE],
        ['payment', QuestionType.PAYMENT],
        ['choice', QuestionType.MULTIPLE_CHOICE],
        ['select', QuestionType.DROPDOWN],
        ['checkboxes', QuestionType.CHECKBOXES],
        ['scale', QuestionType.LINEAR_SCALE],
      ]);
  }

  public parse(prompt: string): ParsedForm {
    const lines = prompt.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return { questions: [] };

    let title: string | undefined = lines.shift();
    let description: string | undefined;

    if (lines.length > 0 && lines[0] && !this.isQuestion(lines[0])) {
      description = lines.shift();
    }

    const questions = lines.map(line => this.extractQuestionDetails(line));

    return { title, description, questions };
  }

  private isQuestion(line: string): boolean {
    const trimmed = line.trim();
    return trimmed.includes('?') || /^\d+[:.]/.test(trimmed) || this.questionTypeMap.has(trimmed.split(' ')[0].toLowerCase());
  }

  private extractQuestionDetails(line: string): ExtractedQuestion {
    const title = line.replace(/\s*\(([^)]+)\)\s*$/, '').trim();
    const typeMatch = line.match(/\(([^)]+)\)/);
    const type = (typeMatch && typeMatch[1] && this.questionTypeMap.get(typeMatch[1].toLowerCase())) || QuestionType.TEXT;

    const extractedQuestion: ExtractedQuestion = {
      rawText: line,
      title,
      type,
      validation: this.extractValidationRules(line),
    };

    const logic = this.extractConditionalLogic(line);
    if (logic) {
      extractedQuestion.logic = logic;
    }

    return extractedQuestion;
  }

  private extractValidationRules(line: string): ValidationRules {
    const rules: ValidationRules = {};
    if (line.toLowerCase().includes('required')) {
      rules.required = true;
    }
    return rules;
  }

  private extractConditionalLogic(line: string): ConditionalLogic | undefined {
    const logicMatch = line.match(/if question (\d+) is "([^"]+)" then (show|hide) this question/i);
    if (logicMatch && logicMatch[1] && logicMatch[2] && logicMatch[3]) {
      const [, triggerQuestionId, triggerValue, action] = logicMatch;
      return {
        conditionGroup: {
          combinator: LogicCombinator.AND,
          conditions: [{ questionId: triggerQuestionId, operator: LogicOperator.EQUALS, value: triggerValue }],
        },
        actions: [{ action: action.toLowerCase() === 'show' ? ConditionalAction.SHOW : ConditionalAction.HIDE }],
      };
    }
    return undefined;
  }

  public generateFormConfig(prompt: string): FormConfig {
    const parsed = this.parse(prompt);
    const questions: QuestionConfig[] = parsed.questions.map((q, index) => ({
      id: (index + 1).toString(),
      type: q.type || QuestionType.TEXT,
      label: q.title || 'Untitled Question',
      required: q.validation?.required || false,
      validation: q.validation,
      logic: q.logic,
    } as QuestionConfig));

    return {
      title: parsed.title ?? 'Untitled Form',
      questions,
      settings: {
        submissionBehavior: SubmissionBehavior.MESSAGE,
        submissionMessage: 'Thanks!',
      },
      branding: {
        theme: FormTheme.DEFAULT,
      },
    };
  }
} 
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NlpService = void 0;
const models_1 = require("../models");
class NlpService {
    constructor(config = {}) {
        this.config = config;
        this.questionTypeMap = new Map([
            ['text', models_1.QuestionType.TEXT],
            ['long text', models_1.QuestionType.TEXTAREA],
            ['email', models_1.QuestionType.EMAIL],
            ['number', models_1.QuestionType.NUMBER],
            ['phone', models_1.QuestionType.PHONE],
            ['url', models_1.QuestionType.URL],
            ['date', models_1.QuestionType.DATE],
            ['time', models_1.QuestionType.TIME],
            ['rating', models_1.QuestionType.RATING],
            ['file', models_1.QuestionType.FILE],
            ['signature', models_1.QuestionType.SIGNATURE],
            ['payment', models_1.QuestionType.PAYMENT],
            ['choice', models_1.QuestionType.MULTIPLE_CHOICE],
            ['select', models_1.QuestionType.DROPDOWN],
            ['checkboxes', models_1.QuestionType.CHECKBOXES],
            ['scale', models_1.QuestionType.LINEAR_SCALE],
        ]);
    }
    parse(prompt) {
        const lines = prompt.trim().split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0)
            return { questions: [] };
        let title = lines.shift();
        let description;
        if (lines.length > 0 && lines[0] && !this.isQuestion(lines[0])) {
            description = lines.shift();
        }
        const questions = lines.map(line => this.extractQuestionDetails(line));
        return { title, description, questions };
    }
    isQuestion(line) {
        const trimmed = line.trim();
        return trimmed.includes('?') || /^\d+[:.]/.test(trimmed) || this.questionTypeMap.has(trimmed.split(' ')[0].toLowerCase());
    }
    extractQuestionDetails(line) {
        const title = line.replace(/\s*\(([^)]+)\)\s*$/, '').trim();
        const typeMatch = line.match(/\(([^)]+)\)/);
        const type = (typeMatch && typeMatch[1] && this.questionTypeMap.get(typeMatch[1].toLowerCase())) || models_1.QuestionType.TEXT;
        const extractedQuestion = {
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
    extractValidationRules(line) {
        const rules = {};
        if (line.toLowerCase().includes('required')) {
            rules.required = true;
        }
        return rules;
    }
    extractConditionalLogic(line) {
        const logicMatch = line.match(/if question (\d+) is "([^"]+)" then (show|hide) this question/i);
        if (logicMatch && logicMatch[1] && logicMatch[2] && logicMatch[3]) {
            const [, triggerQuestionId, triggerValue, action] = logicMatch;
            return {
                conditionGroup: {
                    combinator: models_1.LogicCombinator.AND,
                    conditions: [{ questionId: triggerQuestionId, operator: models_1.LogicOperator.EQUALS, value: triggerValue }],
                },
                actions: [{ action: action.toLowerCase() === 'show' ? models_1.ConditionalAction.SHOW : models_1.ConditionalAction.HIDE }],
            };
        }
        return undefined;
    }
    generateFormConfig(prompt) {
        const parsed = this.parse(prompt);
        const questions = parsed.questions.map((q, index) => ({
            id: (index + 1).toString(),
            type: q.type || models_1.QuestionType.TEXT,
            label: q.title || 'Untitled Question',
            required: q.validation?.required || false,
            validation: q.validation,
            logic: q.logic,
        }));
        return {
            title: parsed.title ?? 'Untitled Form',
            questions,
            settings: {
                submissionBehavior: models_1.SubmissionBehavior.MESSAGE,
                submissionMessage: 'Thanks!',
            },
            branding: {
                theme: models_1.FormTheme.DEFAULT,
            },
        };
    }
}
exports.NlpService = NlpService;
//# sourceMappingURL=nlp-service.js.map
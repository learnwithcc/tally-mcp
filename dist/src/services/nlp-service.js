import { SubmissionBehavior, FormTheme, QuestionType, LogicOperator, LogicCombinator, ConditionalAction } from '../models';
import { v4 as uuidv4 } from 'uuid';
export class NlpService {
    constructor(_config = {}) {
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
    parse(prompt) {
        const lines = prompt.trim().split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) {
            return { questions: [] };
        }
        let title = lines.shift();
        let description;
        if (lines.length > 0) {
            const nextLine = lines[0];
            if (nextLine && !this.isQuestion(nextLine)) {
                description = lines.shift();
            }
        }
        const questions = lines.map(line => this.extractQuestionDetails(line));
        return { title, description, questions };
    }
    isQuestion(line) {
        const trimmed = line.trim();
        return trimmed.includes('?') || /^\d+[:.]/.test(trimmed) || this.questionTypeMap.has(trimmed.split(' ')[0]?.toLowerCase() || '');
    }
    extractQuestionDetails(line) {
        const title = line.replace(/\s*\(([^)]+)\)\s*$/, '').trim();
        const typeMatch = line.match(/\(([^)]+)\)/);
        const type = (typeMatch && typeMatch[1] && this.questionTypeMap.get(typeMatch[1].toLowerCase())) || QuestionType.TEXT;
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
                    combinator: LogicCombinator.AND,
                    conditions: [{ questionId: triggerQuestionId, operator: LogicOperator.EQUALS, value: triggerValue }],
                },
                actions: [{ action: action.toLowerCase() === 'show' ? ConditionalAction.SHOW : ConditionalAction.HIDE }],
            };
        }
        return undefined;
    }
    generateFormConfig(prompt) {
        const parsed = this.parse(prompt);
        const questions = parsed.questions.map((q) => ({
            id: uuidv4(),
            type: q.type || QuestionType.TEXT,
            label: q.title || 'Untitled Question',
            required: q.validation?.required || false,
            validation: q.validation,
            logic: q.logic,
        }));
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
    customizeFormConfig(prompt, baseConfig) {
        const commands = this.parseModificationCommands(prompt);
        let modifiedConfig = JSON.parse(JSON.stringify(baseConfig));
        for (const command of commands) {
            modifiedConfig = this.applyCommand(command, modifiedConfig);
        }
        return modifiedConfig;
    }
    parseModificationCommands(prompt) {
        const commands = [];
        const lines = prompt.trim().split('\n').map(line => line.trim()).filter(Boolean);
        for (const line of lines) {
            if (line.toLowerCase().startsWith('add question:')) {
                const questionText = line.substring('add question:'.length).trim();
                const extractedQuestion = this.extractQuestionDetails(questionText);
                commands.push({
                    action: 'add',
                    entity: 'question',
                    payload: {
                        id: uuidv4(),
                        type: extractedQuestion.type || QuestionType.TEXT,
                        label: extractedQuestion.title || 'Untitled Question',
                        required: extractedQuestion.validation?.required || false,
                        validation: extractedQuestion.validation,
                        logic: extractedQuestion.logic,
                    },
                });
            }
            else if (line.toLowerCase().startsWith('remove question:')) {
                const questionLabel = line.substring('remove question:'.length).trim();
                commands.push({
                    action: 'remove',
                    entity: 'question',
                    payload: { label: questionLabel },
                });
            }
            else if (line.toLowerCase().startsWith('update title:')) {
                const newTitle = line.substring('update title:'.length).trim();
                commands.push({
                    action: 'update',
                    entity: 'title',
                    payload: { title: newTitle },
                });
            }
        }
        return commands;
    }
    applyCommand(command, config) {
        switch (command.action) {
            case 'add':
                if (command.entity === 'question') {
                    config.questions.push(command.payload);
                }
                break;
            case 'remove':
                if (command.entity === 'question') {
                    config.questions = config.questions.filter(q => q.label !== command.payload.label);
                }
                break;
            case 'update':
                if (command.entity === 'title') {
                    config.title = command.payload.title;
                }
                break;
        }
        return config;
    }
}
//# sourceMappingURL=nlp-service.js.map
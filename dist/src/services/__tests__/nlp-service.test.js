import { NlpService } from '../nlp-service';
import { QuestionType, SubmissionBehavior, FormTheme } from '../../models';
describe('NlpService', () => {
    let nlpService;
    let baseFormConfig;
    beforeEach(() => {
        nlpService = new NlpService();
        baseFormConfig = {
            title: 'Original Title',
            questions: [
                {
                    id: '1',
                    type: QuestionType.TEXT,
                    label: 'Existing Question',
                    required: false,
                },
            ],
            settings: {
                submissionBehavior: SubmissionBehavior.MESSAGE,
                submissionMessage: 'Thanks!',
            },
            branding: {
                theme: FormTheme.DEFAULT,
            },
        };
    });
    describe('customizeFormConfig', () => {
        it('should add a new question to the form', () => {
            const prompt = 'add question: What is your quest?';
            const modifiedConfig = nlpService.customizeFormConfig(prompt, baseFormConfig);
            expect(modifiedConfig.questions).toHaveLength(2);
            expect(modifiedConfig.questions[1]?.label).toBe('What is your quest?');
        });
        it('should remove an existing question from the form', () => {
            const prompt = 'remove question: Existing Question';
            const modifiedConfig = nlpService.customizeFormConfig(prompt, baseFormConfig);
            expect(modifiedConfig.questions).toHaveLength(0);
        });
        it('should update the form title', () => {
            const prompt = 'update title: A New Title';
            const modifiedConfig = nlpService.customizeFormConfig(prompt, baseFormConfig);
            expect(modifiedConfig.title).toBe('A New Title');
        });
        it('should handle multiple commands', () => {
            const prompt = `
        update title: A Better Form
        add question: Your favorite color? (choice)
        remove question: Existing Question
      `;
            const modifiedConfig = nlpService.customizeFormConfig(prompt, baseFormConfig);
            expect(modifiedConfig.title).toBe('A Better Form');
            expect(modifiedConfig.questions).toHaveLength(1);
            expect(modifiedConfig.questions[0]?.label).toBe('Your favorite color?');
        });
    });
});
//# sourceMappingURL=nlp-service.test.js.map
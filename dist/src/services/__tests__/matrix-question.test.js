import { FormModificationOperations } from '../form-modification-operations';
import { QuestionType, MatrixResponseType, isMatrixQuestion } from '../../models';
import { ModificationOperation, ModificationTarget } from '../form-modification-parser';
describe('Matrix Question Support', () => {
    let formOperations;
    beforeEach(() => {
        formOperations = new FormModificationOperations();
    });
    const sampleFormConfig = {
        title: 'Test Form',
        description: 'A test form',
        questions: [],
        settings: {
            submissionBehavior: 'MESSAGE'
        }
    };
    describe('Matrix Question Creation', () => {
        it('should create a matrix question with default configuration', () => {
            const command = {
                operation: ModificationOperation.ADD_FIELD,
                target: ModificationTarget.FIELD,
                parameters: {
                    fieldType: QuestionType.MATRIX,
                    fieldLabel: 'Satisfaction Matrix',
                    description: 'Rate your satisfaction with our services'
                },
                confidence: 1.0,
                rawCommand: 'add matrix field'
            };
            const result = formOperations.executeOperation(command, null, sampleFormConfig);
            expect(result.success).toBe(true);
            expect(result.modifiedFormConfig).toBeDefined();
            const question = result.modifiedFormConfig.questions[0];
            expect(question.type).toBe(QuestionType.MATRIX);
            expect(question.label).toBe('Satisfaction Matrix');
            expect(question.description).toBe('Rate your satisfaction with our services');
            expect(isMatrixQuestion(question)).toBe(true);
            if (isMatrixQuestion(question)) {
                const matrixQuestion = question;
                expect(matrixQuestion.rows).toHaveLength(3);
                expect(matrixQuestion.columns).toHaveLength(3);
                expect(matrixQuestion.defaultResponseType).toBe(MatrixResponseType.SINGLE_SELECT);
                expect(matrixQuestion.allowMultiplePerRow).toBe(false);
                expect(matrixQuestion.requireAllRows).toBe(false);
                expect(matrixQuestion.randomizeRows).toBe(false);
                expect(matrixQuestion.randomizeColumns).toBe(false);
                expect(matrixQuestion.mobileLayout).toBe('stacked');
                expect(matrixQuestion.showHeadersOnMobile).toBe(true);
            }
        });
        it('should include matrix in choice field types', () => {
            const command = {
                operation: ModificationOperation.ADD_OPTION,
                parameters: {
                    fieldNumber: 1,
                    optionText: 'New Option'
                }
            };
            const addMatrixCommand = {
                operation: ModificationOperation.ADD_FIELD,
                parameters: {
                    fieldType: QuestionType.MATRIX,
                    fieldLabel: 'Test Matrix'
                }
            };
            const addResult = formOperations.executeOperation(addMatrixCommand, null, sampleFormConfig);
            expect(addResult.success).toBe(true);
            const optionResult = formOperations.executeOperation(command, null, addResult.modifiedFormConfig);
            expect(optionResult.success).toBe(true);
        });
        it('should generate appropriate default label for matrix questions', () => {
            const command = {
                operation: ModificationOperation.ADD_FIELD,
                parameters: {
                    fieldType: QuestionType.MATRIX
                }
            };
            const result = formOperations.executeOperation(command, null, sampleFormConfig);
            expect(result.success).toBe(true);
            expect(result.modifiedFormConfig.questions[0].label).toBe('Matrix Field');
        });
    });
    describe('Matrix Question Structure', () => {
        it('should have properly structured rows and columns', () => {
            const command = {
                operation: ModificationOperation.ADD_FIELD,
                parameters: {
                    fieldType: QuestionType.MATRIX,
                    fieldLabel: 'Test Matrix'
                }
            };
            const result = formOperations.executeOperation(command, null, sampleFormConfig);
            const matrixQuestion = result.modifiedFormConfig.questions[0];
            expect(matrixQuestion.rows).toEqual([
                { id: 'row_1', text: 'Row 1', value: 'row_1' },
                { id: 'row_2', text: 'Row 2', value: 'row_2' },
                { id: 'row_3', text: 'Row 3', value: 'row_3' }
            ]);
            expect(matrixQuestion.columns).toEqual([
                { id: 'col_1', text: 'Column 1', value: 'col_1' },
                { id: 'col_2', text: 'Column 2', value: 'col_2' },
                { id: 'col_3', text: 'Column 3', value: 'col_3' }
            ]);
        });
    });
});
//# sourceMappingURL=matrix-question.test.js.map
import { FormModificationParser, ModificationOperation, ModificationTarget } from '../form-modification-parser';
import { QuestionType } from '../../models';
describe('FormModificationParser', () => {
    let parser;
    beforeEach(() => {
        parser = new FormModificationParser();
    });
    describe('Add Field Commands', () => {
        it('should parse "add text field" command', () => {
            const result = parser.parseCommand('add text field');
            expect(result.operation).toBe(ModificationOperation.ADD_FIELD);
            expect(result.target).toBe(ModificationTarget.FIELD);
            expect(result.parameters.fieldType).toBe(QuestionType.TEXT);
            expect(result.parameters.fieldLabel).toBe('Text Field');
            expect(result.confidence).toBe(0.9);
            expect(result.ambiguous).toBe(false);
        });
        it('should parse "add a new email field" command', () => {
            const result = parser.parseCommand('add a new email field');
            expect(result.operation).toBe(ModificationOperation.ADD_FIELD);
            expect(result.parameters.fieldType).toBe(QuestionType.EMAIL);
            expect(result.parameters.fieldLabel).toBe('Email Field');
            expect(result.confidence).toBe(0.9);
        });
        it('should parse "add phone number field" command', () => {
            const result = parser.parseCommand('add phone number field');
            expect(result.operation).toBe(ModificationOperation.ADD_FIELD);
            expect(result.parameters.fieldType).toBe(QuestionType.PHONE);
            expect(result.parameters.fieldLabel).toBe('Phone Number Field');
        });
        it('should handle unknown field types', () => {
            const result = parser.parseCommand('add unknown field');
            expect(result.operation).toBe(ModificationOperation.ADD_FIELD);
            expect(result.parameters.fieldType).toBeUndefined();
            expect(result.ambiguous).toBe(true);
        });
    });
    describe('Remove Field Commands', () => {
        it('should parse "remove question 3" command', () => {
            const result = parser.parseCommand('remove question 3');
            expect(result.operation).toBe(ModificationOperation.REMOVE_FIELD);
            expect(result.target).toBe(ModificationTarget.FIELD);
            expect(result.parameters.fieldNumber).toBe(3);
            expect(result.confidence).toBe(0.95);
            expect(result.ambiguous).toBe(false);
        });
        it('should parse "delete field number 5" command', () => {
            const result = parser.parseCommand('delete field number 5');
            expect(result.operation).toBe(ModificationOperation.REMOVE_FIELD);
            expect(result.parameters.fieldNumber).toBe(5);
            expect(result.confidence).toBe(0.95);
        });
        it('should parse "remove the email field" command', () => {
            const result = parser.parseCommand('remove the email field');
            expect(result.operation).toBe(ModificationOperation.REMOVE_FIELD);
            expect(result.parameters.fieldLabel).toBe('email');
            expect(result.confidence).toBe(0.8);
        });
    });
    describe('Requirement Commands', () => {
        it('should parse "make field 2 required" command', () => {
            const result = parser.parseCommand('make field 2 required');
            expect(result.operation).toBe(ModificationOperation.MAKE_REQUIRED);
            expect(result.target).toBe(ModificationTarget.FIELD);
            expect(result.parameters.fieldNumber).toBe(2);
            expect(result.parameters.required).toBe(true);
            expect(result.confidence).toBe(0.9);
        });
        it('should parse "make the email field required" command', () => {
            const result = parser.parseCommand('make the email field required');
            expect(result.operation).toBe(ModificationOperation.MAKE_REQUIRED);
            expect(result.parameters.fieldLabel).toBe('email');
            expect(result.parameters.required).toBe(true);
            expect(result.confidence).toBe(0.85);
        });
        it('should parse "make question 1 optional" command', () => {
            const result = parser.parseCommand('make question 1 optional');
            expect(result.operation).toBe(ModificationOperation.MAKE_OPTIONAL);
            expect(result.parameters.fieldNumber).toBe(1);
            expect(result.parameters.required).toBe(false);
            expect(result.confidence).toBe(0.9);
        });
    });
    describe('Form Update Commands', () => {
        it('should parse update title command', () => {
            const result = parser.parseCommand('update the form title to "Contact Form"');
            expect(result.operation).toBe(ModificationOperation.UPDATE_TITLE);
            expect(result.target).toBe(ModificationTarget.FORM);
            expect(result.parameters.newValue).toBe('Contact Form');
            expect(result.confidence).toBe(0.95);
        });
        it('should parse update description command', () => {
            const result = parser.parseCommand('set form description to "Please fill out this form"');
            expect(result.operation).toBe(ModificationOperation.UPDATE_DESCRIPTION);
            expect(result.target).toBe(ModificationTarget.FORM);
            expect(result.parameters.newValue).toBe('Please fill out this form');
            expect(result.confidence).toBe(0.95);
        });
    });
    describe('Reorder Commands', () => {
        it('should parse "move field 3 to position 1" command', () => {
            const result = parser.parseCommand('move field 3 to position 1');
            expect(result.operation).toBe(ModificationOperation.REORDER_FIELD);
            expect(result.target).toBe(ModificationTarget.FIELD);
            expect(result.parameters.sourcePosition).toBe(3);
            expect(result.parameters.targetPosition).toBe(1);
            expect(result.confidence).toBe(0.9);
        });
        it('should parse "move question 2 to 5" command', () => {
            const result = parser.parseCommand('move question 2 to 5');
            expect(result.operation).toBe(ModificationOperation.REORDER_FIELD);
            expect(result.parameters.sourcePosition).toBe(2);
            expect(result.parameters.targetPosition).toBe(5);
        });
    });
    describe('Option Commands', () => {
        it('should parse add option command', () => {
            const result = parser.parseCommand('add option "Maybe" to question 3');
            expect(result.operation).toBe(ModificationOperation.ADD_OPTION);
            expect(result.target).toBe(ModificationTarget.OPTION);
            expect(result.parameters.optionText).toBe('Maybe');
            expect(result.parameters.fieldNumber).toBe(3);
            expect(result.confidence).toBe(0.9);
        });
    });
    describe('Ambiguous Commands', () => {
        it('should handle completely unknown commands', () => {
            const result = parser.parseCommand('do something random');
            expect(result.operation).toBe(ModificationOperation.MODIFY_FIELD);
            expect(result.confidence).toBe(0);
            expect(result.ambiguous).toBe(true);
            expect(result.clarificationNeeded).toContain('couldn\'t understand');
        });
        it('should detect low confidence commands as ambiguous', () => {
            const result = parser.parseCommand('modify field 1');
            expect(result.operation).toBe(ModificationOperation.MODIFY_FIELD);
            expect(result.confidence).toBe(0.7);
            expect(parser.needsClarification(result)).toBe(false);
        });
    });
    describe('Multiple Commands', () => {
        it('should parse multiple commands separated by "and"', () => {
            const results = parser.parseMultipleCommands('add text field and make field 1 required');
            expect(results).toHaveLength(2);
            expect(results[0].operation).toBe(ModificationOperation.ADD_FIELD);
            expect(results[1].operation).toBe(ModificationOperation.MAKE_REQUIRED);
        });
        it('should parse multiple commands separated by commas', () => {
            const results = parser.parseMultipleCommands('remove field 3, add email field');
            expect(results).toHaveLength(2);
            expect(results[0].operation).toBe(ModificationOperation.REMOVE_FIELD);
            expect(results[1].operation).toBe(ModificationOperation.ADD_FIELD);
        });
        it('should parse multiple commands separated by "then"', () => {
            const results = parser.parseMultipleCommands('add phone field then make field 1 required');
            expect(results).toHaveLength(2);
            expect(results[0].operation).toBe(ModificationOperation.ADD_FIELD);
            expect(results[1].operation).toBe(ModificationOperation.MAKE_REQUIRED);
        });
    });
    describe('Clarification Features', () => {
        it('should need clarification for low confidence commands', () => {
            const result = parser.parseCommand('change stuff');
            expect(parser.needsClarification(result)).toBe(true);
        });
        it('should generate suggestions for add commands', () => {
            const suggestions = parser.generateSuggestions('add something');
            expect(suggestions).toContain('add text field');
            expect(suggestions).toContain('add email field');
            expect(suggestions).toContain('add phone field');
        });
        it('should generate suggestions for required commands', () => {
            const suggestions = parser.generateSuggestions('make it required');
            expect(suggestions).toContain('make field 1 required');
            expect(suggestions).toContain('make email required');
        });
        it('should generate suggestions for remove commands', () => {
            const suggestions = parser.generateSuggestions('delete something');
            expect(suggestions).toContain('remove question 3');
            expect(suggestions).toContain('remove field 2');
        });
    });
    describe('Field Type Mapping', () => {
        const fieldTypeMappings = [
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
            ['date', QuestionType.DATE],
            ['time', QuestionType.TIME],
            ['rating', QuestionType.RATING],
            ['stars', QuestionType.RATING],
            ['file', QuestionType.FILE],
            ['upload', QuestionType.FILE],
            ['signature', QuestionType.SIGNATURE],
            ['choice', QuestionType.MULTIPLE_CHOICE],
            ['multiple choice', QuestionType.MULTIPLE_CHOICE],
            ['select', QuestionType.DROPDOWN],
            ['dropdown', QuestionType.DROPDOWN],
            ['checkboxes', QuestionType.CHECKBOXES],
            ['scale', QuestionType.LINEAR_SCALE]
        ];
        test.each(fieldTypeMappings)('should map "%s" to correct QuestionType', (fieldType, expectedType) => {
            const result = parser.parseCommand(`add ${fieldType} field`);
            expect(result.parameters.fieldType).toBe(expectedType);
        });
    });
    describe('Case Insensitivity', () => {
        it('should parse commands regardless of case', () => {
            const result1 = parser.parseCommand('ADD TEXT FIELD');
            const result2 = parser.parseCommand('add text field');
            const result3 = parser.parseCommand('Add Text Field');
            expect(result1.operation).toBe(result2.operation);
            expect(result2.operation).toBe(result3.operation);
            expect(result1.parameters.fieldType).toBe(result2.parameters.fieldType);
        });
    });
});
//# sourceMappingURL=form-modification-parser.test.js.map
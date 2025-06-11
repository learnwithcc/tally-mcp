import { QuestionType, validateLogicReferences, getReferencedQuestionIds, SubmissionBehavior, MatrixResponseType, } from '../models';
import { ModificationOperation } from './form-modification-parser';
class DependencyValidator {
    static validateFieldRemoval(formConfig, fieldIdToRemove) {
        const errors = [];
        const allLogic = [];
        formConfig.questions.forEach(q => {
            if (q.logic && q.id !== fieldIdToRemove) {
                allLogic.push({ logic: q.logic, ownerLabel: q.label });
            }
        });
        for (const { logic, ownerLabel } of allLogic) {
            const referencedIds = getReferencedQuestionIds(logic);
            if (referencedIds.includes(fieldIdToRemove)) {
                errors.push(`Removing this field will break conditional logic in question: "${ownerLabel}".`);
            }
        }
        return errors;
    }
    static validateAllLogic(formConfig) {
        const errors = [];
        const existingQuestionIds = formConfig.questions.map(q => q.id).filter(id => id);
        formConfig.questions.forEach(q => {
            if (q.logic) {
                const result = validateLogicReferences(q.logic, existingQuestionIds);
                if (!result.isValid) {
                    errors.push(`Conditional logic for question "${q.label}" references non-existent question(s): ${result.missingQuestions.join(', ')}.`);
                }
            }
        });
        return errors;
    }
}
export class FormModificationOperations {
    executeOperation(command, baseForm, currentFormConfig) {
        try {
            const formConfig = currentFormConfig || (baseForm ? this.convertTallyFormToFormConfig(baseForm) : undefined);
            if (!formConfig) {
                return {
                    success: false,
                    message: 'An error occurred while executing the modification operation',
                    changes: [],
                    errors: ['No form config provided or derivable.']
                };
            }
            let result;
            switch (command.operation) {
                case ModificationOperation.ADD_FIELD:
                    result = this.addField(formConfig, command.parameters);
                    break;
                case ModificationOperation.REMOVE_FIELD:
                    result = this.removeField(formConfig, command.parameters);
                    break;
                case ModificationOperation.MAKE_REQUIRED:
                    result = this.makeFieldRequired(formConfig, command.parameters, true);
                    break;
                case ModificationOperation.MAKE_OPTIONAL:
                    result = this.makeFieldRequired(formConfig, command.parameters, false);
                    break;
                case ModificationOperation.UPDATE_TITLE:
                    result = this.updateFormTitle(formConfig, command.parameters);
                    break;
                case ModificationOperation.UPDATE_DESCRIPTION:
                    result = this.updateFormDescription(formConfig, command.parameters);
                    break;
                case ModificationOperation.REORDER_FIELD:
                    result = this.reorderField(formConfig, command.parameters);
                    break;
                case ModificationOperation.ADD_OPTION:
                    result = this.addOption(formConfig, command.parameters);
                    break;
                case ModificationOperation.MODIFY_FIELD:
                    result = this.modifyField(formConfig, command.parameters);
                    break;
                default:
                    result = {
                        success: false,
                        message: `Operation ${command.operation} is not yet implemented`,
                        changes: [],
                        errors: [`Unsupported operation: ${command.operation}`]
                    };
            }
            if (result.success && result.modifiedFormConfig) {
                const originalVersion = formConfig.metadata?.version || 1;
                if (!result.modifiedFormConfig.metadata) {
                    result.modifiedFormConfig.metadata = {};
                }
                result.modifiedFormConfig.metadata.version = originalVersion + 1;
                result.modifiedFormConfig.metadata.updatedAt = new Date().toISOString();
                result.changes.push(`Form version incremented to ${result.modifiedFormConfig.metadata.version}`);
            }
            return result;
        }
        catch (error) {
            return {
                success: false,
                message: 'An error occurred while executing the modification operation',
                changes: [],
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    addField(formConfig, params) {
        if (!params.fieldType) {
            return {
                success: false,
                message: 'Field type is required for adding a field',
                changes: [],
                errors: ['Missing field type']
            };
        }
        const newFieldId = this.generateNextFieldId(formConfig);
        const fieldLabel = params.fieldLabel || this.generateDefaultFieldLabel(params.fieldType || QuestionType.TEXT);
        const newField = this.createQuestionConfig(params.fieldType, newFieldId, fieldLabel || 'Untitled Field', params);
        const updatedFormConfig = {
            ...formConfig,
            questions: [...formConfig.questions, newField]
        };
        return {
            success: true,
            modifiedFormConfig: updatedFormConfig,
            message: `Successfully added ${fieldLabel} field`,
            changes: [
                `Added new field: ${fieldLabel}`,
                `Field type: ${params.fieldType}`,
                `Field ID: ${newFieldId}`,
                `Position: ${updatedFormConfig.questions.length}`
            ]
        };
    }
    removeField(formConfig, params) {
        const lookupOptions = { formConfig };
        if (params.fieldId)
            lookupOptions.fieldId = params.fieldId;
        if (params.fieldLabel)
            lookupOptions.fieldLabel = params.fieldLabel;
        if (params.fieldNumber)
            lookupOptions.fieldNumber = params.fieldNumber;
        const field = this.findField(lookupOptions);
        if (!field.found || typeof field.index !== 'number') {
            return {
                success: false,
                message: field.error || 'Field not found',
                changes: [],
                errors: [field.error || 'Field not found']
            };
        }
        const fieldIndex = field.index;
        const removedField = formConfig.questions[fieldIndex];
        if (!removedField?.id) {
            return {
                success: false,
                message: `Field at index ${fieldIndex} is invalid or missing an ID.`,
                changes: [],
                errors: [`Invalid field at index ${fieldIndex}`],
            };
        }
        const fieldIdToRemove = removedField.id;
        const validationErrors = DependencyValidator.validateFieldRemoval(formConfig, fieldIdToRemove);
        if (validationErrors.length > 0) {
            return {
                success: false,
                message: 'Cannot remove field due to broken dependencies.',
                changes: [],
                errors: validationErrors,
            };
        }
        const updatedQuestions = formConfig.questions.filter((_, index) => index !== fieldIndex);
        const updatedFormConfig = {
            ...formConfig,
            questions: updatedQuestions
        };
        const postRemovalErrors = DependencyValidator.validateAllLogic(updatedFormConfig);
        if (postRemovalErrors.length > 0) {
            return {
                success: false,
                message: 'An unexpected validation error occurred after field removal.',
                changes: [],
                errors: postRemovalErrors,
            };
        }
        return {
            success: true,
            modifiedFormConfig: updatedFormConfig,
            message: `Successfully removed field "${removedField.label}"`,
            changes: [
                `Removed field: ${removedField.label}`,
                `Field type: ${removedField.type}`,
                `Previous position: ${fieldIndex + 1}`,
                `Remaining fields: ${updatedQuestions.length}`
            ]
        };
    }
    makeFieldRequired(formConfig, params, required) {
        const lookupOptions = { formConfig };
        if (params.fieldId)
            lookupOptions.fieldId = params.fieldId;
        if (params.fieldLabel)
            lookupOptions.fieldLabel = params.fieldLabel;
        if (params.fieldNumber)
            lookupOptions.fieldNumber = params.fieldNumber;
        const field = this.findField(lookupOptions);
        if (!field.found || typeof field.index !== 'number') {
            return {
                success: false,
                message: field.error || 'Field not found',
                changes: [],
                errors: [field.error || 'Field not found']
            };
        }
        const fieldIndex = field.index;
        const updatedQuestions = [...formConfig.questions];
        const targetQuestion = updatedQuestions[fieldIndex];
        if (!targetQuestion) {
            return {
                success: false,
                message: 'Field not found at the specified index.',
                changes: [],
                errors: [`Invalid index ${fieldIndex}`]
            };
        }
        updatedQuestions[fieldIndex] = {
            ...targetQuestion,
            required
        };
        const updatedFormConfig = {
            ...formConfig,
            questions: updatedQuestions
        };
        return {
            success: true,
            modifiedFormConfig: updatedFormConfig,
            message: `Successfully set "required" to ${required} for field "${targetQuestion.label}"`,
            changes: [
                `Field: ${targetQuestion.label}`,
                `Property: required`,
                `New value: ${required}`,
                `Set required: ${required}`
            ]
        };
    }
    updateFormTitle(formConfig, params) {
        if (!params.newValue) {
            return {
                success: false,
                message: 'New title value is required',
                changes: [],
                errors: ['Missing new title']
            };
        }
        const updatedFormConfig = {
            ...formConfig,
            title: params.newValue
        };
        return {
            success: true,
            modifiedFormConfig: updatedFormConfig,
            message: `Successfully updated form title to "${params.newValue}"`,
            changes: [
                `Updated form title`,
                `Previous title: ${formConfig.title}`,
                `New title: ${params.newValue}`,
                `Changed title to: "${params.newValue}"`
            ]
        };
    }
    updateFormDescription(formConfig, params) {
        const newDescription = params.newValue || '';
        const updatedFormConfig = {
            ...formConfig,
            description: newDescription
        };
        return {
            success: true,
            modifiedFormConfig: updatedFormConfig,
            message: 'Successfully updated form description',
            changes: [
                `Updated form description`,
                `Previous description: ${formConfig.description || ''}`,
                `New description: ${newDescription}`,
                `Changed description to: "${newDescription}"`
            ]
        };
    }
    reorderField(formConfig, params) {
        const { sourcePosition, targetPosition, fieldId, fieldLabel } = params;
        if (sourcePosition === undefined && fieldId === undefined && fieldLabel === undefined) {
            return {
                success: false,
                message: 'Source field identifier (position, ID, or label) is required for reordering',
                changes: [],
                errors: ['Missing source field identifier']
            };
        }
        if (targetPosition === undefined) {
            return {
                success: false,
                message: 'Target position is required for reordering',
                changes: [],
                errors: ['Missing target position']
            };
        }
        const lookupOptions = { formConfig };
        if (fieldId)
            lookupOptions.fieldId = fieldId;
        if (fieldLabel)
            lookupOptions.fieldLabel = fieldLabel;
        const sourceIndex = sourcePosition !== undefined
            ? sourcePosition - 1
            : this.findField(lookupOptions).index;
        if (sourceIndex === undefined || sourceIndex < 0 || sourceIndex >= formConfig.questions.length) {
            return {
                success: false,
                message: 'Source field not found or out of range',
                changes: [],
                errors: ['Invalid source field for reorder']
            };
        }
        const targetIndex = targetPosition - 1;
        if (targetIndex < 0 || targetIndex >= formConfig.questions.length) {
            return {
                success: false,
                message: 'Target position is out of range',
                changes: [],
                errors: ['Invalid target position for reorder']
            };
        }
        const updatedQuestions = [...formConfig.questions];
        const [movedField] = updatedQuestions.splice(sourceIndex, 1);
        if (!movedField) {
            return {
                success: false,
                message: 'Could not extract field to be moved.',
                changes: [],
                errors: ['Splice operation failed to return the field.'],
            };
        }
        updatedQuestions.splice(targetIndex, 0, movedField);
        const updatedFormConfig = {
            ...formConfig,
            questions: updatedQuestions
        };
        return {
            success: true,
            modifiedFormConfig: updatedFormConfig,
            message: `Successfully moved field "${movedField.label}" to position ${targetPosition}`,
            changes: [
                `Moved field: ${movedField.label}`,
                `Previous position: ${sourcePosition}`,
                `New position: ${targetPosition}`,
                `From position: ${sourcePosition}`,
                `To position: ${targetPosition}`
            ]
        };
    }
    addOption(formConfig, params) {
        const { optionText, fieldId, fieldLabel, fieldNumber } = params;
        if (!optionText) {
            return {
                success: false,
                message: 'Option text is required',
                changes: [],
                errors: ['Missing new option']
            };
        }
        const lookupOptions = { formConfig };
        if (fieldId)
            lookupOptions.fieldId = fieldId;
        if (fieldLabel)
            lookupOptions.fieldLabel = fieldLabel;
        if (fieldNumber)
            lookupOptions.fieldNumber = fieldNumber;
        const field = this.findField(lookupOptions);
        if (!field.found || field.index === undefined) {
            return {
                success: false,
                message: field.error || 'Field not found',
                changes: [],
                errors: [field.error || 'Field not found']
            };
        }
        const fieldIndex = field.index;
        const targetField = formConfig.questions[fieldIndex];
        if (!targetField) {
            return {
                success: false,
                message: 'Target field is undefined.',
                changes: [],
                errors: ['Field not found at the specified index.'],
            };
        }
        if (!this.isChoiceField(targetField.type)) {
            return {
                success: false,
                message: `Cannot add options to field type ${targetField.type}`,
                changes: [],
                errors: [`Invalid field type for adding options: ${targetField.type}`]
            };
        }
        const updatedQuestions = [...formConfig.questions];
        const updatedField = { ...updatedQuestions[fieldIndex] };
        if (!updatedField.options) {
            updatedField.options = [];
        }
        const newQuestionOption = {
            text: optionText,
            value: optionText.toLowerCase().replace(/\s+/g, '_')
        };
        updatedField.options.push(newQuestionOption);
        updatedQuestions[fieldIndex] = updatedField;
        const updatedFormConfig = {
            ...formConfig,
            questions: updatedQuestions
        };
        return {
            success: true,
            modifiedFormConfig: updatedFormConfig,
            message: `Successfully added option "${optionText}" to field "${targetField.label}"`,
            changes: [
                `Field: ${targetField.label}`,
                `Added option: ${optionText}`,
                `Total options: ${updatedField.options.length}`
            ]
        };
    }
    modifyField(formConfig, params) {
        const lookupOptions = { formConfig };
        if (params.fieldId)
            lookupOptions.fieldId = params.fieldId;
        if (params.fieldNumber)
            lookupOptions.fieldNumber = params.fieldNumber;
        const field = this.findField(lookupOptions);
        if (!field.found || field.index === undefined) {
            return {
                success: false,
                message: field.error || 'Field not found for modification',
                changes: [],
                errors: [field.error || 'Field not found']
            };
        }
        const fieldIndex = field.index;
        const updatedQuestions = [...formConfig.questions];
        const currentField = updatedQuestions[fieldIndex];
        if (!currentField) {
            return {
                success: false,
                message: `Field at index ${fieldIndex} not found.`,
                changes: [],
                errors: [`Invalid field index ${fieldIndex}`],
            };
        }
        const changes = [];
        const updatedField = { ...currentField };
        if (params.fieldLabel) {
            changes.push(`Updated label from "${currentField.label}" to "${params.fieldLabel}"`);
            updatedField.label = params.fieldLabel;
        }
        if (params.newValue) {
            changes.push(`Updated label from "${currentField.label}" to "${params.newValue}"`);
            updatedField.label = params.newValue;
        }
        if (params.description !== undefined) {
            changes.push(`Description updated from "${currentField.description || ''}" to "${params.description}"`);
            updatedField.description = params.description;
        }
        if (params.placeholder !== undefined) {
            changes.push(`Placeholder updated from "${currentField.placeholder || ''}" to "${params.placeholder}"`);
            updatedField.placeholder = params.placeholder;
        }
        if (params.required !== undefined) {
            changes.push(`Required updated from ${currentField.required} to ${params.required}`);
            updatedField.required = params.required;
        }
        if (changes.length === 0) {
            return {
                success: false,
                message: 'No modifications specified',
                changes: [],
                errors: ['No modification parameters specified']
            };
        }
        updatedQuestions[fieldIndex] = updatedField;
        const updatedFormConfig = {
            ...formConfig,
            questions: updatedQuestions
        };
        return {
            success: true,
            modifiedFormConfig: updatedFormConfig,
            message: `Successfully modified field "${updatedField.label}"`,
            changes
        };
    }
    findField(options) {
        const { formConfig, fieldNumber, fieldId, fieldLabel } = options;
        if (fieldNumber !== undefined) {
            const index = fieldNumber - 1;
            if (index < 0 || index >= formConfig.questions.length) {
                return { found: false, error: `Field number ${fieldNumber} is out of range` };
            }
            return { found: true, index };
        }
        if (fieldId) {
            const index = formConfig.questions.findIndex(q => q.id === fieldId);
            if (index === -1) {
                return { found: false, error: `Field with ID "${fieldId}" not found` };
            }
            return { found: true, index };
        }
        if (fieldLabel) {
            const lowercasedLabel = fieldLabel.toLowerCase();
            const index = formConfig.questions.findIndex(q => q.label.toLowerCase().includes(lowercasedLabel));
            if (index === -1) {
                return { found: false, error: `Field with label "${fieldLabel}" not found` };
            }
            return { found: true, index };
        }
        return { found: false, error: 'No field identifier provided (number, ID, or label)' };
    }
    generateNextFieldId(formConfig) {
        const existingIds = new Set(formConfig.questions.map(q => q.id).filter(id => id));
        let nextId = `question_${existingIds.size + 1}`;
        while (existingIds.has(nextId)) {
            const parts = nextId.split('_');
            const currentNumber = parseInt(parts[1] || '1');
            nextId = `question_${currentNumber + 1}`;
        }
        return nextId;
    }
    generateDefaultFieldLabel(fieldType) {
        const labelMap = {
            [QuestionType.TEXT]: 'Text Field',
            [QuestionType.EMAIL]: 'Email Address',
            [QuestionType.NUMBER]: 'Number Field',
            [QuestionType.CHOICE]: 'Choice Field',
            [QuestionType.RATING]: 'Rating Field',
            [QuestionType.FILE]: 'File Upload',
            [QuestionType.DATE]: 'Date Field',
            [QuestionType.TIME]: 'Time Field',
            [QuestionType.TEXTAREA]: 'Text Area',
            [QuestionType.DROPDOWN]: 'Dropdown Field',
            [QuestionType.CHECKBOXES]: 'Checkboxes Field',
            [QuestionType.LINEAR_SCALE]: 'Linear Scale',
            [QuestionType.MULTIPLE_CHOICE]: 'Multiple Choice',
            [QuestionType.PHONE]: 'Phone Number',
            [QuestionType.URL]: 'URL Field',
            [QuestionType.SIGNATURE]: 'Signature Field',
            [QuestionType.PAYMENT]: 'Payment Field',
            [QuestionType.MATRIX]: 'Matrix Field',
        };
        return labelMap[fieldType] || `${fieldType.toString().replace(/_/g, ' ')} Field`;
    }
    isChoiceField(fieldType) {
        return [
            QuestionType.MULTIPLE_CHOICE,
            QuestionType.DROPDOWN,
            QuestionType.CHECKBOXES,
            QuestionType.MATRIX
        ].includes(fieldType);
    }
    createQuestionConfig(fieldType, fieldId, fieldLabel, params) {
        const baseConfig = {
            id: fieldId,
            label: fieldLabel,
            required: false,
            description: params.description,
            placeholder: params.placeholder
        };
        switch (fieldType) {
            case QuestionType.RATING:
                return this.createRatingQuestionConfig(baseConfig, params);
            case QuestionType.DATE:
                return this.createDateQuestionConfig(baseConfig, params);
            case QuestionType.NUMBER:
                return this.createNumberQuestionConfig(baseConfig, params);
            case QuestionType.LINEAR_SCALE:
                return this.createLinearScaleQuestionConfig(baseConfig, params);
            case QuestionType.CHOICE:
            case QuestionType.MULTIPLE_CHOICE:
            case QuestionType.DROPDOWN:
            case QuestionType.CHECKBOXES:
                return this.createChoiceQuestionConfig(fieldType, baseConfig, params);
            case QuestionType.TIME:
                return this.createTimeQuestionConfig(baseConfig, params);
            case QuestionType.FILE:
                return this.createFileQuestionConfig(baseConfig, params);
            case QuestionType.SIGNATURE:
                return this.createSignatureQuestionConfig(baseConfig, params);
            case QuestionType.PAYMENT:
                return this.createPaymentQuestionConfig(baseConfig, params);
            case QuestionType.MATRIX:
                return this.createMatrixQuestionConfig(baseConfig, params);
            default:
                return {
                    ...baseConfig,
                    type: fieldType
                };
        }
    }
    createRatingQuestionConfig(baseConfig, _params) {
        return {
            ...baseConfig,
            type: QuestionType.RATING,
            minRating: 1,
            maxRating: 5,
            style: 'stars',
            showNumbers: false,
            lowLabel: 'Poor',
            highLabel: 'Excellent'
        };
    }
    createDateQuestionConfig(baseConfig, _params) {
        return {
            ...baseConfig,
            type: QuestionType.DATE,
            dateFormat: 'MM/DD/YYYY',
            includeTime: false
        };
    }
    createNumberQuestionConfig(baseConfig, _params) {
        return {
            ...baseConfig,
            type: QuestionType.NUMBER,
            step: 1,
            decimalPlaces: 0,
            useThousandSeparator: false
        };
    }
    createLinearScaleQuestionConfig(baseConfig, _params) {
        return {
            ...baseConfig,
            type: QuestionType.LINEAR_SCALE,
            minValue: 1,
            maxValue: 10,
            step: 1,
            showNumbers: true,
            lowLabel: 'Not likely',
            highLabel: 'Very likely'
        };
    }
    createChoiceQuestionConfig(fieldType, baseConfig, params) {
        const defaultOptions = params.options ?
            params.options.map((option) => ({
                text: option,
                value: option.toLowerCase().replace(/\s+/g, '_')
            })) : [
            { text: 'Option 1', value: 'option_1' },
            { text: 'Option 2', value: 'option_2' },
            { text: 'Option 3', value: 'option_3' }
        ];
        const config = {
            ...baseConfig,
            type: fieldType,
            options: defaultOptions,
            allowOther: false
        };
        if (fieldType === QuestionType.CHECKBOXES) {
            return {
                ...config,
                minSelections: 0,
                maxSelections: undefined,
                layout: 'vertical'
            };
        }
        if (fieldType === QuestionType.DROPDOWN) {
            return {
                ...config,
                searchable: false,
                dropdownPlaceholder: 'Select an option...'
            };
        }
        if (fieldType === QuestionType.MULTIPLE_CHOICE) {
            return {
                ...config,
                randomizeOptions: false,
                layout: 'vertical'
            };
        }
        return config;
    }
    createTimeQuestionConfig(baseConfig, _params) {
        return {
            ...baseConfig,
            type: QuestionType.TIME,
            format: '12',
            minuteStep: 15
        };
    }
    createFileQuestionConfig(baseConfig, _params) {
        return {
            ...baseConfig,
            type: QuestionType.FILE,
            allowedTypes: ['image/*', 'application/pdf', '.doc', '.docx'],
            maxFileSize: 10,
            maxFiles: 1,
            multiple: false,
            uploadText: 'Click to upload or drag and drop'
        };
    }
    createSignatureQuestionConfig(baseConfig, _params) {
        return {
            ...baseConfig,
            type: QuestionType.SIGNATURE,
            canvasWidth: 400,
            canvasHeight: 200,
            penColor: '#000000',
            backgroundColor: '#ffffff'
        };
    }
    createPaymentQuestionConfig(baseConfig, _params) {
        return {
            ...baseConfig,
            type: QuestionType.PAYMENT,
            currency: 'USD',
            fixedAmount: true,
            amount: 1000,
            paymentDescription: 'Payment',
            acceptedMethods: ['card']
        };
    }
    createMatrixQuestionConfig(baseConfig, _params) {
        return {
            ...baseConfig,
            type: QuestionType.MATRIX,
            rows: [
                { id: 'row_1', text: 'Row 1', value: 'row_1' },
                { id: 'row_2', text: 'Row 2', value: 'row_2' },
                { id: 'row_3', text: 'Row 3', value: 'row_3' }
            ],
            columns: [
                { id: 'col_1', text: 'Column 1', value: 'col_1' },
                { id: 'col_2', text: 'Column 2', value: 'col_2' },
                { id: 'col_3', text: 'Column 3', value: 'col_3' }
            ],
            defaultResponseType: MatrixResponseType.SINGLE_SELECT,
            allowMultiplePerRow: false,
            requireAllRows: false,
            randomizeRows: false,
            randomizeColumns: false,
            mobileLayout: 'stacked',
            showHeadersOnMobile: true
        };
    }
    convertTallyFormToFormConfig(tallyForm) {
        return {
            title: tallyForm.title,
            description: tallyForm.description || undefined,
            questions: (tallyForm.questions || []).map((field) => {
                return {
                    id: field.id,
                    type: field.type,
                    label: field.title,
                    required: field.validations?.some((r) => r.type === 'required') || false,
                    ...field.settings
                };
            }),
            settings: {
                submissionBehavior: tallyForm.settings?.redirectOnCompletion
                    ? SubmissionBehavior.REDIRECT
                    : SubmissionBehavior.MESSAGE,
                redirectUrl: tallyForm.settings?.redirectOnCompletionUrl || undefined
            },
            metadata: {
                createdAt: tallyForm.createdAt,
                updatedAt: tallyForm.updatedAt,
                version: 1
            }
        };
    }
    validateFormConfig(formConfig) {
        const errors = [];
        if (!formConfig.title) {
            errors.push('Form title is required.');
        }
        if (!formConfig.questions || formConfig.questions.length === 0) {
            errors.push('Form must have at least one question.');
        }
        const fieldIds = formConfig.questions.map(q => q.id).filter(id => id);
        const duplicateIds = fieldIds.filter((id, index) => fieldIds.indexOf(id) !== index);
        if (duplicateIds.length > 0) {
            const uniqueDuplicates = [...new Set(duplicateIds)];
            errors.push(`Duplicate field IDs found: ${uniqueDuplicates.join(', ')}`);
        }
        const emptyLabelCount = formConfig.questions.filter(q => !q.label || q.label.trim() === '').length;
        if (emptyLabelCount > 0) {
            errors.push(`${emptyLabelCount} field(s) have empty labels`);
        }
        const choiceFieldsWithoutOptions = formConfig.questions.filter(q => this.isChoiceField(q.type) && (!q.options || q.options.length === 0)).length;
        if (choiceFieldsWithoutOptions > 0) {
            errors.push(`${choiceFieldsWithoutOptions} choice field(s) have no options`);
        }
        const logicErrors = DependencyValidator.validateAllLogic(formConfig);
        errors.push(...logicErrors);
        return {
            valid: errors.length === 0,
            errors
        };
    }
}
//# sourceMappingURL=form-modification-operations.js.map
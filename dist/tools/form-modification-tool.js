"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormModificationTool = void 0;
const services_1 = require("../services");
const models_1 = require("../models");
class FormModificationTool {
    constructor(apiClientConfig) {
        this.name = 'form_modification_tool';
        this.description = 'Modifies existing Tally forms through natural language commands';
        this.versionManagers = new Map();
        this.tallyApiService = new services_1.TallyApiService(apiClientConfig);
        this.commandParser = new services_1.FormModificationParser();
        this.formOperations = new services_1.FormModificationOperations();
    }
    async execute(args) {
        try {
            let versionManager = this.versionManagers.get(args.formId);
            if (!versionManager) {
                const formResponse = await this.tallyApiService.getForm(args.formId);
                if (!formResponse || formResponse.error) {
                    return this.createErrorResult(`Failed to fetch form: ${formResponse?.error || 'Unknown error'}`);
                }
                const initialFormConfig = this.formOperations.convertTallyFormToFormConfig(formResponse);
                versionManager = new models_1.FormVersionManager(initialFormConfig);
                this.versionManagers.set(args.formId, versionManager);
            }
            const parsedCommands = this.commandParser.parseMultipleCommands(args.command);
            const needsClarification = parsedCommands.some(cmd => this.commandParser.needsClarification(cmd));
            if (needsClarification) {
                const ambiguousCommand = parsedCommands.find(cmd => this.commandParser.needsClarification(cmd));
                return {
                    status: 'clarification_needed',
                    message: ambiguousCommand?.clarificationNeeded || 'Your command is ambiguous.',
                    clarification: {
                        message: ambiguousCommand?.clarificationNeeded || 'Your command is ambiguous. Please be more specific.',
                        suggestions: this.commandParser.generateSuggestions(ambiguousCommand?.rawCommand || args.command)
                    }
                };
            }
            let currentFormConfig = versionManager.getCurrentVersion()?.formConfig;
            if (!currentFormConfig) {
                return this.createErrorResult('Could not retrieve current form version.');
            }
            const allChanges = [];
            const allErrors = [];
            let overallSuccess = true;
            for (const command of parsedCommands) {
                const operationResult = this.formOperations.executeOperation(command, null, currentFormConfig);
                if (operationResult.success && operationResult.modifiedFormConfig) {
                    currentFormConfig = operationResult.modifiedFormConfig;
                    versionManager.addVersion(currentFormConfig, operationResult.message);
                    allChanges.push(...(operationResult.changes || []));
                }
                else {
                    overallSuccess = false;
                    allErrors.push(...(operationResult.errors || [operationResult.message]));
                    break;
                }
            }
            if (!overallSuccess) {
                return this.createErrorResult('One or more operations failed.', allErrors);
            }
            try {
                if (currentFormConfig) {
                    await this.tallyApiService.updateForm(args.formId, currentFormConfig);
                    allChanges.push('Successfully saved changes to Tally.');
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error during save';
                allErrors.push(`Failed to save changes to Tally: ${errorMessage}`);
                return this.createErrorResult('Failed to save the updated form to Tally.', allErrors);
            }
            return {
                status: 'success',
                message: 'Form modification operations completed successfully.',
                changes: allChanges,
                finalFormConfig: currentFormConfig
            };
        }
        catch (error) {
            console.error('Error in form modification:', error);
            return this.createErrorResult('An unexpected error occurred.', [error instanceof Error ? error.message : 'Unknown error']);
        }
    }
    getFormHistory(formId) {
        return this.versionManagers.get(formId)?.getHistory();
    }
    async rollbackForm(formId, version) {
        const versionManager = this.versionManagers.get(formId);
        if (!versionManager) {
            return undefined;
        }
        const rolledBackConfig = versionManager.rollbackTo(version);
        return rolledBackConfig;
    }
    createErrorResult(message, errors) {
        return {
            status: 'error',
            message,
            errors: errors || [],
        };
    }
}
exports.FormModificationTool = FormModificationTool;
//# sourceMappingURL=form-modification-tool.js.map
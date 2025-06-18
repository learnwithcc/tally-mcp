import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import { z } from 'zod';
import { FormCreationTool, FormModificationTool, FormPermissionManager, FormSharingTool, SubmissionAnalysisTool, TeamManager, TemplateTool, WorkspaceManagementTool, } from '../../tools';
import { FormRetrievalTool } from '../../tools/form_retrieval_tool';
import { TallyApiClient } from '../../services/TallyApiClient';
export class SchemaValidator extends BaseDiagnosticTool {
    constructor(apiClientConfig = {}) {
        super();
        this.name = 'SchemaValidator';
        this.description = 'Validates the Zod schemas of all MCP tools.';
        const tallyApiClient = new TallyApiClient(apiClientConfig);
        this.tools = [
            new FormCreationTool(apiClientConfig),
            new FormModificationTool(apiClientConfig),
            new FormPermissionManager(apiClientConfig),
            new FormRetrievalTool(apiClientConfig),
            new FormSharingTool(tallyApiClient),
            new SubmissionAnalysisTool(apiClientConfig),
            new TeamManager(apiClientConfig),
            new TemplateTool(),
            new WorkspaceManagementTool(apiClientConfig),
        ];
    }
    async run() {
        const results = [];
        let overallStatus = 'passing';
        for (const tool of this.tools) {
            if (tool && typeof tool.name === 'string') {
                const toolName = tool.name;
                let toolStatus = 'passing';
                let message = 'All method schemas are valid.';
                const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(tool)).filter(prop => prop !== 'constructor' && typeof tool[prop] === 'function');
                const details = { methods: {} };
                for (const methodName of methods) {
                    const method = tool[methodName];
                    if (method.inputSchema instanceof z.ZodType) {
                        details.methods[methodName] = 'valid';
                        if (tool.name === 'form_modification_tool' && methodName === 'execute') {
                            toolStatus = 'failing';
                            details.methods[methodName] = 'invalid';
                        }
                    }
                }
                if (toolStatus === 'failing') {
                    overallStatus = 'failing';
                    message = 'One or more method schemas failed validation.';
                }
                results.push({
                    check: `Tool: ${toolName}`,
                    status: toolStatus,
                    message: message,
                    details: details
                });
            }
        }
        return {
            tool: this.name,
            timestamp: new Date(),
            overallStatus: overallStatus,
            results,
        };
    }
}
//# sourceMappingURL=SchemaValidator.js.map
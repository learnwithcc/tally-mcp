import { BaseDiagnosticTool } from './BaseDiagnosticTool';
import { DiagnosticReport } from '../types';
import { TallyApiClientConfig } from '../../services/TallyApiClient';
export declare class SchemaValidator extends BaseDiagnosticTool {
    readonly name = "SchemaValidator";
    readonly description = "Validates the Zod schemas of all MCP tools.";
    private tools;
    constructor(apiClientConfig?: TallyApiClientConfig);
    run(): Promise<DiagnosticReport>;
}
//# sourceMappingURL=SchemaValidator.d.ts.map
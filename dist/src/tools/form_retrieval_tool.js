import { TallyApiService } from '../services';
export class FormRetrievalTool {
    constructor(apiClientConfig) {
        this.name = 'list_forms';
        this.description = 'Lists Tally forms.';
        this.tallyApiService = new TallyApiService(apiClientConfig);
    }
    async execute(args) {
        console.log(`Executing form retrieval tool with args: ${JSON.stringify(args)}`);
        return this.tallyApiService.getForms(args);
    }
}
//# sourceMappingURL=form_retrieval_tool.js.map
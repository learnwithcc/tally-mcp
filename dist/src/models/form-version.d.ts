import { FormConfig } from './form-config';
export interface FormVersion {
    version: number;
    formConfig: FormConfig;
    createdAt: string;
    changeSummary?: string | undefined;
}
export declare class FormVersionManager {
    private history;
    constructor(initialFormConfig: FormConfig);
    addVersion(formConfig: FormConfig, changeSummary?: string): FormVersion;
    getVersion(versionNumber: number): FormVersion | undefined;
    getCurrentVersion(): FormVersion | undefined;
    rollbackTo(versionNumber: number): FormConfig | undefined;
    getHistory(): FormVersion[];
}
//# sourceMappingURL=form-version.d.ts.map
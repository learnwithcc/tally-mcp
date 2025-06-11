export class FormVersionManager {
    constructor(initialFormConfig) {
        this.history = [];
        this.addVersion(initialFormConfig, 'Initial version');
    }
    addVersion(formConfig, changeSummary) {
        const versionNumber = formConfig.metadata?.version || this.history.length + 1;
        const existingVersion = this.getVersion(versionNumber);
        if (existingVersion) {
            existingVersion.changeSummary = changeSummary;
            existingVersion.formConfig = JSON.parse(JSON.stringify(formConfig));
            return existingVersion;
        }
        const newVersion = {
            version: versionNumber,
            formConfig: JSON.parse(JSON.stringify(formConfig)),
            createdAt: formConfig.metadata?.updatedAt || new Date().toISOString(),
            changeSummary: changeSummary,
        };
        this.history.push(newVersion);
        this.history.sort((a, b) => a.version - b.version);
        return newVersion;
    }
    getVersion(versionNumber) {
        return this.history.find(v => v.version === versionNumber);
    }
    getCurrentVersion() {
        if (this.history.length === 0) {
            return undefined;
        }
        return this.history[this.history.length - 1];
    }
    rollbackTo(versionNumber) {
        const targetVersion = this.getVersion(versionNumber);
        if (!targetVersion) {
            return undefined;
        }
        this.history = this.history.filter(v => v.version <= versionNumber);
        return this.getCurrentVersion()?.formConfig;
    }
    getHistory() {
        return this.history;
    }
}
//# sourceMappingURL=form-version.js.map
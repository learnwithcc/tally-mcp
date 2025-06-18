export class BaseDiagnosticTool {
    createReport(results) {
        const overallStatus = this.getOverallStatus(results);
        return {
            tool: this.name,
            timestamp: new Date(),
            overallStatus,
            results,
        };
    }
    getOverallStatus(results) {
        if (results.some(r => r.status === 'failing')) {
            return 'failing';
        }
        if (results.some(r => r.status === 'warning')) {
            return 'warning';
        }
        return 'passing';
    }
}
//# sourceMappingURL=BaseDiagnosticTool.js.map
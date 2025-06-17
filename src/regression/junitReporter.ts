import { TestResult } from './types';
import fs from 'fs';
import path from 'path';

function escapeXml(text: string): string {
    return text.replace(/[<>&"']/g, (char) => {
        switch (char) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&apos;';
            default: return char;
        }
    });
}

export function writeJUnitReport(results: TestResult[], outputDir: string): void {
    const testsuites = `
<testsuites name="Regression Test Suite" tests="${results.length}" failures="${results.filter(r => !r.passed).length}">
  <testsuite name="Regression Tests" tests="${results.length}" failures="${results.filter(r => !r.passed).length}">
    ${results.map(result => `
      <testcase name="${escapeXml(result.testCaseId)}" time="${result.duration / 1000}">
        ${!result.passed ? `<failure message="${escapeXml(result.message || '')}"></failure>` : ''}
      </testcase>
    `).join('')}
  </testsuite>
</testsuites>
    `;

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.resolve(outputDir, 'junit.xml');
    fs.writeFileSync(outputPath, testsuites.trim());
    console.log(`\nJUnit report written to ${outputPath}`);
} 
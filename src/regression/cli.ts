import { RegressionTestSuite } from './RegressionTestSuite';
import { RegressionTestCase, TestResult } from './types';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

async function run() {
    console.log(chalk.bold.inverse(' Tally MCP Regression Test Suite '));

    const suite = new RegressionTestSuite();
    const testsDir = path.resolve(__dirname, 'tests');

    // Load tests
    const testFiles = fs.readdirSync(testsDir).filter(file => file.endsWith('.test.ts') || file.endsWith('.test.js'));
    for (const file of testFiles) {
        const filePath = path.resolve(testsDir, file);
        const testModule = await import(filePath);
        for (const key in testModule) {
            if (testModule[key] && typeof testModule[key] === 'object' && 'id' in testModule[key]) {
                suite.addTest(testModule[key] as RegressionTestCase);
            }
        }
    }
    
    console.log(`\nFound ${chalk.bold(suite.getTestCases().length.toString())} test cases.`);

    // Run tests
    const results = await suite.runAll();

    // Report results
    console.log(chalk.bold('\nTest Results:'));
    let passedCount = 0;
    results.forEach(result => {
        if (result.passed) {
            console.log(chalk.green(`✔ PASS `) + `${result.testCaseId} (${result.duration}ms)`);
            passedCount++;
        } else {
            console.log(chalk.red(`✖ FAIL `) + `${result.testCaseId} (${result.duration}ms)`);
            console.log(chalk.gray(`  └─ ${result.message}`));
        }
    });

    console.log(chalk.bold('\nSummary:'));
    console.log(`${chalk.green(passedCount.toString())} passed, ${chalk.red((results.length - passedCount).toString())} failed.`);

    if (results.some(r => !r.passed)) {
        process.exit(1); // Exit with error code if any tests failed
    }
}

run().catch(error => {
    console.error(chalk.red('\nAn unexpected error occurred while running the test suite:'));
    console.error(error);
    process.exit(1);
}); 
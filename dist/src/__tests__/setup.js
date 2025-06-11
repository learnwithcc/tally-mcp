"use strict";
jest.setTimeout(10000);
afterAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
});
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
beforeAll(() => {
    console.log = () => { };
    console.warn = () => { };
    console.error = originalConsoleError;
});
afterAll(() => {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
expect.addSnapshotSerializer({
    test: (val) => {
        return val && typeof val === 'object' &&
            (val.constructor?.name === 'IncomingMessage' ||
                val.constructor?.name === 'ServerResponse' ||
                val.constructor?.name === 'Socket');
    },
    print: (val) => {
        return `[${val.constructor?.name || 'Object'}]`;
    }
});
//# sourceMappingURL=setup.js.map
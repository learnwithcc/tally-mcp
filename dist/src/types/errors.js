export class StructuredError extends Error {
    constructor({ code, message, data }) {
        super(message);
        this.name = 'StructuredError';
        this.code = code;
        this.data = data;
        Object.setPrototypeOf(this, StructuredError.prototype);
    }
}
//# sourceMappingURL=errors.js.map
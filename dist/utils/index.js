"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizationPresets = exports.InputValidator = exports.sanitizeArray = exports.sanitizeObject = exports.sanitizeString = exports.validateConfig = exports.config = void 0;
var config_1 = require("./config");
Object.defineProperty(exports, "config", { enumerable: true, get: function () { return config_1.config; } });
Object.defineProperty(exports, "validateConfig", { enumerable: true, get: function () { return config_1.validateConfig; } });
var input_sanitizer_1 = require("./input-sanitizer");
Object.defineProperty(exports, "sanitizeString", { enumerable: true, get: function () { return input_sanitizer_1.sanitizeString; } });
Object.defineProperty(exports, "sanitizeObject", { enumerable: true, get: function () { return input_sanitizer_1.sanitizeObject; } });
Object.defineProperty(exports, "sanitizeArray", { enumerable: true, get: function () { return input_sanitizer_1.sanitizeArray; } });
Object.defineProperty(exports, "InputValidator", { enumerable: true, get: function () { return input_sanitizer_1.InputValidator; } });
Object.defineProperty(exports, "SanitizationPresets", { enumerable: true, get: function () { return input_sanitizer_1.SanitizationPresets; } });
//# sourceMappingURL=index.js.map
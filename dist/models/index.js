"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorFromResponse = exports.TimeoutError = exports.NetworkError = exports.ServerError = exports.RateLimitError = exports.NotFoundError = exports.BadRequestError = exports.AuthenticationError = exports.TallyApiError = void 0;
var errors_1 = require("./errors");
Object.defineProperty(exports, "TallyApiError", { enumerable: true, get: function () { return errors_1.TallyApiError; } });
Object.defineProperty(exports, "AuthenticationError", { enumerable: true, get: function () { return errors_1.AuthenticationError; } });
Object.defineProperty(exports, "BadRequestError", { enumerable: true, get: function () { return errors_1.BadRequestError; } });
Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function () { return errors_1.NotFoundError; } });
Object.defineProperty(exports, "RateLimitError", { enumerable: true, get: function () { return errors_1.RateLimitError; } });
Object.defineProperty(exports, "ServerError", { enumerable: true, get: function () { return errors_1.ServerError; } });
Object.defineProperty(exports, "NetworkError", { enumerable: true, get: function () { return errors_1.NetworkError; } });
Object.defineProperty(exports, "TimeoutError", { enumerable: true, get: function () { return errors_1.TimeoutError; } });
Object.defineProperty(exports, "createErrorFromResponse", { enumerable: true, get: function () { return errors_1.createErrorFromResponse; } });
__exportStar(require("./tally-schemas"), exports);
__exportStar(require("./form-config"), exports);
__exportStar(require("./form-config-schemas"), exports);
__exportStar(require("./form-version"), exports);
__exportStar(require("./template"), exports);
__exportStar(require("./api-key"), exports);
//# sourceMappingURL=index.js.map
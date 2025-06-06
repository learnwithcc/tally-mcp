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
exports.apiKeyService = exports.ApiKeyService = exports.WorkspaceService = exports.SubmissionService = exports.TemplateService = exports.TallyApiClient = void 0;
var TallyApiClient_1 = require("./TallyApiClient");
Object.defineProperty(exports, "TallyApiClient", { enumerable: true, get: function () { return TallyApiClient_1.TallyApiClient; } });
__exportStar(require("./nlp-service"), exports);
__exportStar(require("./tally-api-service"), exports);
__exportStar(require("./form-modification-parser"), exports);
__exportStar(require("./form-modification-operations"), exports);
var template_service_1 = require("./template-service");
Object.defineProperty(exports, "TemplateService", { enumerable: true, get: function () { return template_service_1.TemplateService; } });
var submission_service_1 = require("./submission-service");
Object.defineProperty(exports, "SubmissionService", { enumerable: true, get: function () { return submission_service_1.SubmissionService; } });
var workspace_service_1 = require("./workspace-service");
Object.defineProperty(exports, "WorkspaceService", { enumerable: true, get: function () { return workspace_service_1.WorkspaceService; } });
var api_key_service_1 = require("./api-key-service");
Object.defineProperty(exports, "ApiKeyService", { enumerable: true, get: function () { return api_key_service_1.ApiKeyService; } });
Object.defineProperty(exports, "apiKeyService", { enumerable: true, get: function () { return api_key_service_1.apiKeyService; } });
//# sourceMappingURL=index.js.map
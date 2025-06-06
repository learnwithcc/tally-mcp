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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeValidationSchema = exports.DateValidationSchema = exports.PhoneValidationSchema = exports.UrlValidationSchema = exports.EmailValidationSchema = exports.PatternValidationSchema = exports.NumericValidationSchema = exports.LengthValidationSchema = exports.RequiredValidationSchema = exports.BaseValidationRuleSchema = exports.QuestionConfigSchema = exports.PaymentQuestionConfigSchema = exports.SignatureQuestionConfigSchema = exports.FileQuestionConfigSchema = exports.LinearScaleQuestionConfigSchema = exports.RatingQuestionConfigSchema = exports.CheckboxesQuestionConfigSchema = exports.DropdownQuestionConfigSchema = exports.MultipleChoiceQuestionConfigSchema = exports.TimeQuestionConfigSchema = exports.DateQuestionConfigSchema = exports.NumberQuestionConfigSchema = exports.UrlQuestionConfigSchema = exports.PhoneQuestionConfigSchema = exports.EmailQuestionConfigSchema = exports.TextareaQuestionConfigSchema = exports.TextQuestionConfigSchema = exports.BaseQuestionConfigSchema = exports.ValidationRulesSchema = exports.ValidationRuleSchema = exports.ConditionalLogicSchema = exports.ConditionalActionConfigSchema = exports.LogicConditionGroupSchema = exports.QuestionOptionSchema = exports.FormSettingsSchema = exports.FormMetadataSchema = exports.BrandingConfigSchema = exports.ButtonStyleSchema = exports.LogicCombinatorSchema = exports.ConditionalActionSchema = exports.PaymentMethodSchema = exports.TimeFormatSchema = exports.PhoneFormatSchema = exports.RatingStyleSchema = exports.QuestionLayoutSchema = exports.LogicOperatorSchema = exports.ValidationTypeSchema = exports.SubmissionBehaviorSchema = exports.FormThemeSchema = exports.QuestionTypeSchema = void 0;
exports.FormConfigSchema = exports.SkipActionSchema = exports.SubmitFormActionSchema = exports.RedirectActionSchema = exports.ShowMessageActionSchema = exports.EnableDisableActionSchema = exports.ClearValueActionSchema = exports.SetValueActionSchema = exports.JumpToPageActionSchema = exports.JumpToActionSchema = exports.RequireActionSchema = exports.ShowHideActionSchema = exports.BaseConditionalActionSchema = exports.LogicConditionSchema = exports.CustomValidationSchema = exports.RatingValidationSchema = exports.ChoiceValidationSchema = exports.FileValidationSchema = void 0;
exports.validateFormConfig = validateFormConfig;
exports.serializeFormConfig = serializeFormConfig;
exports.deserializeFormConfig = deserializeFormConfig;
exports.getValidationRulesForQuestion = getValidationRulesForQuestion;
exports.getLogicRulesAffectingQuestion = getLogicRulesAffectingQuestion;
const zod_1 = require("zod");
const T = __importStar(require("./form-config"));
exports.QuestionTypeSchema = zod_1.z.nativeEnum(T.QuestionType);
exports.FormThemeSchema = zod_1.z.nativeEnum(T.FormTheme);
exports.SubmissionBehaviorSchema = zod_1.z.nativeEnum(T.SubmissionBehavior);
exports.ValidationTypeSchema = zod_1.z.nativeEnum(T.ValidationType);
exports.LogicOperatorSchema = zod_1.z.nativeEnum(T.LogicOperator);
exports.QuestionLayoutSchema = zod_1.z.nativeEnum(T.QuestionLayout);
exports.RatingStyleSchema = zod_1.z.nativeEnum(T.RatingStyle);
exports.PhoneFormatSchema = zod_1.z.nativeEnum(T.PhoneFormat);
exports.TimeFormatSchema = zod_1.z.nativeEnum(T.TimeFormat);
exports.PaymentMethodSchema = zod_1.z.nativeEnum(T.PaymentMethod);
exports.ConditionalActionSchema = zod_1.z.nativeEnum(T.ConditionalAction);
exports.LogicCombinatorSchema = zod_1.z.nativeEnum(T.LogicCombinator);
exports.ButtonStyleSchema = zod_1.z.object({
    backgroundColor: zod_1.z.string().optional(),
    textColor: zod_1.z.string().optional(),
    borderRadius: zod_1.z.number().optional(),
    border: zod_1.z.string().optional(),
    fontSize: zod_1.z.number().optional(),
    padding: zod_1.z.string().optional(),
});
exports.BrandingConfigSchema = zod_1.z.object({
    theme: exports.FormThemeSchema,
    primaryColor: zod_1.z.string().optional(),
    secondaryColor: zod_1.z.string().optional(),
    background: zod_1.z.string().optional(),
    customCss: zod_1.z.string().optional(),
    logoUrl: zod_1.z.string().optional(),
    fontFamily: zod_1.z.string().optional(),
    buttonStyle: exports.ButtonStyleSchema.optional(),
});
exports.FormMetadataSchema = zod_1.z.object({
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    category: zod_1.z.string().optional(),
    createdAt: zod_1.z.string().optional(),
    updatedAt: zod_1.z.string().optional(),
    createdBy: zod_1.z.string().optional(),
    workspaceId: zod_1.z.string().optional(),
    isPublished: zod_1.z.boolean().optional(),
    isArchived: zod_1.z.boolean().optional(),
    version: zod_1.z.number().optional(),
});
exports.FormSettingsSchema = zod_1.z.object({
    showProgressBar: zod_1.z.boolean().optional(),
    allowDrafts: zod_1.z.boolean().optional(),
    showQuestionNumbers: zod_1.z.boolean().optional(),
    shuffleQuestions: zod_1.z.boolean().optional(),
    maxSubmissions: zod_1.z.number().optional(),
    requireAuth: zod_1.z.boolean().optional(),
    collectEmail: zod_1.z.boolean().optional(),
    closeDate: zod_1.z.string().optional(),
    openDate: zod_1.z.string().optional(),
    submissionBehavior: exports.SubmissionBehaviorSchema,
    submissionMessage: zod_1.z.string().optional(),
    redirectUrl: zod_1.z.string().optional(),
    sendConfirmationEmail: zod_1.z.boolean().optional(),
    allowMultipleSubmissions: zod_1.z.boolean().optional(),
});
exports.QuestionOptionSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    text: zod_1.z.string(),
    value: zod_1.z.string().optional(),
    isDefault: zod_1.z.boolean().optional(),
    imageUrl: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.LogicConditionGroupSchema = zod_1.z.lazy(() => zod_1.z.object({
    id: zod_1.z.string().optional(),
    combinator: exports.LogicCombinatorSchema,
    conditions: zod_1.z.array(exports.LogicConditionSchema),
    groups: zod_1.z.array(exports.LogicConditionGroupSchema).optional(),
    negate: zod_1.z.boolean().optional(),
}));
exports.ConditionalActionConfigSchema = zod_1.z.lazy(() => zod_1.z.union([
    exports.ShowHideActionSchema,
    exports.RequireActionSchema,
    exports.JumpToActionSchema,
    exports.JumpToPageActionSchema,
    exports.SetValueActionSchema,
    exports.ClearValueActionSchema,
    exports.EnableDisableActionSchema,
    exports.ShowMessageActionSchema,
    exports.RedirectActionSchema,
    exports.SubmitFormActionSchema,
    exports.SkipActionSchema,
]));
exports.ConditionalLogicSchema = zod_1.z.lazy(() => zod_1.z.object({
    id: zod_1.z.string().optional(),
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    enabled: zod_1.z.boolean().optional(),
    priority: zod_1.z.number().optional(),
    conditionGroup: exports.LogicConditionGroupSchema,
    actions: zod_1.z.array(exports.ConditionalActionConfigSchema),
    elseActions: zod_1.z.array(exports.ConditionalActionConfigSchema).optional(),
    reEvaluateOnChange: zod_1.z.boolean().optional(),
    triggerQuestions: zod_1.z.array(zod_1.z.string()).optional(),
    runOnce: zod_1.z.boolean().optional(),
    metadata: zod_1.z
        .object({
        createdAt: zod_1.z.string().optional(),
        updatedAt: zod_1.z.string().optional(),
        createdBy: zod_1.z.string().optional(),
        version: zod_1.z.number().optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .optional(),
}));
exports.ValidationRuleSchema = zod_1.z.lazy(() => zod_1.z.union([
    exports.RequiredValidationSchema,
    exports.LengthValidationSchema,
    exports.NumericValidationSchema,
    exports.PatternValidationSchema,
    exports.EmailValidationSchema,
    exports.UrlValidationSchema,
    exports.PhoneValidationSchema,
    exports.DateValidationSchema,
    exports.TimeValidationSchema,
    exports.FileValidationSchema,
    exports.ChoiceValidationSchema,
    exports.RatingValidationSchema,
    exports.CustomValidationSchema,
]));
exports.ValidationRulesSchema = zod_1.z.lazy(() => zod_1.z.object({
    rules: zod_1.z.array(exports.ValidationRuleSchema).optional(),
    validateOnChange: zod_1.z.boolean().optional(),
    validateOnBlur: zod_1.z.boolean().optional(),
    stopOnFirstError: zod_1.z.boolean().optional(),
    customMessages: zod_1.z.record(zod_1.z.string()).optional(),
    dependencies: zod_1.z.array(zod_1.z.string()).optional(),
    required: zod_1.z.boolean().optional(),
    minLength: zod_1.z.number().optional(),
    maxLength: zod_1.z.number().optional(),
    minValue: zod_1.z.number().optional(),
    maxValue: zod_1.z.number().optional(),
    pattern: zod_1.z.string().optional(),
    errorMessage: zod_1.z.string().optional(),
    emailFormat: zod_1.z.boolean().optional(),
    urlFormat: zod_1.z.boolean().optional(),
    phoneFormat: zod_1.z.boolean().optional(),
    dateRange: zod_1.z
        .object({
        min: zod_1.z.string().optional(),
        max: zod_1.z.string().optional(),
    })
        .optional(),
    fileType: zod_1.z
        .object({
        allowed: zod_1.z.array(zod_1.z.string()).optional(),
        blocked: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .optional(),
    fileSize: zod_1.z
        .object({
        min: zod_1.z.number().optional(),
        max: zod_1.z.number().optional(),
    })
        .optional(),
    customValidation: zod_1.z.string().optional(),
    additionalRules: zod_1.z.record(zod_1.z.any()).optional(),
}));
exports.BaseQuestionConfigSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    label: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    required: zod_1.z.boolean(),
    placeholder: zod_1.z.string().optional(),
    validation: exports.ValidationRulesSchema.optional(),
    logic: exports.ConditionalLogicSchema.optional(),
    order: zod_1.z.number().optional(),
});
exports.TextQuestionConfigSchema = exports.BaseQuestionConfigSchema.extend({
    type: zod_1.z.literal(T.QuestionType.TEXT),
    minLength: zod_1.z.number().optional(),
    maxLength: zod_1.z.number().optional(),
    format: zod_1.z.string().optional(),
});
exports.TextareaQuestionConfigSchema = exports.BaseQuestionConfigSchema.extend({
    type: zod_1.z.literal(T.QuestionType.TEXTAREA),
    minLength: zod_1.z.number().optional(),
    maxLength: zod_1.z.number().optional(),
    rows: zod_1.z.number().optional(),
    autoResize: zod_1.z.boolean().optional(),
});
exports.EmailQuestionConfigSchema = exports.BaseQuestionConfigSchema.extend({
    type: zod_1.z.literal(T.QuestionType.EMAIL),
    validateFormat: zod_1.z.boolean().optional(),
    suggestDomains: zod_1.z.boolean().optional(),
});
exports.PhoneQuestionConfigSchema = exports.BaseQuestionConfigSchema.extend({
    type: zod_1.z.literal(T.QuestionType.PHONE),
    format: exports.PhoneFormatSchema.optional(),
    customPattern: zod_1.z.string().optional(),
    autoFormat: zod_1.z.boolean().optional(),
});
exports.UrlQuestionConfigSchema = exports.BaseQuestionConfigSchema.extend({
    type: zod_1.z.literal(T.QuestionType.URL),
    validateFormat: zod_1.z.boolean().optional(),
    allowedSchemes: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.NumberQuestionConfigSchema = exports.BaseQuestionConfigSchema.extend({
    type: zod_1.z.literal(T.QuestionType.NUMBER),
    min: zod_1.z.number().optional(),
    max: zod_1.z.number().optional(),
    step: zod_1.z.number().optional(),
    decimalPlaces: zod_1.z.number().optional(),
    useThousandSeparator: zod_1.z.boolean().optional(),
    currency: zod_1.z.string().optional(),
});
exports.DateQuestionConfigSchema = exports.BaseQuestionConfigSchema.extend({
    type: zod_1.z.literal(T.QuestionType.DATE),
    minDate: zod_1.z.string().optional(),
    maxDate: zod_1.z.string().optional(),
    dateFormat: zod_1.z.string().optional(),
    includeTime: zod_1.z.boolean().optional(),
    defaultDate: zod_1.z.string().optional(),
});
exports.TimeQuestionConfigSchema = exports.BaseQuestionConfigSchema.extend({
    type: zod_1.z.literal(T.QuestionType.TIME),
    format: exports.TimeFormatSchema.optional(),
    minuteStep: zod_1.z.number().optional(),
    defaultTime: zod_1.z.string().optional(),
});
exports.MultipleChoiceQuestionConfigSchema = exports.BaseQuestionConfigSchema.extend({
    type: zod_1.z.literal(T.QuestionType.MULTIPLE_CHOICE),
    options: zod_1.z.array(exports.QuestionOptionSchema),
    allowOther: zod_1.z.boolean().optional(),
    randomizeOptions: zod_1.z.boolean().optional(),
    layout: exports.QuestionLayoutSchema.optional(),
});
exports.DropdownQuestionConfigSchema = exports.BaseQuestionConfigSchema.extend({
    type: zod_1.z.literal(T.QuestionType.DROPDOWN),
    options: zod_1.z.array(exports.QuestionOptionSchema),
    allowOther: zod_1.z.boolean().optional(),
    searchable: zod_1.z.boolean().optional(),
    dropdownPlaceholder: zod_1.z.string().optional(),
});
exports.CheckboxesQuestionConfigSchema = exports.BaseQuestionConfigSchema.extend({
    type: zod_1.z.literal(T.QuestionType.CHECKBOXES),
    options: zod_1.z.array(exports.QuestionOptionSchema),
    minSelections: zod_1.z.number().optional(),
    maxSelections: zod_1.z.number().optional(),
    allowOther: zod_1.z.boolean().optional(),
    randomizeOptions: zod_1.z.boolean().optional(),
    layout: exports.QuestionLayoutSchema.optional(),
});
exports.RatingQuestionConfigSchema = exports.BaseQuestionConfigSchema.extend({
    type: zod_1.z.literal(T.QuestionType.RATING),
    minRating: zod_1.z.number(),
    maxRating: zod_1.z.number(),
    ratingLabels: zod_1.z.array(zod_1.z.string()).optional(),
    style: exports.RatingStyleSchema.optional(),
    showNumbers: zod_1.z.boolean().optional(),
    lowLabel: zod_1.z.string().optional(),
    highLabel: zod_1.z.string().optional(),
});
exports.LinearScaleQuestionConfigSchema = exports.BaseQuestionConfigSchema.extend({
    type: zod_1.z.literal(T.QuestionType.LINEAR_SCALE),
    minValue: zod_1.z.number(),
    maxValue: zod_1.z.number(),
    step: zod_1.z.number().optional(),
    lowLabel: zod_1.z.string().optional(),
    highLabel: zod_1.z.string().optional(),
    showNumbers: zod_1.z.boolean().optional(),
});
exports.FileQuestionConfigSchema = exports.BaseQuestionConfigSchema.extend({
    type: zod_1.z.literal(T.QuestionType.FILE),
    allowedTypes: zod_1.z.array(zod_1.z.string()).optional(),
    maxFileSize: zod_1.z.number().optional(),
    maxFiles: zod_1.z.number().optional(),
    multiple: zod_1.z.boolean().optional(),
    uploadText: zod_1.z.string().optional(),
});
exports.SignatureQuestionConfigSchema = exports.BaseQuestionConfigSchema.extend({
    type: zod_1.z.literal(T.QuestionType.SIGNATURE),
    canvasWidth: zod_1.z.number().optional(),
    canvasHeight: zod_1.z.number().optional(),
    penColor: zod_1.z.string().optional(),
    backgroundColor: zod_1.z.string().optional(),
});
exports.PaymentQuestionConfigSchema = exports.BaseQuestionConfigSchema.extend({
    type: zod_1.z.literal(T.QuestionType.PAYMENT),
    amount: zod_1.z.number().optional(),
    currency: zod_1.z.string(),
    fixedAmount: zod_1.z.boolean().optional(),
    minAmount: zod_1.z.number().optional(),
    maxAmount: zod_1.z.number().optional(),
    paymentDescription: zod_1.z.string().optional(),
    acceptedMethods: zod_1.z.array(exports.PaymentMethodSchema).optional(),
});
exports.QuestionConfigSchema = zod_1.z.discriminatedUnion('type', [
    exports.TextQuestionConfigSchema,
    exports.TextareaQuestionConfigSchema,
    exports.EmailQuestionConfigSchema,
    exports.PhoneQuestionConfigSchema,
    exports.UrlQuestionConfigSchema,
    exports.NumberQuestionConfigSchema,
    exports.DateQuestionConfigSchema,
    exports.TimeQuestionConfigSchema,
    exports.MultipleChoiceQuestionConfigSchema,
    exports.DropdownQuestionConfigSchema,
    exports.CheckboxesQuestionConfigSchema,
    exports.RatingQuestionConfigSchema,
    exports.LinearScaleQuestionConfigSchema,
    exports.FileQuestionConfigSchema,
    exports.SignatureQuestionConfigSchema,
    exports.PaymentQuestionConfigSchema,
]);
exports.BaseValidationRuleSchema = zod_1.z.object({
    errorMessage: zod_1.z.string().optional(),
    enabled: zod_1.z.boolean().optional(),
});
exports.RequiredValidationSchema = exports.BaseValidationRuleSchema.extend({
    type: zod_1.z.literal('required'),
    required: zod_1.z.literal(true),
});
exports.LengthValidationSchema = exports.BaseValidationRuleSchema.extend({
    type: zod_1.z.literal('length'),
    minLength: zod_1.z.number().optional(),
    maxLength: zod_1.z.number().optional(),
});
exports.NumericValidationSchema = exports.BaseValidationRuleSchema.extend({
    type: zod_1.z.literal('numeric'),
    min: zod_1.z.number().optional(),
    max: zod_1.z.number().optional(),
    step: zod_1.z.number().optional(),
    decimalPlaces: zod_1.z.number().optional(),
});
exports.PatternValidationSchema = exports.BaseValidationRuleSchema.extend({
    type: zod_1.z.literal('pattern'),
    pattern: zod_1.z.string(),
    flags: zod_1.z.string().optional(),
    caseSensitive: zod_1.z.boolean().optional(),
});
exports.EmailValidationSchema = exports.BaseValidationRuleSchema.extend({
    type: zod_1.z.literal('email'),
    allowedDomains: zod_1.z.array(zod_1.z.string()).optional(),
    blockedDomains: zod_1.z.array(zod_1.z.string()).optional(),
    requireTLD: zod_1.z.boolean().optional(),
});
exports.UrlValidationSchema = exports.BaseValidationRuleSchema.extend({
    type: zod_1.z.literal('url'),
    allowedSchemes: zod_1.z.array(zod_1.z.string()).optional(),
    requireScheme: zod_1.z.boolean().optional(),
    allowedDomains: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.PhoneValidationSchema = exports.BaseValidationRuleSchema.extend({
    type: zod_1.z.literal('phone'),
    format: exports.PhoneFormatSchema.optional(),
    country: zod_1.z.string().optional(),
    allowInternational: zod_1.z.boolean().optional(),
});
exports.DateValidationSchema = exports.BaseValidationRuleSchema.extend({
    type: zod_1.z.literal('date'),
    minDate: zod_1.z.string().optional(),
    maxDate: zod_1.z.string().optional(),
    allowPast: zod_1.z.boolean().optional(),
    allowFuture: zod_1.z.boolean().optional(),
    excludeDates: zod_1.z.array(zod_1.z.string()).optional(),
    excludeWeekends: zod_1.z.boolean().optional(),
});
exports.TimeValidationSchema = exports.BaseValidationRuleSchema.extend({
    type: zod_1.z.literal('time'),
    minTime: zod_1.z.string().optional(),
    maxTime: zod_1.z.string().optional(),
    allowedTimeSlots: zod_1.z.array(zod_1.z.object({ start: zod_1.z.string(), end: zod_1.z.string() })).optional(),
    excludeTimeSlots: zod_1.z.array(zod_1.z.object({ start: zod_1.z.string(), end: zod_1.z.string() })).optional(),
});
exports.FileValidationSchema = exports.BaseValidationRuleSchema.extend({
    type: zod_1.z.literal('file'),
    allowedTypes: zod_1.z.array(zod_1.z.string()).optional(),
    blockedTypes: zod_1.z.array(zod_1.z.string()).optional(),
    maxFileSize: zod_1.z.number().optional(),
    minFileSize: zod_1.z.number().optional(),
    maxFiles: zod_1.z.number().optional(),
    minFiles: zod_1.z.number().optional(),
    allowedExtensions: zod_1.z.array(zod_1.z.string()).optional(),
    blockedExtensions: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.ChoiceValidationSchema = exports.BaseValidationRuleSchema.extend({
    type: zod_1.z.literal('choice'),
    minSelections: zod_1.z.number().optional(),
    maxSelections: zod_1.z.number().optional(),
    requiredOptions: zod_1.z.array(zod_1.z.string()).optional(),
    forbiddenCombinations: zod_1.z.array(zod_1.z.array(zod_1.z.string())).optional(),
});
exports.RatingValidationSchema = exports.BaseValidationRuleSchema.extend({
    type: zod_1.z.literal('rating'),
    minRating: zod_1.z.number().optional(),
    maxRating: zod_1.z.number().optional(),
    requiredRating: zod_1.z.boolean().optional(),
});
exports.CustomValidationSchema = exports.BaseValidationRuleSchema.extend({
    type: zod_1.z.literal('custom'),
    validator: zod_1.z.string().or(zod_1.z.function().returns(zod_1.z.union([zod_1.z.boolean(), zod_1.z.string()]))),
    async: zod_1.z.boolean().optional(),
    dependencies: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.LogicConditionSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    questionId: zod_1.z.string(),
    operator: exports.LogicOperatorSchema,
    value: zod_1.z.any(),
    caseSensitive: zod_1.z.boolean().optional(),
    negate: zod_1.z.boolean().optional(),
    errorMessage: zod_1.z.string().optional(),
});
exports.BaseConditionalActionSchema = zod_1.z.object({
    action: exports.ConditionalActionSchema,
    enabled: zod_1.z.boolean().optional(),
    delay: zod_1.z.number().optional(),
});
exports.ShowHideActionSchema = exports.BaseConditionalActionSchema.extend({
    action: zod_1.z.union([zod_1.z.literal(T.ConditionalAction.SHOW), zod_1.z.literal(T.ConditionalAction.HIDE)]),
    animation: zod_1.z.union([zod_1.z.literal('fade'), zod_1.z.literal('slide'), zod_1.z.literal('none')]).optional(),
    animationDuration: zod_1.z.number().optional(),
});
exports.RequireActionSchema = exports.BaseConditionalActionSchema.extend({
    action: zod_1.z.union([zod_1.z.literal(T.ConditionalAction.REQUIRE), zod_1.z.literal(T.ConditionalAction.MAKE_OPTIONAL)]),
    validationMessage: zod_1.z.string().optional(),
});
exports.JumpToActionSchema = exports.BaseConditionalActionSchema.extend({
    action: zod_1.z.literal(T.ConditionalAction.JUMP_TO),
    targetQuestionId: zod_1.z.string(),
    skipValidation: zod_1.z.boolean().optional(),
});
exports.JumpToPageActionSchema = exports.BaseConditionalActionSchema.extend({
    action: zod_1.z.literal(T.ConditionalAction.JUMP_TO_PAGE),
    targetPage: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
    skipValidation: zod_1.z.boolean().optional(),
});
exports.SetValueActionSchema = exports.BaseConditionalActionSchema.extend({
    action: zod_1.z.literal(T.ConditionalAction.SET_VALUE),
    targetQuestionId: zod_1.z.string(),
    value: zod_1.z.any(),
    triggerValidation: zod_1.z.boolean().optional(),
});
exports.ClearValueActionSchema = exports.BaseConditionalActionSchema.extend({
    action: zod_1.z.literal(T.ConditionalAction.CLEAR_VALUE),
    targetQuestionId: zod_1.z.string(),
    triggerValidation: zod_1.z.boolean().optional(),
});
exports.EnableDisableActionSchema = exports.BaseConditionalActionSchema.extend({
    action: zod_1.z.union([zod_1.z.literal(T.ConditionalAction.ENABLE), zod_1.z.literal(T.ConditionalAction.DISABLE)]),
    disabledStyle: zod_1.z.union([zod_1.z.literal('grayed_out'), zod_1.z.literal('hidden'), zod_1.z.literal('readonly')]).optional(),
});
exports.ShowMessageActionSchema = exports.BaseConditionalActionSchema.extend({
    action: zod_1.z.literal(T.ConditionalAction.SHOW_MESSAGE),
    message: zod_1.z.string(),
    messageType: zod_1.z.union([zod_1.z.literal('info'), zod_1.z.literal('warning'), zod_1.z.literal('error'), zod_1.z.literal('success')]).optional(),
    duration: zod_1.z.number().optional(),
    position: zod_1.z.union([zod_1.z.literal('above'), zod_1.z.literal('below'), zod_1.z.literal('inline'), zod_1.z.literal('popup')]).optional(),
});
exports.RedirectActionSchema = exports.BaseConditionalActionSchema.extend({
    action: zod_1.z.literal(T.ConditionalAction.REDIRECT),
    url: zod_1.z.string(),
    newWindow: zod_1.z.boolean().optional(),
    confirmationMessage: zod_1.z.string().optional(),
});
exports.SubmitFormActionSchema = exports.BaseConditionalActionSchema.extend({
    action: zod_1.z.literal(T.ConditionalAction.SUBMIT_FORM),
    validateBeforeSubmit: zod_1.z.boolean().optional(),
    customEndpoint: zod_1.z.string().optional(),
});
exports.SkipActionSchema = exports.BaseConditionalActionSchema.extend({
    action: zod_1.z.literal(T.ConditionalAction.SKIP),
    skipCount: zod_1.z.number().optional(),
});
exports.FormConfigSchema = zod_1.z.lazy(() => zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    questions: zod_1.z.array(exports.QuestionConfigSchema),
    settings: exports.FormSettingsSchema,
    branding: exports.BrandingConfigSchema.optional(),
    metadata: exports.FormMetadataSchema.optional(),
}));
function validateFormConfig(config) {
    return exports.FormConfigSchema.safeParse(config);
}
function serializeFormConfig(config) {
    return JSON.stringify(config, null, 2);
}
function deserializeFormConfig(json) {
    const data = JSON.parse(json);
    const result = exports.FormConfigSchema.parse(data);
    return result;
}
function getValidationRulesForQuestion(config, questionId) {
    const question = config.questions.find(q => q.id === questionId);
    return question?.validation?.rules;
}
function getLogicRulesAffectingQuestion(config, questionId) {
    const affectingLogic = [];
    for (const question of config.questions) {
        if (question.logic) {
            for (const action of question.logic.actions) {
                if ('targetQuestionId' in action && action.targetQuestionId === questionId) {
                    affectingLogic.push(question.logic);
                    break;
                }
            }
        }
    }
    return affectingLogic;
}
//# sourceMappingURL=form-config-schemas.js.map
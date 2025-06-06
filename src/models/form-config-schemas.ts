import { z } from 'zod';
import * as T from './form-config';

// ===============================
// Enum Schemas
// ===============================

export const QuestionTypeSchema = z.nativeEnum(T.QuestionType);
export const FormThemeSchema = z.nativeEnum(T.FormTheme);
export const SubmissionBehaviorSchema = z.nativeEnum(T.SubmissionBehavior);
export const ValidationTypeSchema = z.nativeEnum(T.ValidationType);
export const LogicOperatorSchema = z.nativeEnum(T.LogicOperator);
export const QuestionLayoutSchema = z.nativeEnum(T.QuestionLayout);
export const RatingStyleSchema = z.nativeEnum(T.RatingStyle);
export const PhoneFormatSchema = z.nativeEnum(T.PhoneFormat);
export const TimeFormatSchema = z.nativeEnum(T.TimeFormat);
export const PaymentMethodSchema = z.nativeEnum(T.PaymentMethod);
export const ConditionalActionSchema = z.nativeEnum(T.ConditionalAction);
export const LogicCombinatorSchema = z.nativeEnum(T.LogicCombinator);

// ===============================
// Core Schemas
// ===============================

export const ButtonStyleSchema = z.object({
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  borderRadius: z.number().optional(),
  border: z.string().optional(),
  fontSize: z.number().optional(),
  padding: z.string().optional(),
});

export const BrandingConfigSchema = z.object({
  theme: FormThemeSchema,
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  background: z.string().optional(),
  customCss: z.string().optional(),
  logoUrl: z.string().optional(),
  fontFamily: z.string().optional(),
  buttonStyle: ButtonStyleSchema.optional(),
});

export const FormMetadataSchema = z.object({
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional(),
  workspaceId: z.string().optional(),
  isPublished: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  version: z.number().optional(),
});

export const FormSettingsSchema = z.object({
  showProgressBar: z.boolean().optional(),
  allowDrafts: z.boolean().optional(),
  showQuestionNumbers: z.boolean().optional(),
  shuffleQuestions: z.boolean().optional(),
  maxSubmissions: z.number().optional(),
  requireAuth: z.boolean().optional(),
  collectEmail: z.boolean().optional(),
  closeDate: z.string().optional(),
  openDate: z.string().optional(),
  submissionBehavior: SubmissionBehaviorSchema,
  submissionMessage: z.string().optional(),
  redirectUrl: z.string().optional(),
  sendConfirmationEmail: z.boolean().optional(),
  allowMultipleSubmissions: z.boolean().optional(),
});

export const QuestionOptionSchema = z.object({
  id: z.string().optional(),
  text: z.string(),
  value: z.string().optional(),
  isDefault: z.boolean().optional(),
  imageUrl: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Forward declaration for recursive types
export const LogicConditionGroupSchema: any = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    combinator: LogicCombinatorSchema,
    conditions: z.array(LogicConditionSchema),
    groups: z.array(LogicConditionGroupSchema).optional(),
    negate: z.boolean().optional(),
  })
);

export const ConditionalActionConfigSchema: any = z.lazy(() =>
  z.union([
    ShowHideActionSchema,
    RequireActionSchema,
    JumpToActionSchema,
    JumpToPageActionSchema,
    SetValueActionSchema,
    ClearValueActionSchema,
    EnableDisableActionSchema,
    ShowMessageActionSchema,
    RedirectActionSchema,
    SubmitFormActionSchema,
    SkipActionSchema,
  ])
);

export const ConditionalLogicSchema: any = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    enabled: z.boolean().optional(),
    priority: z.number().optional(),
    conditionGroup: LogicConditionGroupSchema,
    actions: z.array(ConditionalActionConfigSchema),
    elseActions: z.array(ConditionalActionConfigSchema).optional(),
    reEvaluateOnChange: z.boolean().optional(),
    triggerQuestions: z.array(z.string()).optional(),
    runOnce: z.boolean().optional(),
    metadata: z
      .object({
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
        createdBy: z.string().optional(),
        version: z.number().optional(),
        tags: z.array(z.string()).optional(),
      })
      .optional(),
  })
);

export const ValidationRuleSchema: any = z.lazy(() =>
  z.union([
    RequiredValidationSchema,
    LengthValidationSchema,
    NumericValidationSchema,
    PatternValidationSchema,
    EmailValidationSchema,
    UrlValidationSchema,
    PhoneValidationSchema,
    DateValidationSchema,
    TimeValidationSchema,
    FileValidationSchema,
    ChoiceValidationSchema,
    RatingValidationSchema,
    CustomValidationSchema,
  ])
);

export const ValidationRulesSchema: any = z.lazy(() =>
  z.object({
    rules: z.array(ValidationRuleSchema).optional(),
    validateOnChange: z.boolean().optional(),
    validateOnBlur: z.boolean().optional(),
    stopOnFirstError: z.boolean().optional(),
    customMessages: z.record(z.string()).optional(),
    dependencies: z.array(z.string()).optional(),
    required: z.boolean().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    minValue: z.number().optional(),
    maxValue: z.number().optional(),
    pattern: z.string().optional(),
    errorMessage: z.string().optional(),
    emailFormat: z.boolean().optional(),
    urlFormat: z.boolean().optional(),
    phoneFormat: z.boolean().optional(),
    dateRange: z
      .object({
        min: z.string().optional(),
        max: z.string().optional(),
      })
      .optional(),
    fileType: z
      .object({
        allowed: z.array(z.string()).optional(),
        blocked: z.array(z.string()).optional(),
      })
      .optional(),
    fileSize: z
      .object({
        min: z.number().optional(),
        max: z.number().optional(),
      })
      .optional(),
    customValidation: z.string().optional(),
    additionalRules: z.record(z.any()).optional(),
  })
);


export const BaseQuestionConfigSchema = z.object({
  id: z.string().optional(),
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean(),
  placeholder: z.string().optional(),
  validation: ValidationRulesSchema.optional(),
  logic: ConditionalLogicSchema.optional(),
  order: z.number().optional(),
});

// ===============================
// Question-Specific Schemas
// ===============================

export const TextQuestionConfigSchema = BaseQuestionConfigSchema.extend({
  type: z.literal(T.QuestionType.TEXT),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  format: z.string().optional(),
});

export const TextareaQuestionConfigSchema = BaseQuestionConfigSchema.extend({
  type: z.literal(T.QuestionType.TEXTAREA),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  rows: z.number().optional(),
  autoResize: z.boolean().optional(),
});

export const EmailQuestionConfigSchema = BaseQuestionConfigSchema.extend({
  type: z.literal(T.QuestionType.EMAIL),
  validateFormat: z.boolean().optional(),
  suggestDomains: z.boolean().optional(),
});

export const PhoneQuestionConfigSchema = BaseQuestionConfigSchema.extend({
  type: z.literal(T.QuestionType.PHONE),
  format: PhoneFormatSchema.optional(),
  customPattern: z.string().optional(),
  autoFormat: z.boolean().optional(),
});

export const UrlQuestionConfigSchema = BaseQuestionConfigSchema.extend({
  type: z.literal(T.QuestionType.URL),
  validateFormat: z.boolean().optional(),
  allowedSchemes: z.array(z.string()).optional(),
});

export const NumberQuestionConfigSchema = BaseQuestionConfigSchema.extend({
  type: z.literal(T.QuestionType.NUMBER),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  decimalPlaces: z.number().optional(),
  useThousandSeparator: z.boolean().optional(),
  currency: z.string().optional(),
});

export const DateQuestionConfigSchema = BaseQuestionConfigSchema.extend({
  type: z.literal(T.QuestionType.DATE),
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
  dateFormat: z.string().optional(),
  includeTime: z.boolean().optional(),
  defaultDate: z.string().optional(),
});

export const TimeQuestionConfigSchema = BaseQuestionConfigSchema.extend({
  type: z.literal(T.QuestionType.TIME),
  format: TimeFormatSchema.optional(),
  minuteStep: z.number().optional(),
  defaultTime: z.string().optional(),
});

export const MultipleChoiceQuestionConfigSchema = BaseQuestionConfigSchema.extend({
  type: z.literal(T.QuestionType.MULTIPLE_CHOICE),
  options: z.array(QuestionOptionSchema),
  allowOther: z.boolean().optional(),
  randomizeOptions: z.boolean().optional(),
  layout: QuestionLayoutSchema.optional(),
});

export const DropdownQuestionConfigSchema = BaseQuestionConfigSchema.extend({
  type: z.literal(T.QuestionType.DROPDOWN),
  options: z.array(QuestionOptionSchema),
  allowOther: z.boolean().optional(),
  searchable: z.boolean().optional(),
  dropdownPlaceholder: z.string().optional(),
});

export const CheckboxesQuestionConfigSchema = BaseQuestionConfigSchema.extend({
  type: z.literal(T.QuestionType.CHECKBOXES),
  options: z.array(QuestionOptionSchema),
  minSelections: z.number().optional(),
  maxSelections: z.number().optional(),
  allowOther: z.boolean().optional(),
  randomizeOptions: z.boolean().optional(),
  layout: QuestionLayoutSchema.optional(),
});

export const RatingQuestionConfigSchema = BaseQuestionConfigSchema.extend({
  type: z.literal(T.QuestionType.RATING),
  minRating: z.number(),
  maxRating: z.number(),
  ratingLabels: z.array(z.string()).optional(),
  style: RatingStyleSchema.optional(),
  showNumbers: z.boolean().optional(),
  lowLabel: z.string().optional(),
  highLabel: z.string().optional(),
});

export const LinearScaleQuestionConfigSchema = BaseQuestionConfigSchema.extend({
  type: z.literal(T.QuestionType.LINEAR_SCALE),
  minValue: z.number(),
  maxValue: z.number(),
  step: z.number().optional(),
  lowLabel: z.string().optional(),
  highLabel: z.string().optional(),
  showNumbers: z.boolean().optional(),
});

export const FileQuestionConfigSchema = BaseQuestionConfigSchema.extend({
  type: z.literal(T.QuestionType.FILE),
  allowedTypes: z.array(z.string()).optional(),
  maxFileSize: z.number().optional(),
  maxFiles: z.number().optional(),
  multiple: z.boolean().optional(),
  uploadText: z.string().optional(),
});

export const SignatureQuestionConfigSchema = BaseQuestionConfigSchema.extend({
  type: z.literal(T.QuestionType.SIGNATURE),
  canvasWidth: z.number().optional(),
  canvasHeight: z.number().optional(),
  penColor: z.string().optional(),
  backgroundColor: z.string().optional(),
});

export const PaymentQuestionConfigSchema = BaseQuestionConfigSchema.extend({
  type: z.literal(T.QuestionType.PAYMENT),
  amount: z.number().optional(),
  currency: z.string(),
  fixedAmount: z.boolean().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  paymentDescription: z.string().optional(),
  acceptedMethods: z.array(PaymentMethodSchema).optional(),
});

export const QuestionConfigSchema = z.discriminatedUnion('type', [
  TextQuestionConfigSchema,
  TextareaQuestionConfigSchema,
  EmailQuestionConfigSchema,
  PhoneQuestionConfigSchema,
  UrlQuestionConfigSchema,
  NumberQuestionConfigSchema,
  DateQuestionConfigSchema,
  TimeQuestionConfigSchema,
  MultipleChoiceQuestionConfigSchema,
  DropdownQuestionConfigSchema,
  CheckboxesQuestionConfigSchema,
  RatingQuestionConfigSchema,
  LinearScaleQuestionConfigSchema,
  FileQuestionConfigSchema,
  SignatureQuestionConfigSchema,
  PaymentQuestionConfigSchema,
]);

// ===============================
// Validation Rule Schemas
// ===============================

export const BaseValidationRuleSchema = z.object({
  errorMessage: z.string().optional(),
  enabled: z.boolean().optional(),
});

export const RequiredValidationSchema = BaseValidationRuleSchema.extend({
  type: z.literal('required'),
  required: z.literal(true),
});

export const LengthValidationSchema = BaseValidationRuleSchema.extend({
  type: z.literal('length'),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
});

export const NumericValidationSchema = BaseValidationRuleSchema.extend({
  type: z.literal('numeric'),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  decimalPlaces: z.number().optional(),
});

export const PatternValidationSchema = BaseValidationRuleSchema.extend({
  type: z.literal('pattern'),
  pattern: z.string(),
  flags: z.string().optional(),
  caseSensitive: z.boolean().optional(),
});

export const EmailValidationSchema = BaseValidationRuleSchema.extend({
  type: z.literal('email'),
  allowedDomains: z.array(z.string()).optional(),
  blockedDomains: z.array(z.string()).optional(),
  requireTLD: z.boolean().optional(),
});

export const UrlValidationSchema = BaseValidationRuleSchema.extend({
  type: z.literal('url'),
  allowedSchemes: z.array(z.string()).optional(),
  requireScheme: z.boolean().optional(),
  allowedDomains: z.array(z.string()).optional(),
});

export const PhoneValidationSchema = BaseValidationRuleSchema.extend({
  type: z.literal('phone'),
  format: PhoneFormatSchema.optional(),
  country: z.string().optional(),
  allowInternational: z.boolean().optional(),
});

export const DateValidationSchema = BaseValidationRuleSchema.extend({
  type: z.literal('date'),
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
  allowPast: z.boolean().optional(),
  allowFuture: z.boolean().optional(),
  excludeDates: z.array(z.string()).optional(),
  excludeWeekends: z.boolean().optional(),
});

export const TimeValidationSchema = BaseValidationRuleSchema.extend({
  type: z.literal('time'),
  minTime: z.string().optional(),
  maxTime: z.string().optional(),
  allowedTimeSlots: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
  excludeTimeSlots: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
});

export const FileValidationSchema = BaseValidationRuleSchema.extend({
  type: z.literal('file'),
  allowedTypes: z.array(z.string()).optional(),
  blockedTypes: z.array(z.string()).optional(),
  maxFileSize: z.number().optional(),
  minFileSize: z.number().optional(),
  maxFiles: z.number().optional(),
  minFiles: z.number().optional(),
  allowedExtensions: z.array(z.string()).optional(),
  blockedExtensions: z.array(z.string()).optional(),
});

export const ChoiceValidationSchema = BaseValidationRuleSchema.extend({
  type: z.literal('choice'),
  minSelections: z.number().optional(),
  maxSelections: z.number().optional(),
  requiredOptions: z.array(z.string()).optional(),
  forbiddenCombinations: z.array(z.array(z.string())).optional(),
});

export const RatingValidationSchema = BaseValidationRuleSchema.extend({
  type: z.literal('rating'),
  minRating: z.number().optional(),
  maxRating: z.number().optional(),
  requiredRating: z.boolean().optional(),
});

export const CustomValidationSchema = BaseValidationRuleSchema.extend({
  type: z.literal('custom'),
  validator: z.string().or(z.function().returns(z.union([z.boolean(), z.string()]))),
  async: z.boolean().optional(),
  dependencies: z.array(z.string()).optional(),
});


// ===============================
// Conditional Logic Schemas
// ===============================

export const LogicConditionSchema = z.object({
  id: z.string().optional(),
  questionId: z.string(),
  operator: LogicOperatorSchema,
  value: z.any(),
  caseSensitive: z.boolean().optional(),
  negate: z.boolean().optional(),
  errorMessage: z.string().optional(),
});

export const BaseConditionalActionSchema = z.object({
  action: ConditionalActionSchema,
  enabled: z.boolean().optional(),
  delay: z.number().optional(),
});

export const ShowHideActionSchema = BaseConditionalActionSchema.extend({
  action: z.union([z.literal(T.ConditionalAction.SHOW), z.literal(T.ConditionalAction.HIDE)]),
  animation: z.union([z.literal('fade'), z.literal('slide'), z.literal('none')]).optional(),
  animationDuration: z.number().optional(),
});

export const RequireActionSchema = BaseConditionalActionSchema.extend({
  action: z.union([z.literal(T.ConditionalAction.REQUIRE), z.literal(T.ConditionalAction.MAKE_OPTIONAL)]),
  validationMessage: z.string().optional(),
});

export const JumpToActionSchema = BaseConditionalActionSchema.extend({
  action: z.literal(T.ConditionalAction.JUMP_TO),
  targetQuestionId: z.string(),
  skipValidation: z.boolean().optional(),
});

export const JumpToPageActionSchema = BaseConditionalActionSchema.extend({
    action: z.literal(T.ConditionalAction.JUMP_TO_PAGE),
    targetPage: z.union([z.string(), z.number()]),
    skipValidation: z.boolean().optional(),
});

export const SetValueActionSchema = BaseConditionalActionSchema.extend({
    action: z.literal(T.ConditionalAction.SET_VALUE),
    targetQuestionId: z.string(),
    value: z.any(),
    triggerValidation: z.boolean().optional(),
});

export const ClearValueActionSchema = BaseConditionalActionSchema.extend({
    action: z.literal(T.ConditionalAction.CLEAR_VALUE),
    targetQuestionId: z.string(),
    triggerValidation: z.boolean().optional(),
});

export const EnableDisableActionSchema = BaseConditionalActionSchema.extend({
    action: z.union([z.literal(T.ConditionalAction.ENABLE), z.literal(T.ConditionalAction.DISABLE)]),
    disabledStyle: z.union([z.literal('grayed_out'), z.literal('hidden'), z.literal('readonly')]).optional(),
});

export const ShowMessageActionSchema = BaseConditionalActionSchema.extend({
    action: z.literal(T.ConditionalAction.SHOW_MESSAGE),
    message: z.string(),
    messageType: z.union([z.literal('info'), z.literal('warning'), z.literal('error'), z.literal('success')]).optional(),
    duration: z.number().optional(),
    position: z.union([z.literal('above'), z.literal('below'), z.literal('inline'), z.literal('popup')]).optional(),
});

export const RedirectActionSchema = BaseConditionalActionSchema.extend({
    action: z.literal(T.ConditionalAction.REDIRECT),
    url: z.string(),
    newWindow: z.boolean().optional(),
    confirmationMessage: z.string().optional(),
});

export const SubmitFormActionSchema = BaseConditionalActionSchema.extend({
    action: z.literal(T.ConditionalAction.SUBMIT_FORM),
    validateBeforeSubmit: z.boolean().optional(),
    customEndpoint: z.string().optional(),
});

export const SkipActionSchema = BaseConditionalActionSchema.extend({
    action: z.literal(T.ConditionalAction.SKIP),
    skipCount: z.number().optional(),
});

// ===============================
// Main FormConfig Schema
// ===============================

export const FormConfigSchema: any = z.lazy(() =>
  z.object({
    title: z.string(),
    description: z.string().optional(),
    questions: z.array(QuestionConfigSchema),
    settings: FormSettingsSchema,
    branding: BrandingConfigSchema.optional(),
    metadata: FormMetadataSchema.optional(),
  })
);

// ===============================
// Utility Functions
// ===============================

/**
 * Validates a form configuration object against the Zod schema.
 * @param config The form configuration object.
 * @returns A structured result indicating success or failure with errors.
 */
export function validateFormConfig(config: unknown): { success: boolean; data?: T.FormConfig; error?: z.ZodError } {
  return FormConfigSchema.safeParse(config);
}

/**
 * Serializes a form configuration object to a JSON string.
 * @param config The form configuration object.
 * @returns A JSON string representation of the configuration.
 */
export function serializeFormConfig(config: T.FormConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Deserializes a JSON string into a form configuration object.
 * @param json The JSON string.
 * @returns A form configuration object.
 * @throws If the JSON is invalid or doesn't match the schema.
 */
export function deserializeFormConfig(json: string): T.FormConfig {
  const data = JSON.parse(json);
  const result = FormConfigSchema.parse(data);
  return result;
}

/**
 * Get all validation rules for a specific question from a form config.
 * @param config The form configuration.
 * @param questionId The ID of the question.
 * @returns An array of validation rules, or undefined if not found.
 */
export function getValidationRulesForQuestion(config: T.FormConfig, questionId: string): T.ValidationRule[] | undefined {
  const question = config.questions.find(q => q.id === questionId);
  return question?.validation?.rules;
}

/**
 * Get all conditional logic rules that affect a specific question.
 * A logic rule affects a question if the question ID is in the `targetQuestionId` of one of its actions.
 * @param config The form configuration.
 * @param questionId The ID of the question.
 * @returns An array of conditional logic rules.
 */
export function getLogicRulesAffectingQuestion(config: T.FormConfig, questionId: string): T.ConditionalLogic[] {
  const affectingLogic: T.ConditionalLogic[] = [];

  for (const question of config.questions) {
    if (question.logic) {
        for(const action of question.logic.actions) {
            if ('targetQuestionId' in action && action.targetQuestionId === questionId) {
                affectingLogic.push(question.logic);
                break; 
            }
        }
    }
  }

  return affectingLogic;
}


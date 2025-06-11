export declare enum QuestionType {
    TEXT = "text",
    EMAIL = "email",
    NUMBER = "number",
    CHOICE = "choice",
    RATING = "rating",
    FILE = "file",
    DATE = "date",
    TIME = "time",
    TEXTAREA = "textarea",
    DROPDOWN = "dropdown",
    CHECKBOXES = "checkboxes",
    LINEAR_SCALE = "linear_scale",
    MULTIPLE_CHOICE = "multiple_choice",
    PHONE = "phone",
    URL = "url",
    SIGNATURE = "signature",
    PAYMENT = "payment",
    MATRIX = "matrix"
}
export declare enum FormTheme {
    DEFAULT = "default",
    MINIMAL = "minimal",
    MODERN = "modern",
    CLASSIC = "classic",
    CUSTOM = "custom"
}
export declare enum SubmissionBehavior {
    REDIRECT = "redirect",
    MESSAGE = "message",
    CLOSE = "close",
    RELOAD = "reload"
}
export declare enum ValidationType {
    REQUIRED = "required",
    MIN_LENGTH = "min_length",
    MAX_LENGTH = "max_length",
    MIN_VALUE = "min_value",
    MAX_VALUE = "max_value",
    PATTERN = "pattern",
    EMAIL_FORMAT = "email_format",
    URL_FORMAT = "url_format",
    PHONE_FORMAT = "phone_format",
    DATE_RANGE = "date_range",
    FILE_TYPE = "file_type",
    FILE_SIZE = "file_size"
}
export declare enum LogicOperator {
    EQUALS = "equals",
    NOT_EQUALS = "not_equals",
    CONTAINS = "contains",
    NOT_CONTAINS = "not_contains",
    GREATER_THAN = "greater_than",
    LESS_THAN = "less_than",
    GREATER_EQUAL = "greater_equal",
    LESS_EQUAL = "less_equal",
    IS_EMPTY = "is_empty",
    IS_NOT_EMPTY = "is_not_empty"
}
export declare enum QuestionLayout {
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal",
    GRID = "grid"
}
export declare enum RatingStyle {
    STARS = "stars",
    NUMBERS = "numbers",
    THUMBS = "thumbs",
    HEARTS = "hearts",
    FACES = "faces"
}
export declare enum PhoneFormat {
    US = "US",
    INTERNATIONAL = "INTERNATIONAL",
    CUSTOM = "CUSTOM"
}
export declare enum TimeFormat {
    TWELVE_HOUR = "12",
    TWENTY_FOUR_HOUR = "24"
}
export declare enum PaymentMethod {
    CARD = "card",
    PAYPAL = "paypal",
    APPLE_PAY = "apple_pay",
    GOOGLE_PAY = "google_pay"
}
export declare enum MatrixResponseType {
    SINGLE_SELECT = "single_select",
    MULTI_SELECT = "multi_select",
    TEXT_INPUT = "text_input",
    RATING = "rating"
}
export interface MatrixCellValidation {
    required?: boolean | undefined;
    minLength?: number | undefined;
    maxLength?: number | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
    pattern?: string | undefined;
    errorMessage?: string | undefined;
}
export interface MatrixRow {
    id?: string | undefined;
    text: string;
    value?: string | undefined;
    required?: boolean | undefined;
    cellValidation?: MatrixCellValidation | undefined;
}
export interface MatrixColumn {
    id?: string | undefined;
    text: string;
    value?: string | undefined;
    responseType?: MatrixResponseType | undefined;
    options?: QuestionOption[] | undefined;
    width?: string | undefined;
}
export interface FormConfig {
    title: string;
    description?: string | undefined;
    questions: QuestionConfig[];
    settings: FormSettings;
    branding?: BrandingConfig | undefined;
    metadata?: FormMetadata | undefined;
}
export interface BaseQuestionConfig {
    id?: string | undefined;
    label: string;
    description?: string | undefined;
    required: boolean;
    placeholder?: string | undefined;
    validation?: ValidationRules | undefined;
    logic?: ConditionalLogic | undefined;
    order?: number | undefined;
}
export interface TextQuestionConfig extends BaseQuestionConfig {
    type: QuestionType.TEXT;
    minLength?: number | undefined;
    maxLength?: number | undefined;
    format?: string | undefined;
}
export interface TextareaQuestionConfig extends BaseQuestionConfig {
    type: QuestionType.TEXTAREA;
    minLength?: number | undefined;
    maxLength?: number | undefined;
    rows?: number | undefined;
    autoResize?: boolean | undefined;
}
export interface EmailQuestionConfig extends BaseQuestionConfig {
    type: QuestionType.EMAIL;
    validateFormat?: boolean | undefined;
    suggestDomains?: boolean | undefined;
}
export interface PhoneQuestionConfig extends BaseQuestionConfig {
    type: QuestionType.PHONE;
    format?: PhoneFormat | undefined;
    customPattern?: string | undefined;
    autoFormat?: boolean | undefined;
}
export interface UrlQuestionConfig extends BaseQuestionConfig {
    type: QuestionType.URL;
    validateFormat?: boolean | undefined;
    allowedSchemes?: string[] | undefined;
}
export interface NumberQuestionConfig extends BaseQuestionConfig {
    type: QuestionType.NUMBER;
    min?: number | undefined;
    max?: number | undefined;
    step?: number | undefined;
    decimalPlaces?: number | undefined;
    useThousandSeparator?: boolean | undefined;
    currency?: string | undefined;
}
export interface DateQuestionConfig extends BaseQuestionConfig {
    type: QuestionType.DATE;
    minDate?: string | undefined;
    maxDate?: string | undefined;
    dateFormat?: string | undefined;
    includeTime?: boolean | undefined;
    defaultDate?: string | undefined;
}
export interface TimeQuestionConfig extends BaseQuestionConfig {
    type: QuestionType.TIME;
    format?: TimeFormat | undefined;
    minuteStep?: number | undefined;
    defaultTime?: string | undefined;
}
export interface MultipleChoiceQuestionConfig extends BaseQuestionConfig {
    type: QuestionType.MULTIPLE_CHOICE;
    options: QuestionOption[];
    allowOther?: boolean | undefined;
    randomizeOptions?: boolean | undefined;
    layout?: QuestionLayout | undefined;
}
export interface DropdownQuestionConfig extends BaseQuestionConfig {
    type: QuestionType.DROPDOWN;
    options: QuestionOption[];
    allowOther?: boolean | undefined;
    searchable?: boolean | undefined;
    dropdownPlaceholder?: string | undefined;
    multiSelect?: boolean | undefined;
    maxSelections?: number | undefined;
    minSelections?: number | undefined;
    imageOptions?: boolean | undefined;
    searchConfig?: {
        minSearchLength?: number | undefined;
        searchPlaceholder?: string | undefined;
        highlightMatches?: boolean | undefined;
        fuzzySearch?: boolean | undefined;
    } | undefined;
}
export interface CheckboxesQuestionConfig extends BaseQuestionConfig {
    type: QuestionType.CHECKBOXES;
    options: QuestionOption[];
    minSelections?: number | undefined;
    maxSelections?: number | undefined;
    allowOther?: boolean | undefined;
    randomizeOptions?: boolean | undefined;
    layout?: QuestionLayout | undefined;
    imageOptions?: boolean | undefined;
    selectionConstraints?: {
        forbiddenCombinations?: string[][] | undefined;
        requiredCombinations?: string[][] | undefined;
        mutuallyExclusive?: string[][] | undefined;
    } | undefined;
    searchOptions?: {
        enableSearch?: boolean | undefined;
        searchPlaceholder?: string | undefined;
        minSearchLength?: number | undefined;
    } | undefined;
}
export interface RatingQuestionConfig extends BaseQuestionConfig {
    type: QuestionType.RATING;
    minRating: number;
    maxRating: number;
    ratingLabels?: string[] | undefined;
    style?: RatingStyle | undefined;
    showNumbers?: boolean | undefined;
    lowLabel?: string | undefined;
    highLabel?: string | undefined;
}
export interface LinearScaleQuestionConfig extends BaseQuestionConfig {
    type: QuestionType.LINEAR_SCALE;
    minValue: number;
    maxValue: number;
    step?: number | undefined;
    lowLabel?: string | undefined;
    highLabel?: string | undefined;
    showNumbers?: boolean | undefined;
}
export interface FileQuestionConfig extends BaseQuestionConfig {
    type: QuestionType.FILE;
    allowedTypes?: string[] | undefined;
    maxFileSize?: number | undefined;
    maxFiles?: number | undefined;
    multiple?: boolean | undefined;
    uploadText?: string | undefined;
    enableDragDrop?: boolean | undefined;
    dragDropHint?: string | undefined;
    showProgress?: boolean | undefined;
    showPreview?: boolean | undefined;
    fileRestrictions?: {
        allowedExtensions?: string[] | undefined;
        blockedExtensions?: string[] | undefined;
        allowedMimeTypes?: string[] | undefined;
        blockedMimeTypes?: string[] | undefined;
    } | undefined;
    sizeConstraints?: {
        minFileSize?: number | undefined;
        maxTotalSize?: number | undefined;
    } | undefined;
}
export interface SignatureQuestionConfig extends BaseQuestionConfig {
    type: QuestionType.SIGNATURE;
    canvasWidth?: number | undefined;
    canvasHeight?: number | undefined;
    penColor?: string | undefined;
    backgroundColor?: string | undefined;
}
export interface MatrixQuestionConfig extends BaseQuestionConfig {
    type: QuestionType.MATRIX;
    rows: MatrixRow[];
    columns: MatrixColumn[];
    defaultResponseType: MatrixResponseType;
    allowMultiplePerRow?: boolean | undefined;
    requireAllRows?: boolean | undefined;
    randomizeRows?: boolean | undefined;
    randomizeColumns?: boolean | undefined;
    mobileLayout?: 'stacked' | 'scrollable' | 'accordion' | undefined;
    showHeadersOnMobile?: boolean | undefined;
    defaultCellValidation?: MatrixCellValidation | undefined;
    customClasses?: {
        table?: string | undefined;
        row?: string | undefined;
        column?: string | undefined;
        cell?: string | undefined;
    } | undefined;
}
export interface PaymentQuestionConfig extends BaseQuestionConfig {
    type: QuestionType.PAYMENT;
    amount?: number | undefined;
    currency: string;
    fixedAmount?: boolean | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
    paymentDescription?: string | undefined;
    acceptedMethods?: PaymentMethod[] | undefined;
}
export type QuestionConfig = TextQuestionConfig | TextareaQuestionConfig | EmailQuestionConfig | PhoneQuestionConfig | UrlQuestionConfig | NumberQuestionConfig | DateQuestionConfig | TimeQuestionConfig | MultipleChoiceQuestionConfig | DropdownQuestionConfig | CheckboxesQuestionConfig | RatingQuestionConfig | LinearScaleQuestionConfig | FileQuestionConfig | SignatureQuestionConfig | MatrixQuestionConfig | PaymentQuestionConfig;
export declare function questionHasOptions(question: QuestionConfig): question is MultipleChoiceQuestionConfig | DropdownQuestionConfig | CheckboxesQuestionConfig;
export declare function isTextBasedQuestion(question: QuestionConfig): question is TextQuestionConfig | TextareaQuestionConfig | EmailQuestionConfig | PhoneQuestionConfig | UrlQuestionConfig;
export declare function isNumericQuestion(question: QuestionConfig): question is NumberQuestionConfig | RatingQuestionConfig | LinearScaleQuestionConfig;
export declare function isDateTimeQuestion(question: QuestionConfig): question is DateQuestionConfig | TimeQuestionConfig;
export declare function isFileQuestion(question: QuestionConfig): question is FileQuestionConfig | SignatureQuestionConfig;
export declare function isMatrixQuestion(question: QuestionConfig): question is MatrixQuestionConfig;
export type QuestionTypeOf<T extends QuestionConfig> = T['type'];
export type QuestionConfigByType<T extends QuestionType> = T extends QuestionType.TEXT ? TextQuestionConfig : T extends QuestionType.TEXTAREA ? TextareaQuestionConfig : T extends QuestionType.EMAIL ? EmailQuestionConfig : T extends QuestionType.PHONE ? PhoneQuestionConfig : T extends QuestionType.URL ? UrlQuestionConfig : T extends QuestionType.NUMBER ? NumberQuestionConfig : T extends QuestionType.DATE ? DateQuestionConfig : T extends QuestionType.TIME ? TimeQuestionConfig : T extends QuestionType.MULTIPLE_CHOICE ? MultipleChoiceQuestionConfig : T extends QuestionType.DROPDOWN ? DropdownQuestionConfig : T extends QuestionType.CHECKBOXES ? CheckboxesQuestionConfig : T extends QuestionType.RATING ? RatingQuestionConfig : T extends QuestionType.LINEAR_SCALE ? LinearScaleQuestionConfig : T extends QuestionType.FILE ? FileQuestionConfig : T extends QuestionType.SIGNATURE ? SignatureQuestionConfig : T extends QuestionType.MATRIX ? MatrixQuestionConfig : T extends QuestionType.PAYMENT ? PaymentQuestionConfig : never;
export type QuestionConfigFactory<T extends QuestionType> = (baseConfig: Omit<BaseQuestionConfig, 'id'> & {
    id?: string;
}) => QuestionConfigByType<T>;
export type ChoiceQuestionType = QuestionType.MULTIPLE_CHOICE | QuestionType.DROPDOWN | QuestionType.CHECKBOXES;
export type NumericQuestionType = QuestionType.NUMBER | QuestionType.RATING | QuestionType.LINEAR_SCALE;
export type TextQuestionType = QuestionType.TEXT | QuestionType.TEXTAREA | QuestionType.EMAIL | QuestionType.PHONE | QuestionType.URL;
export declare function isRequiredValidation(rule: ValidationRule): rule is RequiredValidation;
export declare function isLengthValidation(rule: ValidationRule): rule is LengthValidation;
export declare function isNumericValidation(rule: ValidationRule): rule is NumericValidation;
export declare function isPatternValidation(rule: ValidationRule): rule is PatternValidation;
export declare function isEmailValidation(rule: ValidationRule): rule is EmailValidation;
export declare function isUrlValidation(rule: ValidationRule): rule is UrlValidation;
export declare function isPhoneValidation(rule: ValidationRule): rule is PhoneValidation;
export declare function isDateValidation(rule: ValidationRule): rule is DateValidation;
export declare function isTimeValidation(rule: ValidationRule): rule is TimeValidation;
export declare function isFileValidation(rule: ValidationRule): rule is FileValidation;
export declare function isChoiceValidation(rule: ValidationRule): rule is ChoiceValidation;
export declare function isRatingValidation(rule: ValidationRule): rule is RatingValidation;
export declare function isCustomValidation(rule: ValidationRule): rule is CustomValidation;
export declare function getCompatibleValidationTypes(questionType: QuestionType): ValidationRule['type'][];
export declare function isValidationRuleCompatible(rule: ValidationRule, questionType: QuestionType): boolean;
export declare function filterCompatibleValidationRules(rules: ValidationRule[], questionType: QuestionType): ValidationRule[];
export type ValidationRulesForQuestionType<T extends QuestionType> = T extends TextQuestionType ? (RequiredValidation | LengthValidation | PatternValidation | CustomValidation) : T extends QuestionType.EMAIL ? (RequiredValidation | LengthValidation | PatternValidation | EmailValidation | CustomValidation) : T extends QuestionType.PHONE ? (RequiredValidation | LengthValidation | PatternValidation | PhoneValidation | CustomValidation) : T extends QuestionType.URL ? (RequiredValidation | LengthValidation | PatternValidation | UrlValidation | CustomValidation) : T extends NumericQuestionType ? (RequiredValidation | NumericValidation | CustomValidation) : T extends QuestionType.DATE ? (RequiredValidation | DateValidation | CustomValidation) : T extends QuestionType.TIME ? (RequiredValidation | TimeValidation | CustomValidation) : T extends ChoiceQuestionType ? (RequiredValidation | ChoiceValidation | CustomValidation) : T extends QuestionType.FILE | QuestionType.SIGNATURE ? (RequiredValidation | FileValidation | CustomValidation) : T extends QuestionType.MATRIX ? (RequiredValidation | ChoiceValidation | CustomValidation) : T extends QuestionType.PAYMENT ? (RequiredValidation | NumericValidation | CustomValidation) : RequiredValidation | CustomValidation;
export declare function createValidationRulesForQuestion<T extends QuestionType>(rules: ValidationRulesForQuestionType<T>[]): ValidationRules;
export declare function combineValidationRules(...ruleSets: ValidationRules[]): ValidationRules;
export declare function createRequiredRule(errorMessage?: string): RequiredValidation;
export declare function createLengthRule(options: {
    minLength?: number;
    maxLength?: number;
    errorMessage?: string;
}): LengthValidation;
export declare function createNumericRule(options: {
    min?: number;
    max?: number;
    step?: number;
    decimalPlaces?: number;
    errorMessage?: string;
}): NumericValidation;
export declare function createPatternRule(pattern: string, options?: {
    flags?: string;
    caseSensitive?: boolean;
    errorMessage?: string;
}): PatternValidation;
export declare function createEmailRule(options?: {
    allowedDomains?: string[];
    blockedDomains?: string[];
    requireTLD?: boolean;
    errorMessage?: string;
}): EmailValidation;
export declare function createChoiceRule(options: {
    minSelections?: number;
    maxSelections?: number;
    requiredOptions?: string[];
    forbiddenCombinations?: string[][];
    errorMessage?: string;
}): ChoiceValidation;
export declare function isShowHideAction(action: ConditionalActionConfig): action is ShowHideAction;
export declare function isRequireAction(action: ConditionalActionConfig): action is RequireAction;
export declare function isJumpToAction(action: ConditionalActionConfig): action is JumpToAction;
export declare function isJumpToPageAction(action: ConditionalActionConfig): action is JumpToPageAction;
export declare function isSetValueAction(action: ConditionalActionConfig): action is SetValueAction;
export declare function isClearValueAction(action: ConditionalActionConfig): action is ClearValueAction;
export declare function isEnableDisableAction(action: ConditionalActionConfig): action is EnableDisableAction;
export declare function isShowMessageAction(action: ConditionalActionConfig): action is ShowMessageAction;
export declare function isRedirectAction(action: ConditionalActionConfig): action is RedirectAction;
export declare function isSubmitFormAction(action: ConditionalActionConfig): action is SubmitFormAction;
export declare function isSkipAction(action: ConditionalActionConfig): action is SkipAction;
export declare function getReferencedQuestionIds(logic: ConditionalLogic): string[];
export declare function logicReferencesQuestion(logic: ConditionalLogic, questionId: string): boolean;
export declare function validateLogicReferences(logic: ConditionalLogic, existingQuestionIds: string[]): {
    isValid: boolean;
    missingQuestions: string[];
};
export declare function createSimpleShowHideLogic(questionId: string, triggerQuestionId: string, operator: LogicOperator, value: any, action?: 'show' | 'hide'): ConditionalLogic;
export declare function createRequiredLogic(questionId: string, triggerQuestionId: string, operator: LogicOperator, value: any, validationMessage?: string): ConditionalLogic;
export declare function createJumpLogic(triggerQuestionId: string, operator: LogicOperator, value: any, targetQuestionId: string, skipValidation?: boolean): ConditionalLogic;
export type QuestionTargetingAction = JumpToAction | SetValueAction | ClearValueAction;
export type QuestionBehaviorAction = ShowHideAction | RequireAction | EnableDisableAction;
export type FormFlowAction = JumpToAction | JumpToPageAction | SubmitFormAction | SkipAction;
export type FeedbackAction = ShowMessageAction | RedirectAction;
export interface FormSettings {
    showProgressBar?: boolean | undefined;
    allowDrafts?: boolean | undefined;
    showQuestionNumbers?: boolean | undefined;
    shuffleQuestions?: boolean | undefined;
    maxSubmissions?: number | undefined;
    requireAuth?: boolean | undefined;
    collectEmail?: boolean | undefined;
    closeDate?: string | undefined;
    openDate?: string | undefined;
    submissionBehavior: SubmissionBehavior;
    submissionMessage?: string | undefined;
    redirectUrl?: string | undefined;
    sendConfirmationEmail?: boolean | undefined;
    allowMultipleSubmissions?: boolean | undefined;
}
export interface BrandingConfig {
    theme: FormTheme;
    primaryColor?: string | undefined;
    secondaryColor?: string | undefined;
    background?: string | undefined;
    customCss?: string | undefined;
    logoUrl?: string | undefined;
    fontFamily?: string | undefined;
    buttonStyle?: ButtonStyle | undefined;
}
export interface FormMetadata {
    tags?: string[] | undefined;
    category?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    createdBy?: string | undefined;
    workspaceId?: string | undefined;
    isPublished?: boolean | undefined;
    isArchived?: boolean | undefined;
    version?: number | undefined;
}
export interface ButtonStyle {
    backgroundColor?: string | undefined;
    textColor?: string | undefined;
    borderRadius?: number | undefined;
    border?: string | undefined;
    fontSize?: number | undefined;
    padding?: string | undefined;
}
export interface QuestionOption {
    id?: string | undefined;
    text: string;
    value?: string | undefined;
    isDefault?: boolean | undefined;
    imageUrl?: string | undefined;
    metadata?: Record<string, any> | undefined;
}
export interface BaseValidationRule {
    errorMessage?: string | undefined;
    enabled?: boolean | undefined;
}
export interface RequiredValidation extends BaseValidationRule {
    type: 'required';
    required: true;
}
export interface LengthValidation extends BaseValidationRule {
    type: 'length';
    minLength?: number | undefined;
    maxLength?: number | undefined;
}
export interface NumericValidation extends BaseValidationRule {
    type: 'numeric';
    min?: number | undefined;
    max?: number | undefined;
    step?: number | undefined;
    decimalPlaces?: number | undefined;
}
export interface PatternValidation extends BaseValidationRule {
    type: 'pattern';
    pattern: string;
    flags?: string | undefined;
    caseSensitive?: boolean | undefined;
}
export interface EmailValidation extends BaseValidationRule {
    type: 'email';
    allowedDomains?: string[] | undefined;
    blockedDomains?: string[] | undefined;
    requireTLD?: boolean | undefined;
}
export interface UrlValidation extends BaseValidationRule {
    type: 'url';
    allowedSchemes?: string[] | undefined;
    requireScheme?: boolean | undefined;
    allowedDomains?: string[] | undefined;
}
export interface PhoneValidation extends BaseValidationRule {
    type: 'phone';
    format?: PhoneFormat | undefined;
    country?: string | undefined;
    allowInternational?: boolean | undefined;
}
export interface DateValidation extends BaseValidationRule {
    type: 'date';
    minDate?: string | undefined;
    maxDate?: string | undefined;
    allowPast?: boolean | undefined;
    allowFuture?: boolean | undefined;
    excludeDates?: string[] | undefined;
    excludeWeekends?: boolean | undefined;
}
export interface TimeValidation extends BaseValidationRule {
    type: 'time';
    minTime?: string | undefined;
    maxTime?: string | undefined;
    allowedTimeSlots?: Array<{
        start: string;
        end: string;
    }> | undefined;
    excludeTimeSlots?: Array<{
        start: string;
        end: string;
    }> | undefined;
}
export interface FileValidation extends BaseValidationRule {
    type: 'file';
    allowedTypes?: string[] | undefined;
    blockedTypes?: string[] | undefined;
    maxFileSize?: number | undefined;
    minFileSize?: number | undefined;
    maxFiles?: number | undefined;
    minFiles?: number | undefined;
    allowedExtensions?: string[] | undefined;
    blockedExtensions?: string[] | undefined;
}
export interface ChoiceValidation extends BaseValidationRule {
    type: 'choice';
    minSelections?: number | undefined;
    maxSelections?: number | undefined;
    requiredOptions?: string[] | undefined;
    forbiddenCombinations?: string[][] | undefined;
}
export interface RatingValidation extends BaseValidationRule {
    type: 'rating';
    minRating?: number | undefined;
    maxRating?: number | undefined;
    requiredRating?: boolean | undefined;
}
export interface CustomValidation extends BaseValidationRule {
    type: 'custom';
    validator: string | ((value: any, context?: any) => boolean | string);
    async?: boolean | undefined;
    dependencies?: string[] | undefined;
}
export type ValidationRule = RequiredValidation | LengthValidation | NumericValidation | PatternValidation | EmailValidation | UrlValidation | PhoneValidation | DateValidation | TimeValidation | FileValidation | ChoiceValidation | RatingValidation | CustomValidation;
export interface ValidationRules {
    rules?: ValidationRule[] | undefined;
    validateOnChange?: boolean | undefined;
    validateOnBlur?: boolean | undefined;
    stopOnFirstError?: boolean | undefined;
    customMessages?: Partial<Record<ValidationRule['type'], string>> | undefined;
    dependencies?: string[] | undefined;
    required?: boolean | undefined;
    minLength?: number | undefined;
    maxLength?: number | undefined;
    minValue?: number | undefined;
    maxValue?: number | undefined;
    pattern?: string | undefined;
    errorMessage?: string | undefined;
    emailFormat?: boolean | undefined;
    urlFormat?: boolean | undefined;
    phoneFormat?: boolean | undefined;
    dateRange?: {
        min?: string | undefined;
        max?: string | undefined;
    } | undefined;
    fileType?: {
        allowed?: string[] | undefined;
        blocked?: string[] | undefined;
    } | undefined;
    fileSize?: {
        min?: number | undefined;
        max?: number | undefined;
    } | undefined;
    customValidation?: string | undefined;
    additionalRules?: Record<string, any> | undefined;
}
export declare enum ConditionalAction {
    SHOW = "show",
    HIDE = "hide",
    REQUIRE = "require",
    MAKE_OPTIONAL = "make_optional",
    SKIP = "skip",
    JUMP_TO = "jump_to",
    JUMP_TO_PAGE = "jump_to_page",
    SUBMIT_FORM = "submit_form",
    SET_VALUE = "set_value",
    CLEAR_VALUE = "clear_value",
    DISABLE = "disable",
    ENABLE = "enable",
    SHOW_MESSAGE = "show_message",
    REDIRECT = "redirect"
}
export declare enum LogicCombinator {
    AND = "and",
    OR = "or",
    XOR = "xor",
    NAND = "nand",
    NOR = "nor"
}
export interface BaseConditionalAction {
    action: ConditionalAction;
    enabled?: boolean | undefined;
    delay?: number | undefined;
}
export interface ShowHideAction extends BaseConditionalAction {
    action: ConditionalAction.SHOW | ConditionalAction.HIDE;
    animation?: 'fade' | 'slide' | 'none' | undefined;
    animationDuration?: number | undefined;
}
export interface RequireAction extends BaseConditionalAction {
    action: ConditionalAction.REQUIRE | ConditionalAction.MAKE_OPTIONAL;
    validationMessage?: string | undefined;
}
export interface JumpToAction extends BaseConditionalAction {
    action: ConditionalAction.JUMP_TO;
    targetQuestionId: string;
    skipValidation?: boolean | undefined;
}
export interface JumpToPageAction extends BaseConditionalAction {
    action: ConditionalAction.JUMP_TO_PAGE;
    targetPage: string | number;
    skipValidation?: boolean | undefined;
}
export interface SetValueAction extends BaseConditionalAction {
    action: ConditionalAction.SET_VALUE;
    targetQuestionId: string;
    value: any;
    triggerValidation?: boolean | undefined;
}
export interface ClearValueAction extends BaseConditionalAction {
    action: ConditionalAction.CLEAR_VALUE;
    targetQuestionId: string;
    triggerValidation?: boolean | undefined;
}
export interface EnableDisableAction extends BaseConditionalAction {
    action: ConditionalAction.ENABLE | ConditionalAction.DISABLE;
    disabledStyle?: 'grayed_out' | 'hidden' | 'readonly' | undefined;
}
export interface ShowMessageAction extends BaseConditionalAction {
    action: ConditionalAction.SHOW_MESSAGE;
    message: string;
    messageType?: 'info' | 'warning' | 'error' | 'success' | undefined;
    duration?: number | undefined;
    position?: 'above' | 'below' | 'inline' | 'popup' | undefined;
}
export interface RedirectAction extends BaseConditionalAction {
    action: ConditionalAction.REDIRECT;
    url: string;
    newWindow?: boolean | undefined;
    confirmationMessage?: string | undefined;
}
export interface SubmitFormAction extends BaseConditionalAction {
    action: ConditionalAction.SUBMIT_FORM;
    validateBeforeSubmit?: boolean | undefined;
    customEndpoint?: string | undefined;
}
export interface SkipAction extends BaseConditionalAction {
    action: ConditionalAction.SKIP;
    skipCount?: number | undefined;
}
export type ConditionalActionConfig = ShowHideAction | RequireAction | JumpToAction | JumpToPageAction | SetValueAction | ClearValueAction | EnableDisableAction | ShowMessageAction | RedirectAction | SubmitFormAction | SkipAction;
export interface LogicCondition {
    id?: string | undefined;
    questionId: string;
    operator: LogicOperator;
    value: any;
    caseSensitive?: boolean | undefined;
    negate?: boolean | undefined;
    errorMessage?: string | undefined;
}
export interface LogicConditionGroup {
    id?: string | undefined;
    combinator: LogicCombinator;
    conditions: LogicCondition[];
    groups?: LogicConditionGroup[] | undefined;
    negate?: boolean | undefined;
}
export interface ConditionalLogic {
    id?: string | undefined;
    name?: string | undefined;
    description?: string | undefined;
    enabled?: boolean | undefined;
    priority?: number | undefined;
    conditionGroup: LogicConditionGroup;
    actions: ConditionalActionConfig[];
    elseActions?: ConditionalActionConfig[] | undefined;
    reEvaluateOnChange?: boolean | undefined;
    triggerQuestions?: string[] | undefined;
    runOnce?: boolean | undefined;
    metadata?: {
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        createdBy?: string | undefined;
        version?: number | undefined;
        tags?: string[] | undefined;
    } | undefined;
}
export interface QuestionSettings {
    minRating?: number | undefined;
    maxRating?: number | undefined;
    ratingLabels?: string[] | undefined;
    allowedFileTypes?: string[] | undefined;
    maxFileSize?: number | undefined;
    maxFiles?: number | undefined;
    allowOther?: boolean | undefined;
    maxSelections?: number | undefined;
    maxLength?: number | undefined;
    minLength?: number | undefined;
    minDate?: string | undefined;
    maxDate?: string | undefined;
    customProperties?: Record<string, any> | undefined;
}
//# sourceMappingURL=form-config.d.ts.map
/**
 * Form Configuration Data Models
 *
 * This file contains TypeScript interfaces and Zod schemas for form configuration,
 * questions, validation rules, and conditional logic. These models are used for
 * creating and modifying Tally forms through natural language processing.
 */
// ===============================
// Enums and Constants
// ===============================
/**
 * Supported question types for Tally forms
 */
export var QuestionType;
(function (QuestionType) {
    QuestionType["TEXT"] = "text";
    QuestionType["EMAIL"] = "email";
    QuestionType["NUMBER"] = "number";
    QuestionType["CHOICE"] = "choice";
    QuestionType["RATING"] = "rating";
    QuestionType["FILE"] = "file";
    QuestionType["DATE"] = "date";
    QuestionType["TIME"] = "time";
    QuestionType["TEXTAREA"] = "textarea";
    QuestionType["DROPDOWN"] = "dropdown";
    QuestionType["CHECKBOXES"] = "checkboxes";
    QuestionType["LINEAR_SCALE"] = "linear_scale";
    QuestionType["MULTIPLE_CHOICE"] = "multiple_choice";
    QuestionType["PHONE"] = "phone";
    QuestionType["URL"] = "url";
    QuestionType["SIGNATURE"] = "signature";
    QuestionType["PAYMENT"] = "payment";
    QuestionType["MATRIX"] = "matrix";
})(QuestionType || (QuestionType = {}));
/**
 * Form display themes and styles
 */
export var FormTheme;
(function (FormTheme) {
    FormTheme["DEFAULT"] = "default";
    FormTheme["MINIMAL"] = "minimal";
    FormTheme["MODERN"] = "modern";
    FormTheme["CLASSIC"] = "classic";
    FormTheme["CUSTOM"] = "custom";
})(FormTheme || (FormTheme = {}));
/**
 * Form submission behavior options
 */
export var SubmissionBehavior;
(function (SubmissionBehavior) {
    SubmissionBehavior["REDIRECT"] = "redirect";
    SubmissionBehavior["MESSAGE"] = "message";
    SubmissionBehavior["CLOSE"] = "close";
    SubmissionBehavior["RELOAD"] = "reload";
})(SubmissionBehavior || (SubmissionBehavior = {}));
/**
 * Validation rule types
 */
export var ValidationType;
(function (ValidationType) {
    ValidationType["REQUIRED"] = "required";
    ValidationType["MIN_LENGTH"] = "min_length";
    ValidationType["MAX_LENGTH"] = "max_length";
    ValidationType["MIN_VALUE"] = "min_value";
    ValidationType["MAX_VALUE"] = "max_value";
    ValidationType["PATTERN"] = "pattern";
    ValidationType["EMAIL_FORMAT"] = "email_format";
    ValidationType["URL_FORMAT"] = "url_format";
    ValidationType["PHONE_FORMAT"] = "phone_format";
    ValidationType["DATE_RANGE"] = "date_range";
    ValidationType["FILE_TYPE"] = "file_type";
    ValidationType["FILE_SIZE"] = "file_size";
})(ValidationType || (ValidationType = {}));
/**
 * Conditional logic operators
 */
export var LogicOperator;
(function (LogicOperator) {
    LogicOperator["EQUALS"] = "equals";
    LogicOperator["NOT_EQUALS"] = "not_equals";
    LogicOperator["CONTAINS"] = "contains";
    LogicOperator["NOT_CONTAINS"] = "not_contains";
    LogicOperator["GREATER_THAN"] = "greater_than";
    LogicOperator["LESS_THAN"] = "less_than";
    LogicOperator["GREATER_EQUAL"] = "greater_equal";
    LogicOperator["LESS_EQUAL"] = "less_equal";
    LogicOperator["IS_EMPTY"] = "is_empty";
    LogicOperator["IS_NOT_EMPTY"] = "is_not_empty";
})(LogicOperator || (LogicOperator = {}));
/**
 * Question layout options for choice-based questions
 */
export var QuestionLayout;
(function (QuestionLayout) {
    QuestionLayout["VERTICAL"] = "vertical";
    QuestionLayout["HORIZONTAL"] = "horizontal";
    QuestionLayout["GRID"] = "grid";
})(QuestionLayout || (QuestionLayout = {}));
/**
 * Rating display styles
 */
export var RatingStyle;
(function (RatingStyle) {
    RatingStyle["STARS"] = "stars";
    RatingStyle["NUMBERS"] = "numbers";
    RatingStyle["THUMBS"] = "thumbs";
    RatingStyle["HEARTS"] = "hearts";
    RatingStyle["FACES"] = "faces";
})(RatingStyle || (RatingStyle = {}));
/**
 * Phone number format types
 */
export var PhoneFormat;
(function (PhoneFormat) {
    PhoneFormat["US"] = "US";
    PhoneFormat["INTERNATIONAL"] = "INTERNATIONAL";
    PhoneFormat["CUSTOM"] = "CUSTOM";
})(PhoneFormat || (PhoneFormat = {}));
/**
 * Time format options
 */
export var TimeFormat;
(function (TimeFormat) {
    TimeFormat["TWELVE_HOUR"] = "12";
    TimeFormat["TWENTY_FOUR_HOUR"] = "24";
})(TimeFormat || (TimeFormat = {}));
/**
 * Payment methods
 */
export var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CARD"] = "card";
    PaymentMethod["PAYPAL"] = "paypal";
    PaymentMethod["APPLE_PAY"] = "apple_pay";
    PaymentMethod["GOOGLE_PAY"] = "google_pay";
})(PaymentMethod || (PaymentMethod = {}));
/**
 * Matrix question response types
 */
export var MatrixResponseType;
(function (MatrixResponseType) {
    MatrixResponseType["SINGLE_SELECT"] = "single_select";
    MatrixResponseType["MULTI_SELECT"] = "multi_select";
    MatrixResponseType["TEXT_INPUT"] = "text_input";
    MatrixResponseType["RATING"] = "rating";
})(MatrixResponseType || (MatrixResponseType = {}));
// ===============================
// Type Guards and Utility Types
// ===============================
/**
 * Type guard to check if a question has options
 */
export function questionHasOptions(question) {
    return question.type === QuestionType.MULTIPLE_CHOICE ||
        question.type === QuestionType.DROPDOWN ||
        question.type === QuestionType.CHECKBOXES;
}
/**
 * Type guard to check if a question is text-based
 */
export function isTextBasedQuestion(question) {
    return question.type === QuestionType.TEXT ||
        question.type === QuestionType.TEXTAREA ||
        question.type === QuestionType.EMAIL ||
        question.type === QuestionType.PHONE ||
        question.type === QuestionType.URL;
}
/**
 * Type guard to check if a question is numeric
 */
export function isNumericQuestion(question) {
    return question.type === QuestionType.NUMBER ||
        question.type === QuestionType.RATING ||
        question.type === QuestionType.LINEAR_SCALE;
}
/**
 * Type guard to check if a question is date/time related
 */
export function isDateTimeQuestion(question) {
    return question.type === QuestionType.DATE ||
        question.type === QuestionType.TIME;
}
/**
 * Type guard to check if a question supports file uploads
 */
export function isFileQuestion(question) {
    return question.type === QuestionType.FILE ||
        question.type === QuestionType.SIGNATURE;
}
/**
 * Type guard to check if a question is a matrix question
 */
export function isMatrixQuestion(question) {
    return question.type === QuestionType.MATRIX;
}
// ===============================
// Validation Rule Type Guards and Utilities
// ===============================
/**
 * Type guard for required validation
 */
export function isRequiredValidation(rule) {
    return rule.type === 'required';
}
/**
 * Type guard for length validation
 */
export function isLengthValidation(rule) {
    return rule.type === 'length';
}
/**
 * Type guard for numeric validation
 */
export function isNumericValidation(rule) {
    return rule.type === 'numeric';
}
/**
 * Type guard for pattern validation
 */
export function isPatternValidation(rule) {
    return rule.type === 'pattern';
}
/**
 * Type guard for email validation
 */
export function isEmailValidation(rule) {
    return rule.type === 'email';
}
/**
 * Type guard for URL validation
 */
export function isUrlValidation(rule) {
    return rule.type === 'url';
}
/**
 * Type guard for phone validation
 */
export function isPhoneValidation(rule) {
    return rule.type === 'phone';
}
/**
 * Type guard for date validation
 */
export function isDateValidation(rule) {
    return rule.type === 'date';
}
/**
 * Type guard for time validation
 */
export function isTimeValidation(rule) {
    return rule.type === 'time';
}
/**
 * Type guard for file validation
 */
export function isFileValidation(rule) {
    return rule.type === 'file';
}
/**
 * Type guard for choice validation
 */
export function isChoiceValidation(rule) {
    return rule.type === 'choice';
}
/**
 * Type guard for rating validation
 */
export function isRatingValidation(rule) {
    return rule.type === 'rating';
}
/**
 * Type guard for custom validation
 */
export function isCustomValidation(rule) {
    return rule.type === 'custom';
}
/**
 * Get compatible validation rules for a specific question type
 */
export function getCompatibleValidationTypes(questionType) {
    const baseTypes = ['required', 'custom'];
    switch (questionType) {
        case QuestionType.TEXT:
        case QuestionType.TEXTAREA:
            return [...baseTypes, 'length', 'pattern'];
        case QuestionType.EMAIL:
            return [...baseTypes, 'length', 'pattern', 'email'];
        case QuestionType.PHONE:
            return [...baseTypes, 'length', 'pattern', 'phone'];
        case QuestionType.URL:
            return [...baseTypes, 'length', 'pattern', 'url'];
        case QuestionType.NUMBER:
            return [...baseTypes, 'numeric'];
        case QuestionType.DATE:
            return [...baseTypes, 'date'];
        case QuestionType.TIME:
            return [...baseTypes, 'time'];
        case QuestionType.MULTIPLE_CHOICE:
        case QuestionType.DROPDOWN:
        case QuestionType.CHECKBOXES:
            return [...baseTypes, 'choice'];
        case QuestionType.RATING:
        case QuestionType.LINEAR_SCALE:
            return [...baseTypes, 'rating', 'numeric'];
        case QuestionType.FILE:
        case QuestionType.SIGNATURE:
            return [...baseTypes, 'file'];
        case QuestionType.MATRIX:
            return [...baseTypes, 'choice'];
        case QuestionType.PAYMENT:
            return [...baseTypes, 'numeric'];
        default:
            return baseTypes;
    }
}
/**
 * Check if a validation rule is compatible with a question type
 */
export function isValidationRuleCompatible(rule, questionType) {
    const compatibleTypes = getCompatibleValidationTypes(questionType);
    return compatibleTypes.includes(rule.type);
}
/**
 * Filter validation rules to only include compatible ones for a question type
 */
export function filterCompatibleValidationRules(rules, questionType) {
    return rules.filter(rule => isValidationRuleCompatible(rule, questionType));
}
/**
 * Utility function to create typed validation rules for a specific question type
 */
export function createValidationRulesForQuestion(rules) {
    return {
        rules: rules,
        validateOnChange: true,
        validateOnBlur: true,
        stopOnFirstError: false,
    };
}
/**
 * Combine multiple validation rule sets
 */
export function combineValidationRules(...ruleSets) {
    const combinedRules = [];
    const combinedCustomMessages = {};
    let validateOnChange = false;
    let validateOnBlur = false;
    let stopOnFirstError = false;
    const allDependencies = [];
    for (const ruleSet of ruleSets) {
        if (ruleSet.rules) {
            combinedRules.push(...ruleSet.rules);
        }
        if (ruleSet.customMessages) {
            Object.assign(combinedCustomMessages, ruleSet.customMessages);
        }
        if (ruleSet.validateOnChange)
            validateOnChange = true;
        if (ruleSet.validateOnBlur)
            validateOnBlur = true;
        if (ruleSet.stopOnFirstError)
            stopOnFirstError = true;
        if (ruleSet.dependencies) {
            allDependencies.push(...ruleSet.dependencies);
        }
    }
    const result = {
        rules: combinedRules,
        validateOnChange,
        validateOnBlur,
        stopOnFirstError,
    };
    if (Object.keys(combinedCustomMessages).length > 0) {
        result.customMessages = combinedCustomMessages;
    }
    if (allDependencies.length > 0) {
        result.dependencies = [...new Set(allDependencies)];
    }
    return result;
}
/**
 * Helper function to create a required validation rule
 */
export function createRequiredRule(errorMessage) {
    const rule = {
        type: 'required',
        required: true,
    };
    if (errorMessage !== undefined) {
        rule.errorMessage = errorMessage;
    }
    return rule;
}
/**
 * Helper function to create a length validation rule
 */
export function createLengthRule(options) {
    const rule = {
        type: 'length',
    };
    if (options.minLength !== undefined)
        rule.minLength = options.minLength;
    if (options.maxLength !== undefined)
        rule.maxLength = options.maxLength;
    if (options.errorMessage !== undefined)
        rule.errorMessage = options.errorMessage;
    return rule;
}
/**
 * Helper function to create a numeric validation rule
 */
export function createNumericRule(options) {
    const rule = {
        type: 'numeric',
    };
    if (options.min !== undefined)
        rule.min = options.min;
    if (options.max !== undefined)
        rule.max = options.max;
    if (options.step !== undefined)
        rule.step = options.step;
    if (options.decimalPlaces !== undefined)
        rule.decimalPlaces = options.decimalPlaces;
    if (options.errorMessage !== undefined)
        rule.errorMessage = options.errorMessage;
    return rule;
}
/**
 * Helper function to create a pattern validation rule
 */
export function createPatternRule(pattern, options) {
    const rule = {
        type: 'pattern',
        pattern,
    };
    if (options?.flags !== undefined)
        rule.flags = options.flags;
    if (options?.caseSensitive !== undefined)
        rule.caseSensitive = options.caseSensitive;
    if (options?.errorMessage !== undefined)
        rule.errorMessage = options.errorMessage;
    return rule;
}
/**
 * Helper function to create an email validation rule
 */
export function createEmailRule(options) {
    const rule = {
        type: 'email',
    };
    if (options?.allowedDomains !== undefined)
        rule.allowedDomains = options.allowedDomains;
    if (options?.blockedDomains !== undefined)
        rule.blockedDomains = options.blockedDomains;
    if (options?.requireTLD !== undefined)
        rule.requireTLD = options.requireTLD;
    if (options?.errorMessage !== undefined)
        rule.errorMessage = options.errorMessage;
    return rule;
}
/**
 * Helper function to create a choice validation rule
 */
export function createChoiceRule(options) {
    const rule = {
        type: 'choice',
    };
    if (options.minSelections !== undefined)
        rule.minSelections = options.minSelections;
    if (options.maxSelections !== undefined)
        rule.maxSelections = options.maxSelections;
    if (options.requiredOptions !== undefined)
        rule.requiredOptions = options.requiredOptions;
    if (options.forbiddenCombinations !== undefined)
        rule.forbiddenCombinations = options.forbiddenCombinations;
    if (options.errorMessage !== undefined)
        rule.errorMessage = options.errorMessage;
    return rule;
}
// =======================================
// Conditional Logic Type Guards & Utils
// =======================================
/**
 * Type guard to check if an action is a show/hide action
 */
export function isShowHideAction(action) {
    return action.action === ConditionalAction.SHOW || action.action === ConditionalAction.HIDE;
}
/**
 * Type guard to check if an action is a require action
 */
export function isRequireAction(action) {
    return action.action === ConditionalAction.REQUIRE || action.action === ConditionalAction.MAKE_OPTIONAL;
}
/**
 * Type guard to check if an action is a jump to action
 */
export function isJumpToAction(action) {
    return action.action === ConditionalAction.JUMP_TO;
}
/**
 * Type guard to check if an action is a jump to page action
 */
export function isJumpToPageAction(action) {
    return action.action === ConditionalAction.JUMP_TO_PAGE;
}
/**
 * Type guard to check if an action is a set value action
 */
export function isSetValueAction(action) {
    return action.action === ConditionalAction.SET_VALUE;
}
/**
 * Type guard to check if an action is a clear value action
 */
export function isClearValueAction(action) {
    return action.action === ConditionalAction.CLEAR_VALUE;
}
/**
 * Type guard to check if an action is an enable/disable action
 */
export function isEnableDisableAction(action) {
    return action.action === ConditionalAction.ENABLE || action.action === ConditionalAction.DISABLE;
}
/**
 * Type guard to check if an action is a show message action
 */
export function isShowMessageAction(action) {
    return action.action === ConditionalAction.SHOW_MESSAGE;
}
/**
 * Type guard to check if an action is a redirect action
 */
export function isRedirectAction(action) {
    return action.action === ConditionalAction.REDIRECT;
}
/**
 * Type guard to check if an action is a submit form action
 */
export function isSubmitFormAction(action) {
    return action.action === ConditionalAction.SUBMIT_FORM;
}
/**
 * Type guard to check if an action is a skip action
 */
export function isSkipAction(action) {
    return action.action === ConditionalAction.SKIP;
}
/**
 * Get all question IDs referenced in a conditional logic rule
 */
export function getReferencedQuestionIds(logic) {
    const questionIds = new Set();
    function processConditionGroup(group) {
        group.conditions.forEach(condition => {
            questionIds.add(condition.questionId);
        });
        group.groups?.forEach(nestedGroup => {
            processConditionGroup(nestedGroup);
        });
    }
    function processActions(actions) {
        actions.forEach(action => {
            if (isJumpToAction(action)) {
                questionIds.add(action.targetQuestionId);
            }
            else if (isSetValueAction(action) || isClearValueAction(action)) {
                questionIds.add(action.targetQuestionId);
            }
        });
    }
    processConditionGroup(logic.conditionGroup);
    processActions(logic.actions);
    if (logic.elseActions) {
        processActions(logic.elseActions);
    }
    return Array.from(questionIds);
}
/**
 * Check if a conditional logic rule references a specific question
 */
export function logicReferencesQuestion(logic, questionId) {
    return getReferencedQuestionIds(logic).includes(questionId);
}
/**
 * Validate that all referenced questions exist in the form
 */
export function validateLogicReferences(logic, existingQuestionIds) {
    const referencedIds = getReferencedQuestionIds(logic);
    const missingQuestions = referencedIds.filter(id => !existingQuestionIds.includes(id));
    return {
        isValid: missingQuestions.length === 0,
        missingQuestions
    };
}
/**
 * Create a simple show/hide conditional logic rule
 */
export function createSimpleShowHideLogic(questionId, triggerQuestionId, operator, value, action = 'show') {
    return {
        id: `${action}_${questionId}_when_${triggerQuestionId}_${operator}_${value}`,
        name: `${action === 'show' ? 'Show' : 'Hide'} ${questionId} when ${triggerQuestionId} ${operator} ${value}`,
        enabled: true,
        conditionGroup: {
            combinator: LogicCombinator.AND,
            conditions: [
                {
                    questionId: triggerQuestionId,
                    operator,
                    value
                }
            ]
        },
        actions: [
            {
                action: action === 'show' ? ConditionalAction.SHOW : ConditionalAction.HIDE
            }
        ]
    };
}
/**
 * Create a conditional logic rule for making questions required
 */
export function createRequiredLogic(questionId, triggerQuestionId, operator, value, validationMessage) {
    return {
        id: `require_${questionId}_when_${triggerQuestionId}_${operator}_${value}`,
        name: `Require ${questionId} when ${triggerQuestionId} ${operator} ${value}`,
        enabled: true,
        conditionGroup: {
            combinator: LogicCombinator.AND,
            conditions: [
                {
                    questionId: triggerQuestionId,
                    operator,
                    value
                }
            ]
        },
        actions: [
            {
                action: ConditionalAction.REQUIRE,
                validationMessage
            }
        ]
    };
}
/**
 * Create a jump logic rule
 */
export function createJumpLogic(triggerQuestionId, operator, value, targetQuestionId, skipValidation = false) {
    return {
        id: `jump_to_${targetQuestionId}_when_${triggerQuestionId}_${operator}_${value}`,
        name: `Jump to ${targetQuestionId} when ${triggerQuestionId} ${operator} ${value}`,
        enabled: true,
        conditionGroup: {
            combinator: LogicCombinator.AND,
            conditions: [
                {
                    questionId: triggerQuestionId,
                    operator,
                    value
                }
            ]
        },
        actions: [
            {
                action: ConditionalAction.JUMP_TO,
                targetQuestionId,
                skipValidation
            }
        ]
    };
}
// ===============================
// Conditional Logic and Branching
// ===============================
/**
 * Action types for conditional logic
 */
export var ConditionalAction;
(function (ConditionalAction) {
    ConditionalAction["SHOW"] = "show";
    ConditionalAction["HIDE"] = "hide";
    ConditionalAction["REQUIRE"] = "require";
    ConditionalAction["MAKE_OPTIONAL"] = "make_optional";
    ConditionalAction["SKIP"] = "skip";
    ConditionalAction["JUMP_TO"] = "jump_to";
    ConditionalAction["JUMP_TO_PAGE"] = "jump_to_page";
    ConditionalAction["SUBMIT_FORM"] = "submit_form";
    ConditionalAction["SET_VALUE"] = "set_value";
    ConditionalAction["CLEAR_VALUE"] = "clear_value";
    ConditionalAction["DISABLE"] = "disable";
    ConditionalAction["ENABLE"] = "enable";
    ConditionalAction["SHOW_MESSAGE"] = "show_message";
    ConditionalAction["REDIRECT"] = "redirect";
})(ConditionalAction || (ConditionalAction = {}));
/**
 * Logic combination operators
 */
export var LogicCombinator;
(function (LogicCombinator) {
    LogicCombinator["AND"] = "and";
    LogicCombinator["OR"] = "or";
    LogicCombinator["XOR"] = "xor";
    LogicCombinator["NAND"] = "nand";
    LogicCombinator["NOR"] = "nor";
})(LogicCombinator || (LogicCombinator = {}));

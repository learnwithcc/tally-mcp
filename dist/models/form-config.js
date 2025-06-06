"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicCombinator = exports.ConditionalAction = exports.MatrixResponseType = exports.PaymentMethod = exports.TimeFormat = exports.PhoneFormat = exports.RatingStyle = exports.QuestionLayout = exports.LogicOperator = exports.ValidationType = exports.SubmissionBehavior = exports.FormTheme = exports.QuestionType = void 0;
exports.questionHasOptions = questionHasOptions;
exports.isTextBasedQuestion = isTextBasedQuestion;
exports.isNumericQuestion = isNumericQuestion;
exports.isDateTimeQuestion = isDateTimeQuestion;
exports.isFileQuestion = isFileQuestion;
exports.isMatrixQuestion = isMatrixQuestion;
exports.isRequiredValidation = isRequiredValidation;
exports.isLengthValidation = isLengthValidation;
exports.isNumericValidation = isNumericValidation;
exports.isPatternValidation = isPatternValidation;
exports.isEmailValidation = isEmailValidation;
exports.isUrlValidation = isUrlValidation;
exports.isPhoneValidation = isPhoneValidation;
exports.isDateValidation = isDateValidation;
exports.isTimeValidation = isTimeValidation;
exports.isFileValidation = isFileValidation;
exports.isChoiceValidation = isChoiceValidation;
exports.isRatingValidation = isRatingValidation;
exports.isCustomValidation = isCustomValidation;
exports.getCompatibleValidationTypes = getCompatibleValidationTypes;
exports.isValidationRuleCompatible = isValidationRuleCompatible;
exports.filterCompatibleValidationRules = filterCompatibleValidationRules;
exports.createValidationRulesForQuestion = createValidationRulesForQuestion;
exports.combineValidationRules = combineValidationRules;
exports.createRequiredRule = createRequiredRule;
exports.createLengthRule = createLengthRule;
exports.createNumericRule = createNumericRule;
exports.createPatternRule = createPatternRule;
exports.createEmailRule = createEmailRule;
exports.createChoiceRule = createChoiceRule;
exports.isShowHideAction = isShowHideAction;
exports.isRequireAction = isRequireAction;
exports.isJumpToAction = isJumpToAction;
exports.isJumpToPageAction = isJumpToPageAction;
exports.isSetValueAction = isSetValueAction;
exports.isClearValueAction = isClearValueAction;
exports.isEnableDisableAction = isEnableDisableAction;
exports.isShowMessageAction = isShowMessageAction;
exports.isRedirectAction = isRedirectAction;
exports.isSubmitFormAction = isSubmitFormAction;
exports.isSkipAction = isSkipAction;
exports.getReferencedQuestionIds = getReferencedQuestionIds;
exports.logicReferencesQuestion = logicReferencesQuestion;
exports.validateLogicReferences = validateLogicReferences;
exports.createSimpleShowHideLogic = createSimpleShowHideLogic;
exports.createRequiredLogic = createRequiredLogic;
exports.createJumpLogic = createJumpLogic;
var QuestionType;
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
})(QuestionType || (exports.QuestionType = QuestionType = {}));
var FormTheme;
(function (FormTheme) {
    FormTheme["DEFAULT"] = "default";
    FormTheme["MINIMAL"] = "minimal";
    FormTheme["MODERN"] = "modern";
    FormTheme["CLASSIC"] = "classic";
    FormTheme["CUSTOM"] = "custom";
})(FormTheme || (exports.FormTheme = FormTheme = {}));
var SubmissionBehavior;
(function (SubmissionBehavior) {
    SubmissionBehavior["REDIRECT"] = "redirect";
    SubmissionBehavior["MESSAGE"] = "message";
    SubmissionBehavior["CLOSE"] = "close";
    SubmissionBehavior["RELOAD"] = "reload";
})(SubmissionBehavior || (exports.SubmissionBehavior = SubmissionBehavior = {}));
var ValidationType;
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
})(ValidationType || (exports.ValidationType = ValidationType = {}));
var LogicOperator;
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
})(LogicOperator || (exports.LogicOperator = LogicOperator = {}));
var QuestionLayout;
(function (QuestionLayout) {
    QuestionLayout["VERTICAL"] = "vertical";
    QuestionLayout["HORIZONTAL"] = "horizontal";
    QuestionLayout["GRID"] = "grid";
})(QuestionLayout || (exports.QuestionLayout = QuestionLayout = {}));
var RatingStyle;
(function (RatingStyle) {
    RatingStyle["STARS"] = "stars";
    RatingStyle["NUMBERS"] = "numbers";
    RatingStyle["THUMBS"] = "thumbs";
    RatingStyle["HEARTS"] = "hearts";
    RatingStyle["FACES"] = "faces";
})(RatingStyle || (exports.RatingStyle = RatingStyle = {}));
var PhoneFormat;
(function (PhoneFormat) {
    PhoneFormat["US"] = "US";
    PhoneFormat["INTERNATIONAL"] = "INTERNATIONAL";
    PhoneFormat["CUSTOM"] = "CUSTOM";
})(PhoneFormat || (exports.PhoneFormat = PhoneFormat = {}));
var TimeFormat;
(function (TimeFormat) {
    TimeFormat["TWELVE_HOUR"] = "12";
    TimeFormat["TWENTY_FOUR_HOUR"] = "24";
})(TimeFormat || (exports.TimeFormat = TimeFormat = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CARD"] = "card";
    PaymentMethod["PAYPAL"] = "paypal";
    PaymentMethod["APPLE_PAY"] = "apple_pay";
    PaymentMethod["GOOGLE_PAY"] = "google_pay";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var MatrixResponseType;
(function (MatrixResponseType) {
    MatrixResponseType["SINGLE_SELECT"] = "single_select";
    MatrixResponseType["MULTI_SELECT"] = "multi_select";
    MatrixResponseType["TEXT_INPUT"] = "text_input";
    MatrixResponseType["RATING"] = "rating";
})(MatrixResponseType || (exports.MatrixResponseType = MatrixResponseType = {}));
function questionHasOptions(question) {
    return question.type === QuestionType.MULTIPLE_CHOICE ||
        question.type === QuestionType.DROPDOWN ||
        question.type === QuestionType.CHECKBOXES;
}
function isTextBasedQuestion(question) {
    return question.type === QuestionType.TEXT ||
        question.type === QuestionType.TEXTAREA ||
        question.type === QuestionType.EMAIL ||
        question.type === QuestionType.PHONE ||
        question.type === QuestionType.URL;
}
function isNumericQuestion(question) {
    return question.type === QuestionType.NUMBER ||
        question.type === QuestionType.RATING ||
        question.type === QuestionType.LINEAR_SCALE;
}
function isDateTimeQuestion(question) {
    return question.type === QuestionType.DATE ||
        question.type === QuestionType.TIME;
}
function isFileQuestion(question) {
    return question.type === QuestionType.FILE ||
        question.type === QuestionType.SIGNATURE;
}
function isMatrixQuestion(question) {
    return question.type === QuestionType.MATRIX;
}
function isRequiredValidation(rule) {
    return rule.type === 'required';
}
function isLengthValidation(rule) {
    return rule.type === 'length';
}
function isNumericValidation(rule) {
    return rule.type === 'numeric';
}
function isPatternValidation(rule) {
    return rule.type === 'pattern';
}
function isEmailValidation(rule) {
    return rule.type === 'email';
}
function isUrlValidation(rule) {
    return rule.type === 'url';
}
function isPhoneValidation(rule) {
    return rule.type === 'phone';
}
function isDateValidation(rule) {
    return rule.type === 'date';
}
function isTimeValidation(rule) {
    return rule.type === 'time';
}
function isFileValidation(rule) {
    return rule.type === 'file';
}
function isChoiceValidation(rule) {
    return rule.type === 'choice';
}
function isRatingValidation(rule) {
    return rule.type === 'rating';
}
function isCustomValidation(rule) {
    return rule.type === 'custom';
}
function getCompatibleValidationTypes(questionType) {
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
function isValidationRuleCompatible(rule, questionType) {
    const compatibleTypes = getCompatibleValidationTypes(questionType);
    return compatibleTypes.includes(rule.type);
}
function filterCompatibleValidationRules(rules, questionType) {
    return rules.filter(rule => isValidationRuleCompatible(rule, questionType));
}
function createValidationRulesForQuestion(rules) {
    return {
        rules: rules,
        validateOnChange: true,
        validateOnBlur: true,
        stopOnFirstError: false,
    };
}
function combineValidationRules(...ruleSets) {
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
function createRequiredRule(errorMessage) {
    const rule = {
        type: 'required',
        required: true,
    };
    if (errorMessage !== undefined) {
        rule.errorMessage = errorMessage;
    }
    return rule;
}
function createLengthRule(options) {
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
function createNumericRule(options) {
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
function createPatternRule(pattern, options) {
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
function createEmailRule(options) {
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
function createChoiceRule(options) {
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
function isShowHideAction(action) {
    return action.action === ConditionalAction.SHOW || action.action === ConditionalAction.HIDE;
}
function isRequireAction(action) {
    return action.action === ConditionalAction.REQUIRE || action.action === ConditionalAction.MAKE_OPTIONAL;
}
function isJumpToAction(action) {
    return action.action === ConditionalAction.JUMP_TO;
}
function isJumpToPageAction(action) {
    return action.action === ConditionalAction.JUMP_TO_PAGE;
}
function isSetValueAction(action) {
    return action.action === ConditionalAction.SET_VALUE;
}
function isClearValueAction(action) {
    return action.action === ConditionalAction.CLEAR_VALUE;
}
function isEnableDisableAction(action) {
    return action.action === ConditionalAction.ENABLE || action.action === ConditionalAction.DISABLE;
}
function isShowMessageAction(action) {
    return action.action === ConditionalAction.SHOW_MESSAGE;
}
function isRedirectAction(action) {
    return action.action === ConditionalAction.REDIRECT;
}
function isSubmitFormAction(action) {
    return action.action === ConditionalAction.SUBMIT_FORM;
}
function isSkipAction(action) {
    return action.action === ConditionalAction.SKIP;
}
function getReferencedQuestionIds(logic) {
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
function logicReferencesQuestion(logic, questionId) {
    return getReferencedQuestionIds(logic).includes(questionId);
}
function validateLogicReferences(logic, existingQuestionIds) {
    const referencedIds = getReferencedQuestionIds(logic);
    const missingQuestions = referencedIds.filter(id => !existingQuestionIds.includes(id));
    return {
        isValid: missingQuestions.length === 0,
        missingQuestions
    };
}
function createSimpleShowHideLogic(questionId, triggerQuestionId, operator, value, action = 'show') {
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
function createRequiredLogic(questionId, triggerQuestionId, operator, value, validationMessage) {
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
function createJumpLogic(triggerQuestionId, operator, value, targetQuestionId, skipValidation = false) {
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
var ConditionalAction;
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
})(ConditionalAction || (exports.ConditionalAction = ConditionalAction = {}));
var LogicCombinator;
(function (LogicCombinator) {
    LogicCombinator["AND"] = "and";
    LogicCombinator["OR"] = "or";
    LogicCombinator["XOR"] = "xor";
    LogicCombinator["NAND"] = "nand";
    LogicCombinator["NOR"] = "nor";
})(LogicCombinator || (exports.LogicCombinator = LogicCombinator = {}));
//# sourceMappingURL=form-config.js.map
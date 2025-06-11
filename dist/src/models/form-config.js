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
export var FormTheme;
(function (FormTheme) {
    FormTheme["DEFAULT"] = "default";
    FormTheme["MINIMAL"] = "minimal";
    FormTheme["MODERN"] = "modern";
    FormTheme["CLASSIC"] = "classic";
    FormTheme["CUSTOM"] = "custom";
})(FormTheme || (FormTheme = {}));
export var SubmissionBehavior;
(function (SubmissionBehavior) {
    SubmissionBehavior["REDIRECT"] = "redirect";
    SubmissionBehavior["MESSAGE"] = "message";
    SubmissionBehavior["CLOSE"] = "close";
    SubmissionBehavior["RELOAD"] = "reload";
})(SubmissionBehavior || (SubmissionBehavior = {}));
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
export var QuestionLayout;
(function (QuestionLayout) {
    QuestionLayout["VERTICAL"] = "vertical";
    QuestionLayout["HORIZONTAL"] = "horizontal";
    QuestionLayout["GRID"] = "grid";
})(QuestionLayout || (QuestionLayout = {}));
export var RatingStyle;
(function (RatingStyle) {
    RatingStyle["STARS"] = "stars";
    RatingStyle["NUMBERS"] = "numbers";
    RatingStyle["THUMBS"] = "thumbs";
    RatingStyle["HEARTS"] = "hearts";
    RatingStyle["FACES"] = "faces";
})(RatingStyle || (RatingStyle = {}));
export var PhoneFormat;
(function (PhoneFormat) {
    PhoneFormat["US"] = "US";
    PhoneFormat["INTERNATIONAL"] = "INTERNATIONAL";
    PhoneFormat["CUSTOM"] = "CUSTOM";
})(PhoneFormat || (PhoneFormat = {}));
export var TimeFormat;
(function (TimeFormat) {
    TimeFormat["TWELVE_HOUR"] = "12";
    TimeFormat["TWENTY_FOUR_HOUR"] = "24";
})(TimeFormat || (TimeFormat = {}));
export var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CARD"] = "card";
    PaymentMethod["PAYPAL"] = "paypal";
    PaymentMethod["APPLE_PAY"] = "apple_pay";
    PaymentMethod["GOOGLE_PAY"] = "google_pay";
})(PaymentMethod || (PaymentMethod = {}));
export var MatrixResponseType;
(function (MatrixResponseType) {
    MatrixResponseType["SINGLE_SELECT"] = "single_select";
    MatrixResponseType["MULTI_SELECT"] = "multi_select";
    MatrixResponseType["TEXT_INPUT"] = "text_input";
    MatrixResponseType["RATING"] = "rating";
})(MatrixResponseType || (MatrixResponseType = {}));
export function questionHasOptions(question) {
    return question.type === QuestionType.MULTIPLE_CHOICE ||
        question.type === QuestionType.DROPDOWN ||
        question.type === QuestionType.CHECKBOXES;
}
export function isTextBasedQuestion(question) {
    return question.type === QuestionType.TEXT ||
        question.type === QuestionType.TEXTAREA ||
        question.type === QuestionType.EMAIL ||
        question.type === QuestionType.PHONE ||
        question.type === QuestionType.URL;
}
export function isNumericQuestion(question) {
    return question.type === QuestionType.NUMBER ||
        question.type === QuestionType.RATING ||
        question.type === QuestionType.LINEAR_SCALE;
}
export function isDateTimeQuestion(question) {
    return question.type === QuestionType.DATE ||
        question.type === QuestionType.TIME;
}
export function isFileQuestion(question) {
    return question.type === QuestionType.FILE ||
        question.type === QuestionType.SIGNATURE;
}
export function isMatrixQuestion(question) {
    return question.type === QuestionType.MATRIX;
}
export function isRequiredValidation(rule) {
    return rule.type === 'required';
}
export function isLengthValidation(rule) {
    return rule.type === 'length';
}
export function isNumericValidation(rule) {
    return rule.type === 'numeric';
}
export function isPatternValidation(rule) {
    return rule.type === 'pattern';
}
export function isEmailValidation(rule) {
    return rule.type === 'email';
}
export function isUrlValidation(rule) {
    return rule.type === 'url';
}
export function isPhoneValidation(rule) {
    return rule.type === 'phone';
}
export function isDateValidation(rule) {
    return rule.type === 'date';
}
export function isTimeValidation(rule) {
    return rule.type === 'time';
}
export function isFileValidation(rule) {
    return rule.type === 'file';
}
export function isChoiceValidation(rule) {
    return rule.type === 'choice';
}
export function isRatingValidation(rule) {
    return rule.type === 'rating';
}
export function isCustomValidation(rule) {
    return rule.type === 'custom';
}
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
export function isValidationRuleCompatible(rule, questionType) {
    const compatibleTypes = getCompatibleValidationTypes(questionType);
    return compatibleTypes.includes(rule.type);
}
export function filterCompatibleValidationRules(rules, questionType) {
    return rules.filter(rule => isValidationRuleCompatible(rule, questionType));
}
export function createValidationRulesForQuestion(rules) {
    return {
        rules: rules,
        validateOnChange: true,
        validateOnBlur: true,
        stopOnFirstError: false,
    };
}
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
export function isShowHideAction(action) {
    return action.action === ConditionalAction.SHOW || action.action === ConditionalAction.HIDE;
}
export function isRequireAction(action) {
    return action.action === ConditionalAction.REQUIRE || action.action === ConditionalAction.MAKE_OPTIONAL;
}
export function isJumpToAction(action) {
    return action.action === ConditionalAction.JUMP_TO;
}
export function isJumpToPageAction(action) {
    return action.action === ConditionalAction.JUMP_TO_PAGE;
}
export function isSetValueAction(action) {
    return action.action === ConditionalAction.SET_VALUE;
}
export function isClearValueAction(action) {
    return action.action === ConditionalAction.CLEAR_VALUE;
}
export function isEnableDisableAction(action) {
    return action.action === ConditionalAction.ENABLE || action.action === ConditionalAction.DISABLE;
}
export function isShowMessageAction(action) {
    return action.action === ConditionalAction.SHOW_MESSAGE;
}
export function isRedirectAction(action) {
    return action.action === ConditionalAction.REDIRECT;
}
export function isSubmitFormAction(action) {
    return action.action === ConditionalAction.SUBMIT_FORM;
}
export function isSkipAction(action) {
    return action.action === ConditionalAction.SKIP;
}
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
export function logicReferencesQuestion(logic, questionId) {
    return getReferencedQuestionIds(logic).includes(questionId);
}
export function validateLogicReferences(logic, existingQuestionIds) {
    const referencedIds = getReferencedQuestionIds(logic);
    const missingQuestions = referencedIds.filter(id => !existingQuestionIds.includes(id));
    return {
        isValid: missingQuestions.length === 0,
        missingQuestions
    };
}
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
export var LogicCombinator;
(function (LogicCombinator) {
    LogicCombinator["AND"] = "and";
    LogicCombinator["OR"] = "or";
    LogicCombinator["XOR"] = "xor";
    LogicCombinator["NAND"] = "nand";
    LogicCombinator["NOR"] = "nor";
})(LogicCombinator || (LogicCombinator = {}));
//# sourceMappingURL=form-config.js.map
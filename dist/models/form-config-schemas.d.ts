import { z } from 'zod';
import * as T from './form-config';
export declare const QuestionTypeSchema: z.ZodNativeEnum<typeof T.QuestionType>;
export declare const FormThemeSchema: z.ZodNativeEnum<typeof T.FormTheme>;
export declare const SubmissionBehaviorSchema: z.ZodNativeEnum<typeof T.SubmissionBehavior>;
export declare const ValidationTypeSchema: z.ZodNativeEnum<typeof T.ValidationType>;
export declare const LogicOperatorSchema: z.ZodNativeEnum<typeof T.LogicOperator>;
export declare const QuestionLayoutSchema: z.ZodNativeEnum<typeof T.QuestionLayout>;
export declare const RatingStyleSchema: z.ZodNativeEnum<typeof T.RatingStyle>;
export declare const PhoneFormatSchema: z.ZodNativeEnum<typeof T.PhoneFormat>;
export declare const TimeFormatSchema: z.ZodNativeEnum<typeof T.TimeFormat>;
export declare const PaymentMethodSchema: z.ZodNativeEnum<typeof T.PaymentMethod>;
export declare const ConditionalActionSchema: z.ZodNativeEnum<typeof T.ConditionalAction>;
export declare const LogicCombinatorSchema: z.ZodNativeEnum<typeof T.LogicCombinator>;
export declare const ButtonStyleSchema: z.ZodObject<{
    backgroundColor: z.ZodOptional<z.ZodString>;
    textColor: z.ZodOptional<z.ZodString>;
    borderRadius: z.ZodOptional<z.ZodNumber>;
    border: z.ZodOptional<z.ZodString>;
    fontSize: z.ZodOptional<z.ZodNumber>;
    padding: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    backgroundColor?: string | undefined;
    textColor?: string | undefined;
    borderRadius?: number | undefined;
    border?: string | undefined;
    fontSize?: number | undefined;
    padding?: string | undefined;
}, {
    backgroundColor?: string | undefined;
    textColor?: string | undefined;
    borderRadius?: number | undefined;
    border?: string | undefined;
    fontSize?: number | undefined;
    padding?: string | undefined;
}>;
export declare const BrandingConfigSchema: z.ZodObject<{
    theme: z.ZodNativeEnum<typeof T.FormTheme>;
    primaryColor: z.ZodOptional<z.ZodString>;
    secondaryColor: z.ZodOptional<z.ZodString>;
    background: z.ZodOptional<z.ZodString>;
    customCss: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodOptional<z.ZodString>;
    fontFamily: z.ZodOptional<z.ZodString>;
    buttonStyle: z.ZodOptional<z.ZodObject<{
        backgroundColor: z.ZodOptional<z.ZodString>;
        textColor: z.ZodOptional<z.ZodString>;
        borderRadius: z.ZodOptional<z.ZodNumber>;
        border: z.ZodOptional<z.ZodString>;
        fontSize: z.ZodOptional<z.ZodNumber>;
        padding: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        backgroundColor?: string | undefined;
        textColor?: string | undefined;
        borderRadius?: number | undefined;
        border?: string | undefined;
        fontSize?: number | undefined;
        padding?: string | undefined;
    }, {
        backgroundColor?: string | undefined;
        textColor?: string | undefined;
        borderRadius?: number | undefined;
        border?: string | undefined;
        fontSize?: number | undefined;
        padding?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    theme: T.FormTheme;
    primaryColor?: string | undefined;
    secondaryColor?: string | undefined;
    background?: string | undefined;
    customCss?: string | undefined;
    logoUrl?: string | undefined;
    fontFamily?: string | undefined;
    buttonStyle?: {
        backgroundColor?: string | undefined;
        textColor?: string | undefined;
        borderRadius?: number | undefined;
        border?: string | undefined;
        fontSize?: number | undefined;
        padding?: string | undefined;
    } | undefined;
}, {
    theme: T.FormTheme;
    primaryColor?: string | undefined;
    secondaryColor?: string | undefined;
    background?: string | undefined;
    customCss?: string | undefined;
    logoUrl?: string | undefined;
    fontFamily?: string | undefined;
    buttonStyle?: {
        backgroundColor?: string | undefined;
        textColor?: string | undefined;
        borderRadius?: number | undefined;
        border?: string | undefined;
        fontSize?: number | undefined;
        padding?: string | undefined;
    } | undefined;
}>;
export declare const FormMetadataSchema: z.ZodObject<{
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    category: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
    createdBy: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodOptional<z.ZodString>;
    isPublished: z.ZodOptional<z.ZodBoolean>;
    isArchived: z.ZodOptional<z.ZodBoolean>;
    version: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    version?: number | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    createdBy?: string | undefined;
    category?: string | undefined;
    workspaceId?: string | undefined;
    tags?: string[] | undefined;
    isPublished?: boolean | undefined;
    isArchived?: boolean | undefined;
}, {
    version?: number | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    createdBy?: string | undefined;
    category?: string | undefined;
    workspaceId?: string | undefined;
    tags?: string[] | undefined;
    isPublished?: boolean | undefined;
    isArchived?: boolean | undefined;
}>;
export declare const FormSettingsSchema: z.ZodObject<{
    showProgressBar: z.ZodOptional<z.ZodBoolean>;
    allowDrafts: z.ZodOptional<z.ZodBoolean>;
    showQuestionNumbers: z.ZodOptional<z.ZodBoolean>;
    shuffleQuestions: z.ZodOptional<z.ZodBoolean>;
    maxSubmissions: z.ZodOptional<z.ZodNumber>;
    requireAuth: z.ZodOptional<z.ZodBoolean>;
    collectEmail: z.ZodOptional<z.ZodBoolean>;
    closeDate: z.ZodOptional<z.ZodString>;
    openDate: z.ZodOptional<z.ZodString>;
    submissionBehavior: z.ZodNativeEnum<typeof T.SubmissionBehavior>;
    submissionMessage: z.ZodOptional<z.ZodString>;
    redirectUrl: z.ZodOptional<z.ZodString>;
    sendConfirmationEmail: z.ZodOptional<z.ZodBoolean>;
    allowMultipleSubmissions: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    submissionBehavior: T.SubmissionBehavior;
    showProgressBar?: boolean | undefined;
    allowDrafts?: boolean | undefined;
    showQuestionNumbers?: boolean | undefined;
    shuffleQuestions?: boolean | undefined;
    maxSubmissions?: number | undefined;
    requireAuth?: boolean | undefined;
    collectEmail?: boolean | undefined;
    closeDate?: string | undefined;
    openDate?: string | undefined;
    submissionMessage?: string | undefined;
    redirectUrl?: string | undefined;
    sendConfirmationEmail?: boolean | undefined;
    allowMultipleSubmissions?: boolean | undefined;
}, {
    submissionBehavior: T.SubmissionBehavior;
    showProgressBar?: boolean | undefined;
    allowDrafts?: boolean | undefined;
    showQuestionNumbers?: boolean | undefined;
    shuffleQuestions?: boolean | undefined;
    maxSubmissions?: number | undefined;
    requireAuth?: boolean | undefined;
    collectEmail?: boolean | undefined;
    closeDate?: string | undefined;
    openDate?: string | undefined;
    submissionMessage?: string | undefined;
    redirectUrl?: string | undefined;
    sendConfirmationEmail?: boolean | undefined;
    allowMultipleSubmissions?: boolean | undefined;
}>;
export declare const QuestionOptionSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    text: z.ZodString;
    value: z.ZodOptional<z.ZodString>;
    isDefault: z.ZodOptional<z.ZodBoolean>;
    imageUrl: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    text: string;
    value?: string | undefined;
    metadata?: Record<string, any> | undefined;
    id?: string | undefined;
    isDefault?: boolean | undefined;
    imageUrl?: string | undefined;
}, {
    text: string;
    value?: string | undefined;
    metadata?: Record<string, any> | undefined;
    id?: string | undefined;
    isDefault?: boolean | undefined;
    imageUrl?: string | undefined;
}>;
export declare const LogicConditionGroupSchema: any;
export declare const ConditionalActionConfigSchema: any;
export declare const ConditionalLogicSchema: any;
export declare const ValidationRuleSchema: any;
export declare const ValidationRulesSchema: any;
export declare const BaseQuestionConfigSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
}, {
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
}>;
export declare const TextQuestionConfigSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.TEXT>;
    minLength: z.ZodOptional<z.ZodNumber>;
    maxLength: z.ZodOptional<z.ZodNumber>;
    format: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.TEXT;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    format?: string | undefined;
    minLength?: number | undefined;
    maxLength?: number | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
}, {
    type: T.QuestionType.TEXT;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    format?: string | undefined;
    minLength?: number | undefined;
    maxLength?: number | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
}>;
export declare const TextareaQuestionConfigSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.TEXTAREA>;
    minLength: z.ZodOptional<z.ZodNumber>;
    maxLength: z.ZodOptional<z.ZodNumber>;
    rows: z.ZodOptional<z.ZodNumber>;
    autoResize: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.TEXTAREA;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    minLength?: number | undefined;
    maxLength?: number | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    rows?: number | undefined;
    autoResize?: boolean | undefined;
}, {
    type: T.QuestionType.TEXTAREA;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    minLength?: number | undefined;
    maxLength?: number | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    rows?: number | undefined;
    autoResize?: boolean | undefined;
}>;
export declare const EmailQuestionConfigSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.EMAIL>;
    validateFormat: z.ZodOptional<z.ZodBoolean>;
    suggestDomains: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.EMAIL;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    validateFormat?: boolean | undefined;
    suggestDomains?: boolean | undefined;
}, {
    type: T.QuestionType.EMAIL;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    validateFormat?: boolean | undefined;
    suggestDomains?: boolean | undefined;
}>;
export declare const PhoneQuestionConfigSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.PHONE>;
    format: z.ZodOptional<z.ZodNativeEnum<typeof T.PhoneFormat>>;
    customPattern: z.ZodOptional<z.ZodString>;
    autoFormat: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.PHONE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    format?: T.PhoneFormat | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    customPattern?: string | undefined;
    autoFormat?: boolean | undefined;
}, {
    type: T.QuestionType.PHONE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    format?: T.PhoneFormat | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    customPattern?: string | undefined;
    autoFormat?: boolean | undefined;
}>;
export declare const UrlQuestionConfigSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.URL>;
    validateFormat: z.ZodOptional<z.ZodBoolean>;
    allowedSchemes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.URL;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    validateFormat?: boolean | undefined;
    allowedSchemes?: string[] | undefined;
}, {
    type: T.QuestionType.URL;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    validateFormat?: boolean | undefined;
    allowedSchemes?: string[] | undefined;
}>;
export declare const NumberQuestionConfigSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.NUMBER>;
    min: z.ZodOptional<z.ZodNumber>;
    max: z.ZodOptional<z.ZodNumber>;
    step: z.ZodOptional<z.ZodNumber>;
    decimalPlaces: z.ZodOptional<z.ZodNumber>;
    useThousandSeparator: z.ZodOptional<z.ZodBoolean>;
    currency: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.NUMBER;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    max?: number | undefined;
    min?: number | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    step?: number | undefined;
    decimalPlaces?: number | undefined;
    useThousandSeparator?: boolean | undefined;
    currency?: string | undefined;
}, {
    type: T.QuestionType.NUMBER;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    max?: number | undefined;
    min?: number | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    step?: number | undefined;
    decimalPlaces?: number | undefined;
    useThousandSeparator?: boolean | undefined;
    currency?: string | undefined;
}>;
export declare const DateQuestionConfigSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.DATE>;
    minDate: z.ZodOptional<z.ZodString>;
    maxDate: z.ZodOptional<z.ZodString>;
    dateFormat: z.ZodOptional<z.ZodString>;
    includeTime: z.ZodOptional<z.ZodBoolean>;
    defaultDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.DATE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    minDate?: string | undefined;
    maxDate?: string | undefined;
    dateFormat?: string | undefined;
    includeTime?: boolean | undefined;
    defaultDate?: string | undefined;
}, {
    type: T.QuestionType.DATE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    minDate?: string | undefined;
    maxDate?: string | undefined;
    dateFormat?: string | undefined;
    includeTime?: boolean | undefined;
    defaultDate?: string | undefined;
}>;
export declare const TimeQuestionConfigSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.TIME>;
    format: z.ZodOptional<z.ZodNativeEnum<typeof T.TimeFormat>>;
    minuteStep: z.ZodOptional<z.ZodNumber>;
    defaultTime: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.TIME;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    format?: T.TimeFormat | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    minuteStep?: number | undefined;
    defaultTime?: string | undefined;
}, {
    type: T.QuestionType.TIME;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    format?: T.TimeFormat | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    minuteStep?: number | undefined;
    defaultTime?: string | undefined;
}>;
export declare const MultipleChoiceQuestionConfigSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.MULTIPLE_CHOICE>;
    options: z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        text: z.ZodString;
        value: z.ZodOptional<z.ZodString>;
        isDefault: z.ZodOptional<z.ZodBoolean>;
        imageUrl: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }, {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }>, "many">;
    allowOther: z.ZodOptional<z.ZodBoolean>;
    randomizeOptions: z.ZodOptional<z.ZodBoolean>;
    layout: z.ZodOptional<z.ZodNativeEnum<typeof T.QuestionLayout>>;
}, "strip", z.ZodTypeAny, {
    options: {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }[];
    type: T.QuestionType.MULTIPLE_CHOICE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    allowOther?: boolean | undefined;
    randomizeOptions?: boolean | undefined;
    layout?: T.QuestionLayout | undefined;
}, {
    options: {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }[];
    type: T.QuestionType.MULTIPLE_CHOICE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    allowOther?: boolean | undefined;
    randomizeOptions?: boolean | undefined;
    layout?: T.QuestionLayout | undefined;
}>;
export declare const DropdownQuestionConfigSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.DROPDOWN>;
    options: z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        text: z.ZodString;
        value: z.ZodOptional<z.ZodString>;
        isDefault: z.ZodOptional<z.ZodBoolean>;
        imageUrl: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }, {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }>, "many">;
    allowOther: z.ZodOptional<z.ZodBoolean>;
    searchable: z.ZodOptional<z.ZodBoolean>;
    dropdownPlaceholder: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    options: {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }[];
    type: T.QuestionType.DROPDOWN;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    allowOther?: boolean | undefined;
    searchable?: boolean | undefined;
    dropdownPlaceholder?: string | undefined;
}, {
    options: {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }[];
    type: T.QuestionType.DROPDOWN;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    allowOther?: boolean | undefined;
    searchable?: boolean | undefined;
    dropdownPlaceholder?: string | undefined;
}>;
export declare const CheckboxesQuestionConfigSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.CHECKBOXES>;
    options: z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        text: z.ZodString;
        value: z.ZodOptional<z.ZodString>;
        isDefault: z.ZodOptional<z.ZodBoolean>;
        imageUrl: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }, {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }>, "many">;
    minSelections: z.ZodOptional<z.ZodNumber>;
    maxSelections: z.ZodOptional<z.ZodNumber>;
    allowOther: z.ZodOptional<z.ZodBoolean>;
    randomizeOptions: z.ZodOptional<z.ZodBoolean>;
    layout: z.ZodOptional<z.ZodNativeEnum<typeof T.QuestionLayout>>;
}, "strip", z.ZodTypeAny, {
    options: {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }[];
    type: T.QuestionType.CHECKBOXES;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    allowOther?: boolean | undefined;
    randomizeOptions?: boolean | undefined;
    layout?: T.QuestionLayout | undefined;
    maxSelections?: number | undefined;
    minSelections?: number | undefined;
}, {
    options: {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }[];
    type: T.QuestionType.CHECKBOXES;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    allowOther?: boolean | undefined;
    randomizeOptions?: boolean | undefined;
    layout?: T.QuestionLayout | undefined;
    maxSelections?: number | undefined;
    minSelections?: number | undefined;
}>;
export declare const RatingQuestionConfigSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.RATING>;
    minRating: z.ZodNumber;
    maxRating: z.ZodNumber;
    ratingLabels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    style: z.ZodOptional<z.ZodNativeEnum<typeof T.RatingStyle>>;
    showNumbers: z.ZodOptional<z.ZodBoolean>;
    lowLabel: z.ZodOptional<z.ZodString>;
    highLabel: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.RATING;
    required: boolean;
    label: string;
    minRating: number;
    maxRating: number;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    ratingLabels?: string[] | undefined;
    style?: T.RatingStyle | undefined;
    showNumbers?: boolean | undefined;
    lowLabel?: string | undefined;
    highLabel?: string | undefined;
}, {
    type: T.QuestionType.RATING;
    required: boolean;
    label: string;
    minRating: number;
    maxRating: number;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    ratingLabels?: string[] | undefined;
    style?: T.RatingStyle | undefined;
    showNumbers?: boolean | undefined;
    lowLabel?: string | undefined;
    highLabel?: string | undefined;
}>;
export declare const LinearScaleQuestionConfigSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.LINEAR_SCALE>;
    minValue: z.ZodNumber;
    maxValue: z.ZodNumber;
    step: z.ZodOptional<z.ZodNumber>;
    lowLabel: z.ZodOptional<z.ZodString>;
    highLabel: z.ZodOptional<z.ZodString>;
    showNumbers: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.LINEAR_SCALE;
    required: boolean;
    label: string;
    minValue: number;
    maxValue: number;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    step?: number | undefined;
    showNumbers?: boolean | undefined;
    lowLabel?: string | undefined;
    highLabel?: string | undefined;
}, {
    type: T.QuestionType.LINEAR_SCALE;
    required: boolean;
    label: string;
    minValue: number;
    maxValue: number;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    step?: number | undefined;
    showNumbers?: boolean | undefined;
    lowLabel?: string | undefined;
    highLabel?: string | undefined;
}>;
export declare const FileQuestionConfigSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.FILE>;
    allowedTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    maxFileSize: z.ZodOptional<z.ZodNumber>;
    maxFiles: z.ZodOptional<z.ZodNumber>;
    multiple: z.ZodOptional<z.ZodBoolean>;
    uploadText: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.FILE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    allowedTypes?: string[] | undefined;
    maxFileSize?: number | undefined;
    maxFiles?: number | undefined;
    multiple?: boolean | undefined;
    uploadText?: string | undefined;
}, {
    type: T.QuestionType.FILE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    allowedTypes?: string[] | undefined;
    maxFileSize?: number | undefined;
    maxFiles?: number | undefined;
    multiple?: boolean | undefined;
    uploadText?: string | undefined;
}>;
export declare const SignatureQuestionConfigSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.SIGNATURE>;
    canvasWidth: z.ZodOptional<z.ZodNumber>;
    canvasHeight: z.ZodOptional<z.ZodNumber>;
    penColor: z.ZodOptional<z.ZodString>;
    backgroundColor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.SIGNATURE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    canvasWidth?: number | undefined;
    canvasHeight?: number | undefined;
    penColor?: string | undefined;
    backgroundColor?: string | undefined;
}, {
    type: T.QuestionType.SIGNATURE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    canvasWidth?: number | undefined;
    canvasHeight?: number | undefined;
    penColor?: string | undefined;
    backgroundColor?: string | undefined;
}>;
export declare const PaymentQuestionConfigSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.PAYMENT>;
    amount: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodString;
    fixedAmount: z.ZodOptional<z.ZodBoolean>;
    minAmount: z.ZodOptional<z.ZodNumber>;
    maxAmount: z.ZodOptional<z.ZodNumber>;
    paymentDescription: z.ZodOptional<z.ZodString>;
    acceptedMethods: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof T.PaymentMethod>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.PAYMENT;
    required: boolean;
    label: string;
    currency: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    amount?: number | undefined;
    fixedAmount?: boolean | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
    paymentDescription?: string | undefined;
    acceptedMethods?: T.PaymentMethod[] | undefined;
}, {
    type: T.QuestionType.PAYMENT;
    required: boolean;
    label: string;
    currency: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    amount?: number | undefined;
    fixedAmount?: boolean | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
    paymentDescription?: string | undefined;
    acceptedMethods?: T.PaymentMethod[] | undefined;
}>;
export declare const QuestionConfigSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.TEXT>;
    minLength: z.ZodOptional<z.ZodNumber>;
    maxLength: z.ZodOptional<z.ZodNumber>;
    format: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.TEXT;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    format?: string | undefined;
    minLength?: number | undefined;
    maxLength?: number | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
}, {
    type: T.QuestionType.TEXT;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    format?: string | undefined;
    minLength?: number | undefined;
    maxLength?: number | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
}>, z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.TEXTAREA>;
    minLength: z.ZodOptional<z.ZodNumber>;
    maxLength: z.ZodOptional<z.ZodNumber>;
    rows: z.ZodOptional<z.ZodNumber>;
    autoResize: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.TEXTAREA;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    minLength?: number | undefined;
    maxLength?: number | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    rows?: number | undefined;
    autoResize?: boolean | undefined;
}, {
    type: T.QuestionType.TEXTAREA;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    minLength?: number | undefined;
    maxLength?: number | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    rows?: number | undefined;
    autoResize?: boolean | undefined;
}>, z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.EMAIL>;
    validateFormat: z.ZodOptional<z.ZodBoolean>;
    suggestDomains: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.EMAIL;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    validateFormat?: boolean | undefined;
    suggestDomains?: boolean | undefined;
}, {
    type: T.QuestionType.EMAIL;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    validateFormat?: boolean | undefined;
    suggestDomains?: boolean | undefined;
}>, z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.PHONE>;
    format: z.ZodOptional<z.ZodNativeEnum<typeof T.PhoneFormat>>;
    customPattern: z.ZodOptional<z.ZodString>;
    autoFormat: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.PHONE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    format?: T.PhoneFormat | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    customPattern?: string | undefined;
    autoFormat?: boolean | undefined;
}, {
    type: T.QuestionType.PHONE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    format?: T.PhoneFormat | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    customPattern?: string | undefined;
    autoFormat?: boolean | undefined;
}>, z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.URL>;
    validateFormat: z.ZodOptional<z.ZodBoolean>;
    allowedSchemes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.URL;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    validateFormat?: boolean | undefined;
    allowedSchemes?: string[] | undefined;
}, {
    type: T.QuestionType.URL;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    validateFormat?: boolean | undefined;
    allowedSchemes?: string[] | undefined;
}>, z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.NUMBER>;
    min: z.ZodOptional<z.ZodNumber>;
    max: z.ZodOptional<z.ZodNumber>;
    step: z.ZodOptional<z.ZodNumber>;
    decimalPlaces: z.ZodOptional<z.ZodNumber>;
    useThousandSeparator: z.ZodOptional<z.ZodBoolean>;
    currency: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.NUMBER;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    max?: number | undefined;
    min?: number | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    step?: number | undefined;
    decimalPlaces?: number | undefined;
    useThousandSeparator?: boolean | undefined;
    currency?: string | undefined;
}, {
    type: T.QuestionType.NUMBER;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    max?: number | undefined;
    min?: number | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    step?: number | undefined;
    decimalPlaces?: number | undefined;
    useThousandSeparator?: boolean | undefined;
    currency?: string | undefined;
}>, z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.DATE>;
    minDate: z.ZodOptional<z.ZodString>;
    maxDate: z.ZodOptional<z.ZodString>;
    dateFormat: z.ZodOptional<z.ZodString>;
    includeTime: z.ZodOptional<z.ZodBoolean>;
    defaultDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.DATE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    minDate?: string | undefined;
    maxDate?: string | undefined;
    dateFormat?: string | undefined;
    includeTime?: boolean | undefined;
    defaultDate?: string | undefined;
}, {
    type: T.QuestionType.DATE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    minDate?: string | undefined;
    maxDate?: string | undefined;
    dateFormat?: string | undefined;
    includeTime?: boolean | undefined;
    defaultDate?: string | undefined;
}>, z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.TIME>;
    format: z.ZodOptional<z.ZodNativeEnum<typeof T.TimeFormat>>;
    minuteStep: z.ZodOptional<z.ZodNumber>;
    defaultTime: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.TIME;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    format?: T.TimeFormat | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    minuteStep?: number | undefined;
    defaultTime?: string | undefined;
}, {
    type: T.QuestionType.TIME;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    format?: T.TimeFormat | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    minuteStep?: number | undefined;
    defaultTime?: string | undefined;
}>, z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.MULTIPLE_CHOICE>;
    options: z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        text: z.ZodString;
        value: z.ZodOptional<z.ZodString>;
        isDefault: z.ZodOptional<z.ZodBoolean>;
        imageUrl: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }, {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }>, "many">;
    allowOther: z.ZodOptional<z.ZodBoolean>;
    randomizeOptions: z.ZodOptional<z.ZodBoolean>;
    layout: z.ZodOptional<z.ZodNativeEnum<typeof T.QuestionLayout>>;
}, "strip", z.ZodTypeAny, {
    options: {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }[];
    type: T.QuestionType.MULTIPLE_CHOICE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    allowOther?: boolean | undefined;
    randomizeOptions?: boolean | undefined;
    layout?: T.QuestionLayout | undefined;
}, {
    options: {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }[];
    type: T.QuestionType.MULTIPLE_CHOICE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    allowOther?: boolean | undefined;
    randomizeOptions?: boolean | undefined;
    layout?: T.QuestionLayout | undefined;
}>, z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.DROPDOWN>;
    options: z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        text: z.ZodString;
        value: z.ZodOptional<z.ZodString>;
        isDefault: z.ZodOptional<z.ZodBoolean>;
        imageUrl: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }, {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }>, "many">;
    allowOther: z.ZodOptional<z.ZodBoolean>;
    searchable: z.ZodOptional<z.ZodBoolean>;
    dropdownPlaceholder: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    options: {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }[];
    type: T.QuestionType.DROPDOWN;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    allowOther?: boolean | undefined;
    searchable?: boolean | undefined;
    dropdownPlaceholder?: string | undefined;
}, {
    options: {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }[];
    type: T.QuestionType.DROPDOWN;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    allowOther?: boolean | undefined;
    searchable?: boolean | undefined;
    dropdownPlaceholder?: string | undefined;
}>, z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.CHECKBOXES>;
    options: z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        text: z.ZodString;
        value: z.ZodOptional<z.ZodString>;
        isDefault: z.ZodOptional<z.ZodBoolean>;
        imageUrl: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }, {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }>, "many">;
    minSelections: z.ZodOptional<z.ZodNumber>;
    maxSelections: z.ZodOptional<z.ZodNumber>;
    allowOther: z.ZodOptional<z.ZodBoolean>;
    randomizeOptions: z.ZodOptional<z.ZodBoolean>;
    layout: z.ZodOptional<z.ZodNativeEnum<typeof T.QuestionLayout>>;
}, "strip", z.ZodTypeAny, {
    options: {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }[];
    type: T.QuestionType.CHECKBOXES;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    allowOther?: boolean | undefined;
    randomizeOptions?: boolean | undefined;
    layout?: T.QuestionLayout | undefined;
    maxSelections?: number | undefined;
    minSelections?: number | undefined;
}, {
    options: {
        text: string;
        value?: string | undefined;
        metadata?: Record<string, any> | undefined;
        id?: string | undefined;
        isDefault?: boolean | undefined;
        imageUrl?: string | undefined;
    }[];
    type: T.QuestionType.CHECKBOXES;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    allowOther?: boolean | undefined;
    randomizeOptions?: boolean | undefined;
    layout?: T.QuestionLayout | undefined;
    maxSelections?: number | undefined;
    minSelections?: number | undefined;
}>, z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.RATING>;
    minRating: z.ZodNumber;
    maxRating: z.ZodNumber;
    ratingLabels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    style: z.ZodOptional<z.ZodNativeEnum<typeof T.RatingStyle>>;
    showNumbers: z.ZodOptional<z.ZodBoolean>;
    lowLabel: z.ZodOptional<z.ZodString>;
    highLabel: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.RATING;
    required: boolean;
    label: string;
    minRating: number;
    maxRating: number;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    ratingLabels?: string[] | undefined;
    style?: T.RatingStyle | undefined;
    showNumbers?: boolean | undefined;
    lowLabel?: string | undefined;
    highLabel?: string | undefined;
}, {
    type: T.QuestionType.RATING;
    required: boolean;
    label: string;
    minRating: number;
    maxRating: number;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    ratingLabels?: string[] | undefined;
    style?: T.RatingStyle | undefined;
    showNumbers?: boolean | undefined;
    lowLabel?: string | undefined;
    highLabel?: string | undefined;
}>, z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.LINEAR_SCALE>;
    minValue: z.ZodNumber;
    maxValue: z.ZodNumber;
    step: z.ZodOptional<z.ZodNumber>;
    lowLabel: z.ZodOptional<z.ZodString>;
    highLabel: z.ZodOptional<z.ZodString>;
    showNumbers: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.LINEAR_SCALE;
    required: boolean;
    label: string;
    minValue: number;
    maxValue: number;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    step?: number | undefined;
    showNumbers?: boolean | undefined;
    lowLabel?: string | undefined;
    highLabel?: string | undefined;
}, {
    type: T.QuestionType.LINEAR_SCALE;
    required: boolean;
    label: string;
    minValue: number;
    maxValue: number;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    step?: number | undefined;
    showNumbers?: boolean | undefined;
    lowLabel?: string | undefined;
    highLabel?: string | undefined;
}>, z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.FILE>;
    allowedTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    maxFileSize: z.ZodOptional<z.ZodNumber>;
    maxFiles: z.ZodOptional<z.ZodNumber>;
    multiple: z.ZodOptional<z.ZodBoolean>;
    uploadText: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.FILE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    allowedTypes?: string[] | undefined;
    maxFileSize?: number | undefined;
    maxFiles?: number | undefined;
    multiple?: boolean | undefined;
    uploadText?: string | undefined;
}, {
    type: T.QuestionType.FILE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    allowedTypes?: string[] | undefined;
    maxFileSize?: number | undefined;
    maxFiles?: number | undefined;
    multiple?: boolean | undefined;
    uploadText?: string | undefined;
}>, z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.SIGNATURE>;
    canvasWidth: z.ZodOptional<z.ZodNumber>;
    canvasHeight: z.ZodOptional<z.ZodNumber>;
    penColor: z.ZodOptional<z.ZodString>;
    backgroundColor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.SIGNATURE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    canvasWidth?: number | undefined;
    canvasHeight?: number | undefined;
    penColor?: string | undefined;
    backgroundColor?: string | undefined;
}, {
    type: T.QuestionType.SIGNATURE;
    required: boolean;
    label: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    canvasWidth?: number | undefined;
    canvasHeight?: number | undefined;
    penColor?: string | undefined;
    backgroundColor?: string | undefined;
}>, z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodString>;
    validation: any;
    logic: any;
    order: z.ZodOptional<z.ZodNumber>;
} & {
    type: z.ZodLiteral<T.QuestionType.PAYMENT>;
    amount: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodString;
    fixedAmount: z.ZodOptional<z.ZodBoolean>;
    minAmount: z.ZodOptional<z.ZodNumber>;
    maxAmount: z.ZodOptional<z.ZodNumber>;
    paymentDescription: z.ZodOptional<z.ZodString>;
    acceptedMethods: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof T.PaymentMethod>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: T.QuestionType.PAYMENT;
    required: boolean;
    label: string;
    currency: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    amount?: number | undefined;
    fixedAmount?: boolean | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
    paymentDescription?: string | undefined;
    acceptedMethods?: T.PaymentMethod[] | undefined;
}, {
    type: T.QuestionType.PAYMENT;
    required: boolean;
    label: string;
    currency: string;
    validation?: any;
    description?: string | undefined;
    id?: string | undefined;
    placeholder?: string | undefined;
    logic?: any;
    order?: number | undefined;
    amount?: number | undefined;
    fixedAmount?: boolean | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
    paymentDescription?: string | undefined;
    acceptedMethods?: T.PaymentMethod[] | undefined;
}>]>;
export declare const BaseValidationRuleSchema: z.ZodObject<{
    errorMessage: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    errorMessage?: string | undefined;
    enabled?: boolean | undefined;
}, {
    errorMessage?: string | undefined;
    enabled?: boolean | undefined;
}>;
export declare const RequiredValidationSchema: z.ZodObject<{
    errorMessage: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"required">;
    required: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    type: "required";
    required: true;
    errorMessage?: string | undefined;
    enabled?: boolean | undefined;
}, {
    type: "required";
    required: true;
    errorMessage?: string | undefined;
    enabled?: boolean | undefined;
}>;
export declare const LengthValidationSchema: z.ZodObject<{
    errorMessage: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"length">;
    minLength: z.ZodOptional<z.ZodNumber>;
    maxLength: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "length";
    minLength?: number | undefined;
    maxLength?: number | undefined;
    errorMessage?: string | undefined;
    enabled?: boolean | undefined;
}, {
    type: "length";
    minLength?: number | undefined;
    maxLength?: number | undefined;
    errorMessage?: string | undefined;
    enabled?: boolean | undefined;
}>;
export declare const NumericValidationSchema: z.ZodObject<{
    errorMessage: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"numeric">;
    min: z.ZodOptional<z.ZodNumber>;
    max: z.ZodOptional<z.ZodNumber>;
    step: z.ZodOptional<z.ZodNumber>;
    decimalPlaces: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "numeric";
    max?: number | undefined;
    min?: number | undefined;
    step?: number | undefined;
    decimalPlaces?: number | undefined;
    errorMessage?: string | undefined;
    enabled?: boolean | undefined;
}, {
    type: "numeric";
    max?: number | undefined;
    min?: number | undefined;
    step?: number | undefined;
    decimalPlaces?: number | undefined;
    errorMessage?: string | undefined;
    enabled?: boolean | undefined;
}>;
export declare const PatternValidationSchema: z.ZodObject<{
    errorMessage: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"pattern">;
    pattern: z.ZodString;
    flags: z.ZodOptional<z.ZodString>;
    caseSensitive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "pattern";
    pattern: string;
    flags?: string | undefined;
    caseSensitive?: boolean | undefined;
    errorMessage?: string | undefined;
    enabled?: boolean | undefined;
}, {
    type: "pattern";
    pattern: string;
    flags?: string | undefined;
    caseSensitive?: boolean | undefined;
    errorMessage?: string | undefined;
    enabled?: boolean | undefined;
}>;
export declare const EmailValidationSchema: z.ZodObject<{
    errorMessage: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"email">;
    allowedDomains: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    blockedDomains: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    requireTLD: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "email";
    errorMessage?: string | undefined;
    allowedDomains?: string[] | undefined;
    blockedDomains?: string[] | undefined;
    requireTLD?: boolean | undefined;
    enabled?: boolean | undefined;
}, {
    type: "email";
    errorMessage?: string | undefined;
    allowedDomains?: string[] | undefined;
    blockedDomains?: string[] | undefined;
    requireTLD?: boolean | undefined;
    enabled?: boolean | undefined;
}>;
export declare const UrlValidationSchema: z.ZodObject<{
    errorMessage: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"url">;
    allowedSchemes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    requireScheme: z.ZodOptional<z.ZodBoolean>;
    allowedDomains: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "url";
    allowedSchemes?: string[] | undefined;
    errorMessage?: string | undefined;
    allowedDomains?: string[] | undefined;
    requireScheme?: boolean | undefined;
    enabled?: boolean | undefined;
}, {
    type: "url";
    allowedSchemes?: string[] | undefined;
    errorMessage?: string | undefined;
    allowedDomains?: string[] | undefined;
    requireScheme?: boolean | undefined;
    enabled?: boolean | undefined;
}>;
export declare const PhoneValidationSchema: z.ZodObject<{
    errorMessage: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"phone">;
    format: z.ZodOptional<z.ZodNativeEnum<typeof T.PhoneFormat>>;
    country: z.ZodOptional<z.ZodString>;
    allowInternational: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "phone";
    format?: T.PhoneFormat | undefined;
    errorMessage?: string | undefined;
    country?: string | undefined;
    allowInternational?: boolean | undefined;
    enabled?: boolean | undefined;
}, {
    type: "phone";
    format?: T.PhoneFormat | undefined;
    errorMessage?: string | undefined;
    country?: string | undefined;
    allowInternational?: boolean | undefined;
    enabled?: boolean | undefined;
}>;
export declare const DateValidationSchema: z.ZodObject<{
    errorMessage: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"date">;
    minDate: z.ZodOptional<z.ZodString>;
    maxDate: z.ZodOptional<z.ZodString>;
    allowPast: z.ZodOptional<z.ZodBoolean>;
    allowFuture: z.ZodOptional<z.ZodBoolean>;
    excludeDates: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    excludeWeekends: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "date";
    minDate?: string | undefined;
    maxDate?: string | undefined;
    errorMessage?: string | undefined;
    allowPast?: boolean | undefined;
    allowFuture?: boolean | undefined;
    excludeDates?: string[] | undefined;
    excludeWeekends?: boolean | undefined;
    enabled?: boolean | undefined;
}, {
    type: "date";
    minDate?: string | undefined;
    maxDate?: string | undefined;
    errorMessage?: string | undefined;
    allowPast?: boolean | undefined;
    allowFuture?: boolean | undefined;
    excludeDates?: string[] | undefined;
    excludeWeekends?: boolean | undefined;
    enabled?: boolean | undefined;
}>;
export declare const TimeValidationSchema: z.ZodObject<{
    errorMessage: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"time">;
    minTime: z.ZodOptional<z.ZodString>;
    maxTime: z.ZodOptional<z.ZodString>;
    allowedTimeSlots: z.ZodOptional<z.ZodArray<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        end: string;
        start: string;
    }, {
        end: string;
        start: string;
    }>, "many">>;
    excludeTimeSlots: z.ZodOptional<z.ZodArray<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        end: string;
        start: string;
    }, {
        end: string;
        start: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "time";
    errorMessage?: string | undefined;
    minTime?: string | undefined;
    maxTime?: string | undefined;
    allowedTimeSlots?: {
        end: string;
        start: string;
    }[] | undefined;
    excludeTimeSlots?: {
        end: string;
        start: string;
    }[] | undefined;
    enabled?: boolean | undefined;
}, {
    type: "time";
    errorMessage?: string | undefined;
    minTime?: string | undefined;
    maxTime?: string | undefined;
    allowedTimeSlots?: {
        end: string;
        start: string;
    }[] | undefined;
    excludeTimeSlots?: {
        end: string;
        start: string;
    }[] | undefined;
    enabled?: boolean | undefined;
}>;
export declare const FileValidationSchema: z.ZodObject<{
    errorMessage: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"file">;
    allowedTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    blockedTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    maxFileSize: z.ZodOptional<z.ZodNumber>;
    minFileSize: z.ZodOptional<z.ZodNumber>;
    maxFiles: z.ZodOptional<z.ZodNumber>;
    minFiles: z.ZodOptional<z.ZodNumber>;
    allowedExtensions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    blockedExtensions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "file";
    allowedTypes?: string[] | undefined;
    maxFileSize?: number | undefined;
    maxFiles?: number | undefined;
    errorMessage?: string | undefined;
    blockedTypes?: string[] | undefined;
    minFileSize?: number | undefined;
    minFiles?: number | undefined;
    allowedExtensions?: string[] | undefined;
    blockedExtensions?: string[] | undefined;
    enabled?: boolean | undefined;
}, {
    type: "file";
    allowedTypes?: string[] | undefined;
    maxFileSize?: number | undefined;
    maxFiles?: number | undefined;
    errorMessage?: string | undefined;
    blockedTypes?: string[] | undefined;
    minFileSize?: number | undefined;
    minFiles?: number | undefined;
    allowedExtensions?: string[] | undefined;
    blockedExtensions?: string[] | undefined;
    enabled?: boolean | undefined;
}>;
export declare const ChoiceValidationSchema: z.ZodObject<{
    errorMessage: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"choice">;
    minSelections: z.ZodOptional<z.ZodNumber>;
    maxSelections: z.ZodOptional<z.ZodNumber>;
    requiredOptions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    forbiddenCombinations: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodString, "many">, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "choice";
    maxSelections?: number | undefined;
    minSelections?: number | undefined;
    errorMessage?: string | undefined;
    requiredOptions?: string[] | undefined;
    forbiddenCombinations?: string[][] | undefined;
    enabled?: boolean | undefined;
}, {
    type: "choice";
    maxSelections?: number | undefined;
    minSelections?: number | undefined;
    errorMessage?: string | undefined;
    requiredOptions?: string[] | undefined;
    forbiddenCombinations?: string[][] | undefined;
    enabled?: boolean | undefined;
}>;
export declare const RatingValidationSchema: z.ZodObject<{
    errorMessage: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"rating">;
    minRating: z.ZodOptional<z.ZodNumber>;
    maxRating: z.ZodOptional<z.ZodNumber>;
    requiredRating: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "rating";
    minRating?: number | undefined;
    maxRating?: number | undefined;
    errorMessage?: string | undefined;
    requiredRating?: boolean | undefined;
    enabled?: boolean | undefined;
}, {
    type: "rating";
    minRating?: number | undefined;
    maxRating?: number | undefined;
    errorMessage?: string | undefined;
    requiredRating?: boolean | undefined;
    enabled?: boolean | undefined;
}>;
export declare const CustomValidationSchema: z.ZodObject<{
    errorMessage: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"custom">;
    validator: z.ZodUnion<[z.ZodString, z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnion<[z.ZodBoolean, z.ZodString]>>]>;
    async: z.ZodOptional<z.ZodBoolean>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "custom";
    validator: string | ((...args: unknown[]) => string | boolean);
    errorMessage?: string | undefined;
    async?: boolean | undefined;
    dependencies?: string[] | undefined;
    enabled?: boolean | undefined;
}, {
    type: "custom";
    validator: string | ((...args: unknown[]) => string | boolean);
    errorMessage?: string | undefined;
    async?: boolean | undefined;
    dependencies?: string[] | undefined;
    enabled?: boolean | undefined;
}>;
export declare const LogicConditionSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    questionId: z.ZodString;
    operator: z.ZodNativeEnum<typeof T.LogicOperator>;
    value: z.ZodAny;
    caseSensitive: z.ZodOptional<z.ZodBoolean>;
    negate: z.ZodOptional<z.ZodBoolean>;
    errorMessage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    questionId: string;
    operator: T.LogicOperator;
    value?: any;
    id?: string | undefined;
    caseSensitive?: boolean | undefined;
    errorMessage?: string | undefined;
    negate?: boolean | undefined;
}, {
    questionId: string;
    operator: T.LogicOperator;
    value?: any;
    id?: string | undefined;
    caseSensitive?: boolean | undefined;
    errorMessage?: string | undefined;
    negate?: boolean | undefined;
}>;
export declare const BaseConditionalActionSchema: z.ZodObject<{
    action: z.ZodNativeEnum<typeof T.ConditionalAction>;
    enabled: z.ZodOptional<z.ZodBoolean>;
    delay: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    action: T.ConditionalAction;
    enabled?: boolean | undefined;
    delay?: number | undefined;
}, {
    action: T.ConditionalAction;
    enabled?: boolean | undefined;
    delay?: number | undefined;
}>;
export declare const ShowHideActionSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    delay: z.ZodOptional<z.ZodNumber>;
} & {
    action: z.ZodUnion<[z.ZodLiteral<T.ConditionalAction.SHOW>, z.ZodLiteral<T.ConditionalAction.HIDE>]>;
    animation: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"fade">, z.ZodLiteral<"slide">, z.ZodLiteral<"none">]>>;
    animationDuration: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    action: T.ConditionalAction.SHOW | T.ConditionalAction.HIDE;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    animation?: "none" | "fade" | "slide" | undefined;
    animationDuration?: number | undefined;
}, {
    action: T.ConditionalAction.SHOW | T.ConditionalAction.HIDE;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    animation?: "none" | "fade" | "slide" | undefined;
    animationDuration?: number | undefined;
}>;
export declare const RequireActionSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    delay: z.ZodOptional<z.ZodNumber>;
} & {
    action: z.ZodUnion<[z.ZodLiteral<T.ConditionalAction.REQUIRE>, z.ZodLiteral<T.ConditionalAction.MAKE_OPTIONAL>]>;
    validationMessage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: T.ConditionalAction.REQUIRE | T.ConditionalAction.MAKE_OPTIONAL;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    validationMessage?: string | undefined;
}, {
    action: T.ConditionalAction.REQUIRE | T.ConditionalAction.MAKE_OPTIONAL;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    validationMessage?: string | undefined;
}>;
export declare const JumpToActionSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    delay: z.ZodOptional<z.ZodNumber>;
} & {
    action: z.ZodLiteral<T.ConditionalAction.JUMP_TO>;
    targetQuestionId: z.ZodString;
    skipValidation: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    action: T.ConditionalAction.JUMP_TO;
    targetQuestionId: string;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    skipValidation?: boolean | undefined;
}, {
    action: T.ConditionalAction.JUMP_TO;
    targetQuestionId: string;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    skipValidation?: boolean | undefined;
}>;
export declare const JumpToPageActionSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    delay: z.ZodOptional<z.ZodNumber>;
} & {
    action: z.ZodLiteral<T.ConditionalAction.JUMP_TO_PAGE>;
    targetPage: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    skipValidation: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    action: T.ConditionalAction.JUMP_TO_PAGE;
    targetPage: string | number;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    skipValidation?: boolean | undefined;
}, {
    action: T.ConditionalAction.JUMP_TO_PAGE;
    targetPage: string | number;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    skipValidation?: boolean | undefined;
}>;
export declare const SetValueActionSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    delay: z.ZodOptional<z.ZodNumber>;
} & {
    action: z.ZodLiteral<T.ConditionalAction.SET_VALUE>;
    targetQuestionId: z.ZodString;
    value: z.ZodAny;
    triggerValidation: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    action: T.ConditionalAction.SET_VALUE;
    targetQuestionId: string;
    value?: any;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    triggerValidation?: boolean | undefined;
}, {
    action: T.ConditionalAction.SET_VALUE;
    targetQuestionId: string;
    value?: any;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    triggerValidation?: boolean | undefined;
}>;
export declare const ClearValueActionSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    delay: z.ZodOptional<z.ZodNumber>;
} & {
    action: z.ZodLiteral<T.ConditionalAction.CLEAR_VALUE>;
    targetQuestionId: z.ZodString;
    triggerValidation: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    action: T.ConditionalAction.CLEAR_VALUE;
    targetQuestionId: string;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    triggerValidation?: boolean | undefined;
}, {
    action: T.ConditionalAction.CLEAR_VALUE;
    targetQuestionId: string;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    triggerValidation?: boolean | undefined;
}>;
export declare const EnableDisableActionSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    delay: z.ZodOptional<z.ZodNumber>;
} & {
    action: z.ZodUnion<[z.ZodLiteral<T.ConditionalAction.ENABLE>, z.ZodLiteral<T.ConditionalAction.DISABLE>]>;
    disabledStyle: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"grayed_out">, z.ZodLiteral<"hidden">, z.ZodLiteral<"readonly">]>>;
}, "strip", z.ZodTypeAny, {
    action: T.ConditionalAction.DISABLE | T.ConditionalAction.ENABLE;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    disabledStyle?: "readonly" | "grayed_out" | "hidden" | undefined;
}, {
    action: T.ConditionalAction.DISABLE | T.ConditionalAction.ENABLE;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    disabledStyle?: "readonly" | "grayed_out" | "hidden" | undefined;
}>;
export declare const ShowMessageActionSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    delay: z.ZodOptional<z.ZodNumber>;
} & {
    action: z.ZodLiteral<T.ConditionalAction.SHOW_MESSAGE>;
    message: z.ZodString;
    messageType: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"info">, z.ZodLiteral<"warning">, z.ZodLiteral<"error">, z.ZodLiteral<"success">]>>;
    duration: z.ZodOptional<z.ZodNumber>;
    position: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"above">, z.ZodLiteral<"below">, z.ZodLiteral<"inline">, z.ZodLiteral<"popup">]>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    action: T.ConditionalAction.SHOW_MESSAGE;
    messageType?: "error" | "info" | "success" | "warning" | undefined;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    duration?: number | undefined;
    position?: "above" | "below" | "inline" | "popup" | undefined;
}, {
    message: string;
    action: T.ConditionalAction.SHOW_MESSAGE;
    messageType?: "error" | "info" | "success" | "warning" | undefined;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    duration?: number | undefined;
    position?: "above" | "below" | "inline" | "popup" | undefined;
}>;
export declare const RedirectActionSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    delay: z.ZodOptional<z.ZodNumber>;
} & {
    action: z.ZodLiteral<T.ConditionalAction.REDIRECT>;
    url: z.ZodString;
    newWindow: z.ZodOptional<z.ZodBoolean>;
    confirmationMessage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    url: string;
    action: T.ConditionalAction.REDIRECT;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    newWindow?: boolean | undefined;
    confirmationMessage?: string | undefined;
}, {
    url: string;
    action: T.ConditionalAction.REDIRECT;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    newWindow?: boolean | undefined;
    confirmationMessage?: string | undefined;
}>;
export declare const SubmitFormActionSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    delay: z.ZodOptional<z.ZodNumber>;
} & {
    action: z.ZodLiteral<T.ConditionalAction.SUBMIT_FORM>;
    validateBeforeSubmit: z.ZodOptional<z.ZodBoolean>;
    customEndpoint: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: T.ConditionalAction.SUBMIT_FORM;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    validateBeforeSubmit?: boolean | undefined;
    customEndpoint?: string | undefined;
}, {
    action: T.ConditionalAction.SUBMIT_FORM;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    validateBeforeSubmit?: boolean | undefined;
    customEndpoint?: string | undefined;
}>;
export declare const SkipActionSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    delay: z.ZodOptional<z.ZodNumber>;
} & {
    action: z.ZodLiteral<T.ConditionalAction.SKIP>;
    skipCount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    action: T.ConditionalAction.SKIP;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    skipCount?: number | undefined;
}, {
    action: T.ConditionalAction.SKIP;
    enabled?: boolean | undefined;
    delay?: number | undefined;
    skipCount?: number | undefined;
}>;
export declare const FormConfigSchema: any;
export declare function validateFormConfig(config: unknown): {
    success: boolean;
    data?: T.FormConfig;
    error?: z.ZodError;
};
export declare function serializeFormConfig(config: T.FormConfig): string;
export declare function deserializeFormConfig(json: string): T.FormConfig;
export declare function getValidationRulesForQuestion(config: T.FormConfig, questionId: string): T.ValidationRule[] | undefined;
export declare function getLogicRulesAffectingQuestion(config: T.FormConfig, questionId: string): T.ConditionalLogic[];
//# sourceMappingURL=form-config-schemas.d.ts.map
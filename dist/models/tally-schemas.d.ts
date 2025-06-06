import { z } from 'zod';
export declare const TallyApiResponseSchema: z.ZodObject<{
    data: z.ZodUnknown;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    hasMore: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    hasMore?: boolean | undefined;
    data?: unknown;
    limit?: number | undefined;
    page?: number | undefined;
}, {
    hasMore?: boolean | undefined;
    data?: unknown;
    limit?: number | undefined;
    page?: number | undefined;
}>;
export declare const TallyApiErrorResponseSchema: z.ZodObject<{
    error: z.ZodObject<{
        message: z.ZodString;
        code: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        code?: string | undefined;
        details?: unknown;
    }, {
        message: string;
        code?: string | undefined;
        details?: unknown;
    }>;
}, "strip", z.ZodTypeAny, {
    error: {
        message: string;
        code?: string | undefined;
        details?: unknown;
    };
}, {
    error: {
        message: string;
        code?: string | undefined;
        details?: unknown;
    };
}>;
export declare const TallyFieldTypeSchema: z.ZodEnum<["INPUT_TEXT", "INPUT_NUMBER", "INPUT_EMAIL", "INPUT_PHONE_NUMBER", "INPUT_LINK", "INPUT_DATE", "INPUT_TIME", "TEXTAREA", "MULTIPLE_CHOICE", "DROPDOWN", "CHECKBOXES", "LINEAR_SCALE", "FILE_UPLOAD", "HIDDEN_FIELDS", "CALCULATED_FIELDS", "RATING", "MULTI_SELECT", "MATRIX", "RANKING", "SIGNATURE", "PAYMENT", "FORM_TITLE"]>;
export declare const TallyFileUploadSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    url: z.ZodString;
    mimeType: z.ZodString;
    size: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    mimeType: string;
    url: string;
    id: string;
    size: number;
}, {
    name: string;
    mimeType: string;
    url: string;
    id: string;
    size: number;
}>;
export declare const TallyOptionSchema: z.ZodObject<{
    id: z.ZodString;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
    id: string;
}, {
    text: string;
    id: string;
}>;
export declare const TallyMatrixSchema: z.ZodObject<{
    rows: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
        id: string;
    }, {
        text: string;
        id: string;
    }>, "many">;
    columns: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
        id: string;
    }, {
        text: string;
        id: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    rows: {
        text: string;
        id: string;
    }[];
    columns: {
        text: string;
        id: string;
    }[];
}, {
    rows: {
        text: string;
        id: string;
    }[];
    columns: {
        text: string;
        id: string;
    }[];
}>;
export declare const TallyFormFieldSchema: z.ZodSchema<any>;
export declare const TallyQuestionSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["INPUT_TEXT", "INPUT_NUMBER", "INPUT_EMAIL", "INPUT_PHONE_NUMBER", "INPUT_LINK", "INPUT_DATE", "INPUT_TIME", "TEXTAREA", "MULTIPLE_CHOICE", "DROPDOWN", "CHECKBOXES", "LINEAR_SCALE", "FILE_UPLOAD", "HIDDEN_FIELDS", "CALCULATED_FIELDS", "RATING", "MULTI_SELECT", "MATRIX", "RANKING", "SIGNATURE", "PAYMENT", "FORM_TITLE"]>;
    title: z.ZodString;
    isTitleModifiedByUser: z.ZodOptional<z.ZodBoolean>;
    formId: z.ZodString;
    isDeleted: z.ZodOptional<z.ZodBoolean>;
    numberOfResponses: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    fields: z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "RATING" | "TEXTAREA" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "MULTIPLE_CHOICE" | "SIGNATURE" | "PAYMENT" | "MATRIX" | "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "MULTI_SELECT" | "RANKING" | "FORM_TITLE";
    title: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    formId: string;
    fields: any[];
    isTitleModifiedByUser?: boolean | undefined;
    isDeleted?: boolean | undefined;
    numberOfResponses?: number | undefined;
}, {
    type: "RATING" | "TEXTAREA" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "MULTIPLE_CHOICE" | "SIGNATURE" | "PAYMENT" | "MATRIX" | "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "MULTI_SELECT" | "RANKING" | "FORM_TITLE";
    title: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    formId: string;
    fields: any[];
    isTitleModifiedByUser?: boolean | undefined;
    isDeleted?: boolean | undefined;
    numberOfResponses?: number | undefined;
}>;
export declare const TallyFormResponseSchema: z.ZodObject<{
    questionId: z.ZodString;
    value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        url: z.ZodString;
        mimeType: z.ZodString;
        size: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        mimeType: string;
        url: string;
        id: string;
        size: number;
    }, {
        name: string;
        mimeType: string;
        url: string;
        id: string;
        size: number;
    }>, "many">, z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>, z.ZodNull]>;
}, "strip", z.ZodTypeAny, {
    value: string | number | boolean | string[] | {
        name: string;
        mimeType: string;
        url: string;
        id: string;
        size: number;
    }[] | Record<string, string[]> | null;
    questionId: string;
}, {
    value: string | number | boolean | string[] | {
        name: string;
        mimeType: string;
        url: string;
        id: string;
        size: number;
    }[] | Record<string, string[]> | null;
    questionId: string;
}>;
export declare const TallySubmissionSchema: z.ZodObject<{
    id: z.ZodString;
    formId: z.ZodString;
    isCompleted: z.ZodBoolean;
    submittedAt: z.ZodString;
    responses: z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            url: z.ZodString;
            mimeType: z.ZodString;
            size: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            name: string;
            mimeType: string;
            url: string;
            id: string;
            size: number;
        }, {
            name: string;
            mimeType: string;
            url: string;
            id: string;
            size: number;
        }>, "many">, z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>, z.ZodNull]>;
    }, "strip", z.ZodTypeAny, {
        value: string | number | boolean | string[] | {
            name: string;
            mimeType: string;
            url: string;
            id: string;
            size: number;
        }[] | Record<string, string[]> | null;
        questionId: string;
    }, {
        value: string | number | boolean | string[] | {
            name: string;
            mimeType: string;
            url: string;
            id: string;
            size: number;
        }[] | Record<string, string[]> | null;
        questionId: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    formId: string;
    isCompleted: boolean;
    submittedAt: string;
    responses: {
        value: string | number | boolean | string[] | {
            name: string;
            mimeType: string;
            url: string;
            id: string;
            size: number;
        }[] | Record<string, string[]> | null;
        questionId: string;
    }[];
}, {
    id: string;
    formId: string;
    isCompleted: boolean;
    submittedAt: string;
    responses: {
        value: string | number | boolean | string[] | {
            name: string;
            mimeType: string;
            url: string;
            id: string;
            size: number;
        }[] | Record<string, string[]> | null;
        questionId: string;
    }[];
}>;
export declare const TallySubmissionsResponseSchema: z.ZodObject<{
    page: z.ZodNumber;
    limit: z.ZodNumber;
    hasMore: z.ZodBoolean;
    totalNumberOfSubmissionsPerFilter: z.ZodObject<{
        all: z.ZodNumber;
        completed: z.ZodNumber;
        partial: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        all: number;
        completed: number;
        partial: number;
    }, {
        all: number;
        completed: number;
        partial: number;
    }>;
    questions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["INPUT_TEXT", "INPUT_NUMBER", "INPUT_EMAIL", "INPUT_PHONE_NUMBER", "INPUT_LINK", "INPUT_DATE", "INPUT_TIME", "TEXTAREA", "MULTIPLE_CHOICE", "DROPDOWN", "CHECKBOXES", "LINEAR_SCALE", "FILE_UPLOAD", "HIDDEN_FIELDS", "CALCULATED_FIELDS", "RATING", "MULTI_SELECT", "MATRIX", "RANKING", "SIGNATURE", "PAYMENT", "FORM_TITLE"]>;
        title: z.ZodString;
        isTitleModifiedByUser: z.ZodOptional<z.ZodBoolean>;
        formId: z.ZodString;
        isDeleted: z.ZodOptional<z.ZodBoolean>;
        numberOfResponses: z.ZodOptional<z.ZodNumber>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        fields: z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "RATING" | "TEXTAREA" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "MULTIPLE_CHOICE" | "SIGNATURE" | "PAYMENT" | "MATRIX" | "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "MULTI_SELECT" | "RANKING" | "FORM_TITLE";
        title: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        formId: string;
        fields: any[];
        isTitleModifiedByUser?: boolean | undefined;
        isDeleted?: boolean | undefined;
        numberOfResponses?: number | undefined;
    }, {
        type: "RATING" | "TEXTAREA" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "MULTIPLE_CHOICE" | "SIGNATURE" | "PAYMENT" | "MATRIX" | "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "MULTI_SELECT" | "RANKING" | "FORM_TITLE";
        title: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        formId: string;
        fields: any[];
        isTitleModifiedByUser?: boolean | undefined;
        isDeleted?: boolean | undefined;
        numberOfResponses?: number | undefined;
    }>, "many">;
    submissions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        formId: z.ZodString;
        isCompleted: z.ZodBoolean;
        submittedAt: z.ZodString;
        responses: z.ZodArray<z.ZodObject<{
            questionId: z.ZodString;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                url: z.ZodString;
                mimeType: z.ZodString;
                size: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                name: string;
                mimeType: string;
                url: string;
                id: string;
                size: number;
            }, {
                name: string;
                mimeType: string;
                url: string;
                id: string;
                size: number;
            }>, "many">, z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>, z.ZodNull]>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean | string[] | {
                name: string;
                mimeType: string;
                url: string;
                id: string;
                size: number;
            }[] | Record<string, string[]> | null;
            questionId: string;
        }, {
            value: string | number | boolean | string[] | {
                name: string;
                mimeType: string;
                url: string;
                id: string;
                size: number;
            }[] | Record<string, string[]> | null;
            questionId: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        formId: string;
        isCompleted: boolean;
        submittedAt: string;
        responses: {
            value: string | number | boolean | string[] | {
                name: string;
                mimeType: string;
                url: string;
                id: string;
                size: number;
            }[] | Record<string, string[]> | null;
            questionId: string;
        }[];
    }, {
        id: string;
        formId: string;
        isCompleted: boolean;
        submittedAt: string;
        responses: {
            value: string | number | boolean | string[] | {
                name: string;
                mimeType: string;
                url: string;
                id: string;
                size: number;
            }[] | Record<string, string[]> | null;
            questionId: string;
        }[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    hasMore: boolean;
    limit: number;
    questions: {
        type: "RATING" | "TEXTAREA" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "MULTIPLE_CHOICE" | "SIGNATURE" | "PAYMENT" | "MATRIX" | "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "MULTI_SELECT" | "RANKING" | "FORM_TITLE";
        title: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        formId: string;
        fields: any[];
        isTitleModifiedByUser?: boolean | undefined;
        isDeleted?: boolean | undefined;
        numberOfResponses?: number | undefined;
    }[];
    page: number;
    totalNumberOfSubmissionsPerFilter: {
        all: number;
        completed: number;
        partial: number;
    };
    submissions: {
        id: string;
        formId: string;
        isCompleted: boolean;
        submittedAt: string;
        responses: {
            value: string | number | boolean | string[] | {
                name: string;
                mimeType: string;
                url: string;
                id: string;
                size: number;
            }[] | Record<string, string[]> | null;
            questionId: string;
        }[];
    }[];
}, {
    hasMore: boolean;
    limit: number;
    questions: {
        type: "RATING" | "TEXTAREA" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "MULTIPLE_CHOICE" | "SIGNATURE" | "PAYMENT" | "MATRIX" | "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "MULTI_SELECT" | "RANKING" | "FORM_TITLE";
        title: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        formId: string;
        fields: any[];
        isTitleModifiedByUser?: boolean | undefined;
        isDeleted?: boolean | undefined;
        numberOfResponses?: number | undefined;
    }[];
    page: number;
    totalNumberOfSubmissionsPerFilter: {
        all: number;
        completed: number;
        partial: number;
    };
    submissions: {
        id: string;
        formId: string;
        isCompleted: boolean;
        submittedAt: string;
        responses: {
            value: string | number | boolean | string[] | {
                name: string;
                mimeType: string;
                url: string;
                id: string;
                size: number;
            }[] | Record<string, string[]> | null;
            questionId: string;
        }[];
    }[];
}>;
export declare const TallyWebhookFieldSchema: z.ZodObject<{
    key: z.ZodString;
    label: z.ZodString;
    type: z.ZodEnum<["INPUT_TEXT", "INPUT_NUMBER", "INPUT_EMAIL", "INPUT_PHONE_NUMBER", "INPUT_LINK", "INPUT_DATE", "INPUT_TIME", "TEXTAREA", "MULTIPLE_CHOICE", "DROPDOWN", "CHECKBOXES", "LINEAR_SCALE", "FILE_UPLOAD", "HIDDEN_FIELDS", "CALCULATED_FIELDS", "RATING", "MULTI_SELECT", "MATRIX", "RANKING", "SIGNATURE", "PAYMENT", "FORM_TITLE"]>;
    value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        url: z.ZodString;
        mimeType: z.ZodString;
        size: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        mimeType: string;
        url: string;
        id: string;
        size: number;
    }, {
        name: string;
        mimeType: string;
        url: string;
        id: string;
        size: number;
    }>, "many">, z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>]>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
        id: string;
    }, {
        text: string;
        id: string;
    }>, "many">>;
    rows: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
        id: string;
    }, {
        text: string;
        id: string;
    }>, "many">>;
    columns: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
        id: string;
    }, {
        text: string;
        id: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    key: string;
    value: string | number | boolean | string[] | {
        name: string;
        mimeType: string;
        url: string;
        id: string;
        size: number;
    }[] | Record<string, string[]>;
    type: "RATING" | "TEXTAREA" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "MULTIPLE_CHOICE" | "SIGNATURE" | "PAYMENT" | "MATRIX" | "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "MULTI_SELECT" | "RANKING" | "FORM_TITLE";
    label: string;
    options?: {
        text: string;
        id: string;
    }[] | undefined;
    rows?: {
        text: string;
        id: string;
    }[] | undefined;
    columns?: {
        text: string;
        id: string;
    }[] | undefined;
}, {
    key: string;
    value: string | number | boolean | string[] | {
        name: string;
        mimeType: string;
        url: string;
        id: string;
        size: number;
    }[] | Record<string, string[]>;
    type: "RATING" | "TEXTAREA" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "MULTIPLE_CHOICE" | "SIGNATURE" | "PAYMENT" | "MATRIX" | "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "MULTI_SELECT" | "RANKING" | "FORM_TITLE";
    label: string;
    options?: {
        text: string;
        id: string;
    }[] | undefined;
    rows?: {
        text: string;
        id: string;
    }[] | undefined;
    columns?: {
        text: string;
        id: string;
    }[] | undefined;
}>;
export declare const TallyWebhookDataSchema: z.ZodObject<{
    responseId: z.ZodString;
    submissionId: z.ZodString;
    respondentId: z.ZodString;
    formId: z.ZodString;
    formName: z.ZodString;
    createdAt: z.ZodString;
    fields: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        label: z.ZodString;
        type: z.ZodEnum<["INPUT_TEXT", "INPUT_NUMBER", "INPUT_EMAIL", "INPUT_PHONE_NUMBER", "INPUT_LINK", "INPUT_DATE", "INPUT_TIME", "TEXTAREA", "MULTIPLE_CHOICE", "DROPDOWN", "CHECKBOXES", "LINEAR_SCALE", "FILE_UPLOAD", "HIDDEN_FIELDS", "CALCULATED_FIELDS", "RATING", "MULTI_SELECT", "MATRIX", "RANKING", "SIGNATURE", "PAYMENT", "FORM_TITLE"]>;
        value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            url: z.ZodString;
            mimeType: z.ZodString;
            size: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            name: string;
            mimeType: string;
            url: string;
            id: string;
            size: number;
        }, {
            name: string;
            mimeType: string;
            url: string;
            id: string;
            size: number;
        }>, "many">, z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>]>;
        options: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            id: string;
        }, {
            text: string;
            id: string;
        }>, "many">>;
        rows: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            id: string;
        }, {
            text: string;
            id: string;
        }>, "many">>;
        columns: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            id: string;
        }, {
            text: string;
            id: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        key: string;
        value: string | number | boolean | string[] | {
            name: string;
            mimeType: string;
            url: string;
            id: string;
            size: number;
        }[] | Record<string, string[]>;
        type: "RATING" | "TEXTAREA" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "MULTIPLE_CHOICE" | "SIGNATURE" | "PAYMENT" | "MATRIX" | "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "MULTI_SELECT" | "RANKING" | "FORM_TITLE";
        label: string;
        options?: {
            text: string;
            id: string;
        }[] | undefined;
        rows?: {
            text: string;
            id: string;
        }[] | undefined;
        columns?: {
            text: string;
            id: string;
        }[] | undefined;
    }, {
        key: string;
        value: string | number | boolean | string[] | {
            name: string;
            mimeType: string;
            url: string;
            id: string;
            size: number;
        }[] | Record<string, string[]>;
        type: "RATING" | "TEXTAREA" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "MULTIPLE_CHOICE" | "SIGNATURE" | "PAYMENT" | "MATRIX" | "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "MULTI_SELECT" | "RANKING" | "FORM_TITLE";
        label: string;
        options?: {
            text: string;
            id: string;
        }[] | undefined;
        rows?: {
            text: string;
            id: string;
        }[] | undefined;
        columns?: {
            text: string;
            id: string;
        }[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    formId: string;
    fields: {
        key: string;
        value: string | number | boolean | string[] | {
            name: string;
            mimeType: string;
            url: string;
            id: string;
            size: number;
        }[] | Record<string, string[]>;
        type: "RATING" | "TEXTAREA" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "MULTIPLE_CHOICE" | "SIGNATURE" | "PAYMENT" | "MATRIX" | "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "MULTI_SELECT" | "RANKING" | "FORM_TITLE";
        label: string;
        options?: {
            text: string;
            id: string;
        }[] | undefined;
        rows?: {
            text: string;
            id: string;
        }[] | undefined;
        columns?: {
            text: string;
            id: string;
        }[] | undefined;
    }[];
    responseId: string;
    submissionId: string;
    respondentId: string;
    formName: string;
}, {
    createdAt: string;
    formId: string;
    fields: {
        key: string;
        value: string | number | boolean | string[] | {
            name: string;
            mimeType: string;
            url: string;
            id: string;
            size: number;
        }[] | Record<string, string[]>;
        type: "RATING" | "TEXTAREA" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "MULTIPLE_CHOICE" | "SIGNATURE" | "PAYMENT" | "MATRIX" | "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "MULTI_SELECT" | "RANKING" | "FORM_TITLE";
        label: string;
        options?: {
            text: string;
            id: string;
        }[] | undefined;
        rows?: {
            text: string;
            id: string;
        }[] | undefined;
        columns?: {
            text: string;
            id: string;
        }[] | undefined;
    }[];
    responseId: string;
    submissionId: string;
    respondentId: string;
    formName: string;
}>;
export declare const TallyWebhookPayloadSchema: z.ZodObject<{
    eventId: z.ZodString;
    eventType: z.ZodLiteral<"FORM_RESPONSE">;
    createdAt: z.ZodString;
    data: z.ZodObject<{
        responseId: z.ZodString;
        submissionId: z.ZodString;
        respondentId: z.ZodString;
        formId: z.ZodString;
        formName: z.ZodString;
        createdAt: z.ZodString;
        fields: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            label: z.ZodString;
            type: z.ZodEnum<["INPUT_TEXT", "INPUT_NUMBER", "INPUT_EMAIL", "INPUT_PHONE_NUMBER", "INPUT_LINK", "INPUT_DATE", "INPUT_TIME", "TEXTAREA", "MULTIPLE_CHOICE", "DROPDOWN", "CHECKBOXES", "LINEAR_SCALE", "FILE_UPLOAD", "HIDDEN_FIELDS", "CALCULATED_FIELDS", "RATING", "MULTI_SELECT", "MATRIX", "RANKING", "SIGNATURE", "PAYMENT", "FORM_TITLE"]>;
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                url: z.ZodString;
                mimeType: z.ZodString;
                size: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                name: string;
                mimeType: string;
                url: string;
                id: string;
                size: number;
            }, {
                name: string;
                mimeType: string;
                url: string;
                id: string;
                size: number;
            }>, "many">, z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>]>;
            options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                text: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                id: string;
            }, {
                text: string;
                id: string;
            }>, "many">>;
            rows: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                text: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                id: string;
            }, {
                text: string;
                id: string;
            }>, "many">>;
            columns: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                text: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                id: string;
            }, {
                text: string;
                id: string;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            key: string;
            value: string | number | boolean | string[] | {
                name: string;
                mimeType: string;
                url: string;
                id: string;
                size: number;
            }[] | Record<string, string[]>;
            type: "RATING" | "TEXTAREA" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "MULTIPLE_CHOICE" | "SIGNATURE" | "PAYMENT" | "MATRIX" | "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "MULTI_SELECT" | "RANKING" | "FORM_TITLE";
            label: string;
            options?: {
                text: string;
                id: string;
            }[] | undefined;
            rows?: {
                text: string;
                id: string;
            }[] | undefined;
            columns?: {
                text: string;
                id: string;
            }[] | undefined;
        }, {
            key: string;
            value: string | number | boolean | string[] | {
                name: string;
                mimeType: string;
                url: string;
                id: string;
                size: number;
            }[] | Record<string, string[]>;
            type: "RATING" | "TEXTAREA" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "MULTIPLE_CHOICE" | "SIGNATURE" | "PAYMENT" | "MATRIX" | "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "MULTI_SELECT" | "RANKING" | "FORM_TITLE";
            label: string;
            options?: {
                text: string;
                id: string;
            }[] | undefined;
            rows?: {
                text: string;
                id: string;
            }[] | undefined;
            columns?: {
                text: string;
                id: string;
            }[] | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        formId: string;
        fields: {
            key: string;
            value: string | number | boolean | string[] | {
                name: string;
                mimeType: string;
                url: string;
                id: string;
                size: number;
            }[] | Record<string, string[]>;
            type: "RATING" | "TEXTAREA" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "MULTIPLE_CHOICE" | "SIGNATURE" | "PAYMENT" | "MATRIX" | "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "MULTI_SELECT" | "RANKING" | "FORM_TITLE";
            label: string;
            options?: {
                text: string;
                id: string;
            }[] | undefined;
            rows?: {
                text: string;
                id: string;
            }[] | undefined;
            columns?: {
                text: string;
                id: string;
            }[] | undefined;
        }[];
        responseId: string;
        submissionId: string;
        respondentId: string;
        formName: string;
    }, {
        createdAt: string;
        formId: string;
        fields: {
            key: string;
            value: string | number | boolean | string[] | {
                name: string;
                mimeType: string;
                url: string;
                id: string;
                size: number;
            }[] | Record<string, string[]>;
            type: "RATING" | "TEXTAREA" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "MULTIPLE_CHOICE" | "SIGNATURE" | "PAYMENT" | "MATRIX" | "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "MULTI_SELECT" | "RANKING" | "FORM_TITLE";
            label: string;
            options?: {
                text: string;
                id: string;
            }[] | undefined;
            rows?: {
                text: string;
                id: string;
            }[] | undefined;
            columns?: {
                text: string;
                id: string;
            }[] | undefined;
        }[];
        responseId: string;
        submissionId: string;
        respondentId: string;
        formName: string;
    }>;
}, "strip", z.ZodTypeAny, {
    data: {
        createdAt: string;
        formId: string;
        fields: {
            key: string;
            value: string | number | boolean | string[] | {
                name: string;
                mimeType: string;
                url: string;
                id: string;
                size: number;
            }[] | Record<string, string[]>;
            type: "RATING" | "TEXTAREA" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "MULTIPLE_CHOICE" | "SIGNATURE" | "PAYMENT" | "MATRIX" | "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "MULTI_SELECT" | "RANKING" | "FORM_TITLE";
            label: string;
            options?: {
                text: string;
                id: string;
            }[] | undefined;
            rows?: {
                text: string;
                id: string;
            }[] | undefined;
            columns?: {
                text: string;
                id: string;
            }[] | undefined;
        }[];
        responseId: string;
        submissionId: string;
        respondentId: string;
        formName: string;
    };
    createdAt: string;
    eventId: string;
    eventType: "FORM_RESPONSE";
}, {
    data: {
        createdAt: string;
        formId: string;
        fields: {
            key: string;
            value: string | number | boolean | string[] | {
                name: string;
                mimeType: string;
                url: string;
                id: string;
                size: number;
            }[] | Record<string, string[]>;
            type: "RATING" | "TEXTAREA" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "MULTIPLE_CHOICE" | "SIGNATURE" | "PAYMENT" | "MATRIX" | "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "MULTI_SELECT" | "RANKING" | "FORM_TITLE";
            label: string;
            options?: {
                text: string;
                id: string;
            }[] | undefined;
            rows?: {
                text: string;
                id: string;
            }[] | undefined;
            columns?: {
                text: string;
                id: string;
            }[] | undefined;
        }[];
        responseId: string;
        submissionId: string;
        respondentId: string;
        formName: string;
    };
    createdAt: string;
    eventId: string;
    eventType: "FORM_RESPONSE";
}>;
export declare const TallyFormSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    isPublished: z.ZodOptional<z.ZodBoolean>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    submissionsCount: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["published", "draft", "archived"]>>;
    url: z.ZodOptional<z.ZodString>;
    embedUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    status?: "published" | "draft" | "archived" | undefined;
    description?: string | undefined;
    url?: string | undefined;
    isPublished?: boolean | undefined;
    submissionsCount?: number | undefined;
    embedUrl?: string | undefined;
}, {
    title: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    status?: "published" | "draft" | "archived" | undefined;
    description?: string | undefined;
    url?: string | undefined;
    isPublished?: boolean | undefined;
    submissionsCount?: number | undefined;
    embedUrl?: string | undefined;
}>;
export declare const TallyFormsResponseSchema: z.ZodObject<{
    forms: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        isPublished: z.ZodOptional<z.ZodBoolean>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        submissionsCount: z.ZodOptional<z.ZodNumber>;
        status: z.ZodOptional<z.ZodEnum<["published", "draft", "archived"]>>;
        url: z.ZodOptional<z.ZodString>;
        embedUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        status?: "published" | "draft" | "archived" | undefined;
        description?: string | undefined;
        url?: string | undefined;
        isPublished?: boolean | undefined;
        submissionsCount?: number | undefined;
        embedUrl?: string | undefined;
    }, {
        title: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        status?: "published" | "draft" | "archived" | undefined;
        description?: string | undefined;
        url?: string | undefined;
        isPublished?: boolean | undefined;
        submissionsCount?: number | undefined;
        embedUrl?: string | undefined;
    }>, "many">;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    hasMore: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    forms: {
        title: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        status?: "published" | "draft" | "archived" | undefined;
        description?: string | undefined;
        url?: string | undefined;
        isPublished?: boolean | undefined;
        submissionsCount?: number | undefined;
        embedUrl?: string | undefined;
    }[];
    hasMore?: boolean | undefined;
    limit?: number | undefined;
    page?: number | undefined;
}, {
    forms: {
        title: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        status?: "published" | "draft" | "archived" | undefined;
        description?: string | undefined;
        url?: string | undefined;
        isPublished?: boolean | undefined;
        submissionsCount?: number | undefined;
        embedUrl?: string | undefined;
    }[];
    hasMore?: boolean | undefined;
    limit?: number | undefined;
    page?: number | undefined;
}>;
export declare const TallyWorkspaceMemberSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodEnum<["owner", "admin", "member"]>;
    joinedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    role: "owner" | "admin" | "member";
    email: string;
    id: string;
    joinedAt: string;
    name?: string | undefined;
}, {
    role: "owner" | "admin" | "member";
    email: string;
    id: string;
    joinedAt: string;
    name?: string | undefined;
}>;
export declare const TallyWorkspaceSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    members: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        role: z.ZodEnum<["owner", "admin", "member"]>;
        joinedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        role: "owner" | "admin" | "member";
        email: string;
        id: string;
        joinedAt: string;
        name?: string | undefined;
    }, {
        role: "owner" | "admin" | "member";
        email: string;
        id: string;
        joinedAt: string;
        name?: string | undefined;
    }>, "many">>;
    formsCount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    description?: string | undefined;
    slug?: string | undefined;
    members?: {
        role: "owner" | "admin" | "member";
        email: string;
        id: string;
        joinedAt: string;
        name?: string | undefined;
    }[] | undefined;
    formsCount?: number | undefined;
}, {
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    description?: string | undefined;
    slug?: string | undefined;
    members?: {
        role: "owner" | "admin" | "member";
        email: string;
        id: string;
        joinedAt: string;
        name?: string | undefined;
    }[] | undefined;
    formsCount?: number | undefined;
}>;
export declare const TallyWorkspacesResponseSchema: z.ZodObject<{
    workspaces: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        slug: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        members: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
            role: z.ZodEnum<["owner", "admin", "member"]>;
            joinedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            role: "owner" | "admin" | "member";
            email: string;
            id: string;
            joinedAt: string;
            name?: string | undefined;
        }, {
            role: "owner" | "admin" | "member";
            email: string;
            id: string;
            joinedAt: string;
            name?: string | undefined;
        }>, "many">>;
        formsCount: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        description?: string | undefined;
        slug?: string | undefined;
        members?: {
            role: "owner" | "admin" | "member";
            email: string;
            id: string;
            joinedAt: string;
            name?: string | undefined;
        }[] | undefined;
        formsCount?: number | undefined;
    }, {
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        description?: string | undefined;
        slug?: string | undefined;
        members?: {
            role: "owner" | "admin" | "member";
            email: string;
            id: string;
            joinedAt: string;
            name?: string | undefined;
        }[] | undefined;
        formsCount?: number | undefined;
    }>, "many">;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    hasMore: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    workspaces: {
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        description?: string | undefined;
        slug?: string | undefined;
        members?: {
            role: "owner" | "admin" | "member";
            email: string;
            id: string;
            joinedAt: string;
            name?: string | undefined;
        }[] | undefined;
        formsCount?: number | undefined;
    }[];
    hasMore?: boolean | undefined;
    limit?: number | undefined;
    page?: number | undefined;
}, {
    workspaces: {
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        description?: string | undefined;
        slug?: string | undefined;
        members?: {
            role: "owner" | "admin" | "member";
            email: string;
            id: string;
            joinedAt: string;
            name?: string | undefined;
        }[] | undefined;
        formsCount?: number | undefined;
    }[];
    hasMore?: boolean | undefined;
    limit?: number | undefined;
    page?: number | undefined;
}>;
export declare const TallySuccessResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    message?: string | undefined;
    data?: unknown;
}, {
    success: boolean;
    message?: string | undefined;
    data?: unknown;
}>;
export declare const TallyPaginationSchema: z.ZodObject<{
    page: z.ZodNumber;
    limit: z.ZodNumber;
    hasMore: z.ZodBoolean;
    total: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    hasMore: boolean;
    limit: number;
    page: number;
    total?: number | undefined;
}, {
    hasMore: boolean;
    limit: number;
    page: number;
    total?: number | undefined;
}>;
export type TallyApiResponse = z.infer<typeof TallyApiResponseSchema>;
export type TallyApiErrorResponse = z.infer<typeof TallyApiErrorResponseSchema>;
export type TallyFieldType = z.infer<typeof TallyFieldTypeSchema>;
export type TallyFileUpload = z.infer<typeof TallyFileUploadSchema>;
export type TallyOption = z.infer<typeof TallyOptionSchema>;
export type TallyMatrix = z.infer<typeof TallyMatrixSchema>;
export type TallyFormField = z.infer<typeof TallyFormFieldSchema>;
export type TallyQuestion = z.infer<typeof TallyQuestionSchema>;
export type TallyFormResponse = z.infer<typeof TallyFormResponseSchema>;
export type TallySubmission = z.infer<typeof TallySubmissionSchema>;
export type TallySubmissionsResponse = z.infer<typeof TallySubmissionsResponseSchema>;
export type TallyWebhookField = z.infer<typeof TallyWebhookFieldSchema>;
export type TallyWebhookData = z.infer<typeof TallyWebhookDataSchema>;
export type TallyWebhookPayload = z.infer<typeof TallyWebhookPayloadSchema>;
export type TallyForm = z.infer<typeof TallyFormSchema>;
export type TallyFormsResponse = z.infer<typeof TallyFormsResponseSchema>;
export type TallyWorkspaceMember = z.infer<typeof TallyWorkspaceMemberSchema>;
export type TallyWorkspace = z.infer<typeof TallyWorkspaceSchema>;
export type TallyWorkspacesResponse = z.infer<typeof TallyWorkspacesResponseSchema>;
export type TallySuccessResponse = z.infer<typeof TallySuccessResponseSchema>;
export type TallyPagination = z.infer<typeof TallyPaginationSchema>;
export declare function validateTallyResponse<T>(schema: z.ZodSchema<T>, data: unknown): T;
export declare function safeParseTallyResponse<T>(schema: z.ZodSchema<T>, data: unknown): z.SafeParseReturnType<unknown, T>;
export declare function createTallyValidator<T>(schema: z.ZodSchema<T>): (data: unknown) => T;
export declare function createSafeTallyValidator<T>(schema: z.ZodSchema<T>): (data: unknown) => z.SafeParseReturnType<unknown, T>;
//# sourceMappingURL=tally-schemas.d.ts.map
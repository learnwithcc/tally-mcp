import { z } from 'zod';
export declare const TallyApiResponseSchema: z.ZodObject<{
    data: z.ZodUnknown;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    hasMore: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    data?: unknown;
    page?: number | undefined;
    limit?: number | undefined;
    hasMore?: boolean | undefined;
}, {
    data?: unknown;
    page?: number | undefined;
    limit?: number | undefined;
    hasMore?: boolean | undefined;
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
    url: string;
    id: string;
    name: string;
    mimeType: string;
    size: number;
}, {
    url: string;
    id: string;
    name: string;
    mimeType: string;
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
    type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE";
    id: string;
    title: string;
    formId: string;
    createdAt: string;
    updatedAt: string;
    fields: any[];
    isTitleModifiedByUser?: boolean | undefined;
    isDeleted?: boolean | undefined;
    numberOfResponses?: number | undefined;
}, {
    type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE";
    id: string;
    title: string;
    formId: string;
    createdAt: string;
    updatedAt: string;
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
        url: string;
        id: string;
        name: string;
        mimeType: string;
        size: number;
    }, {
        url: string;
        id: string;
        name: string;
        mimeType: string;
        size: number;
    }>, "many">, z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>, z.ZodNull]>;
}, "strip", z.ZodTypeAny, {
    value: string | number | boolean | string[] | {
        url: string;
        id: string;
        name: string;
        mimeType: string;
        size: number;
    }[] | Record<string, string[]> | null;
    questionId: string;
}, {
    value: string | number | boolean | string[] | {
        url: string;
        id: string;
        name: string;
        mimeType: string;
        size: number;
    }[] | Record<string, string[]> | null;
    questionId: string;
}>;
export declare const TallySubmissionSchema: z.ZodObject<{
    id: z.ZodString;
    formId: z.ZodString;
    respondentId: z.ZodString;
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
            url: string;
            id: string;
            name: string;
            mimeType: string;
            size: number;
        }, {
            url: string;
            id: string;
            name: string;
            mimeType: string;
            size: number;
        }>, "many">, z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>, z.ZodNull]>;
    }, "strip", z.ZodTypeAny, {
        value: string | number | boolean | string[] | {
            url: string;
            id: string;
            name: string;
            mimeType: string;
            size: number;
        }[] | Record<string, string[]> | null;
        questionId: string;
    }, {
        value: string | number | boolean | string[] | {
            url: string;
            id: string;
            name: string;
            mimeType: string;
            size: number;
        }[] | Record<string, string[]> | null;
        questionId: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    formId: string;
    respondentId: string;
    isCompleted: boolean;
    submittedAt: string;
    responses: {
        value: string | number | boolean | string[] | {
            url: string;
            id: string;
            name: string;
            mimeType: string;
            size: number;
        }[] | Record<string, string[]> | null;
        questionId: string;
    }[];
}, {
    id: string;
    formId: string;
    respondentId: string;
    isCompleted: boolean;
    submittedAt: string;
    responses: {
        value: string | number | boolean | string[] | {
            url: string;
            id: string;
            name: string;
            mimeType: string;
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
        type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE";
        id: string;
        title: string;
        formId: string;
        createdAt: string;
        updatedAt: string;
        fields: any[];
        isTitleModifiedByUser?: boolean | undefined;
        isDeleted?: boolean | undefined;
        numberOfResponses?: number | undefined;
    }, {
        type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE";
        id: string;
        title: string;
        formId: string;
        createdAt: string;
        updatedAt: string;
        fields: any[];
        isTitleModifiedByUser?: boolean | undefined;
        isDeleted?: boolean | undefined;
        numberOfResponses?: number | undefined;
    }>, "many">;
    submissions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        formId: z.ZodString;
        respondentId: z.ZodString;
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
                url: string;
                id: string;
                name: string;
                mimeType: string;
                size: number;
            }, {
                url: string;
                id: string;
                name: string;
                mimeType: string;
                size: number;
            }>, "many">, z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>, z.ZodNull]>;
        }, "strip", z.ZodTypeAny, {
            value: string | number | boolean | string[] | {
                url: string;
                id: string;
                name: string;
                mimeType: string;
                size: number;
            }[] | Record<string, string[]> | null;
            questionId: string;
        }, {
            value: string | number | boolean | string[] | {
                url: string;
                id: string;
                name: string;
                mimeType: string;
                size: number;
            }[] | Record<string, string[]> | null;
            questionId: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        formId: string;
        respondentId: string;
        isCompleted: boolean;
        submittedAt: string;
        responses: {
            value: string | number | boolean | string[] | {
                url: string;
                id: string;
                name: string;
                mimeType: string;
                size: number;
            }[] | Record<string, string[]> | null;
            questionId: string;
        }[];
    }, {
        id: string;
        formId: string;
        respondentId: string;
        isCompleted: boolean;
        submittedAt: string;
        responses: {
            value: string | number | boolean | string[] | {
                url: string;
                id: string;
                name: string;
                mimeType: string;
                size: number;
            }[] | Record<string, string[]> | null;
            questionId: string;
        }[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    hasMore: boolean;
    totalNumberOfSubmissionsPerFilter: {
        all: number;
        completed: number;
        partial: number;
    };
    questions: {
        type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE";
        id: string;
        title: string;
        formId: string;
        createdAt: string;
        updatedAt: string;
        fields: any[];
        isTitleModifiedByUser?: boolean | undefined;
        isDeleted?: boolean | undefined;
        numberOfResponses?: number | undefined;
    }[];
    submissions: {
        id: string;
        formId: string;
        respondentId: string;
        isCompleted: boolean;
        submittedAt: string;
        responses: {
            value: string | number | boolean | string[] | {
                url: string;
                id: string;
                name: string;
                mimeType: string;
                size: number;
            }[] | Record<string, string[]> | null;
            questionId: string;
        }[];
    }[];
}, {
    page: number;
    limit: number;
    hasMore: boolean;
    totalNumberOfSubmissionsPerFilter: {
        all: number;
        completed: number;
        partial: number;
    };
    questions: {
        type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE";
        id: string;
        title: string;
        formId: string;
        createdAt: string;
        updatedAt: string;
        fields: any[];
        isTitleModifiedByUser?: boolean | undefined;
        isDeleted?: boolean | undefined;
        numberOfResponses?: number | undefined;
    }[];
    submissions: {
        id: string;
        formId: string;
        respondentId: string;
        isCompleted: boolean;
        submittedAt: string;
        responses: {
            value: string | number | boolean | string[] | {
                url: string;
                id: string;
                name: string;
                mimeType: string;
                size: number;
            }[] | Record<string, string[]> | null;
            questionId: string;
        }[];
    }[];
}>;
export type SubmissionStatusFilter = 'all' | 'completed' | 'partial';
export interface SubmissionFilters {
    status?: SubmissionStatusFilter;
    startDate?: string;
    endDate?: string;
    afterId?: string;
}
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
        url: string;
        id: string;
        name: string;
        mimeType: string;
        size: number;
    }, {
        url: string;
        id: string;
        name: string;
        mimeType: string;
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
    type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE";
    label: string;
    value: string | number | boolean | string[] | {
        url: string;
        id: string;
        name: string;
        mimeType: string;
        size: number;
    }[] | Record<string, string[]>;
    key: string;
    rows?: {
        text: string;
        id: string;
    }[] | undefined;
    options?: {
        text: string;
        id: string;
    }[] | undefined;
    columns?: {
        text: string;
        id: string;
    }[] | undefined;
}, {
    type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE";
    label: string;
    value: string | number | boolean | string[] | {
        url: string;
        id: string;
        name: string;
        mimeType: string;
        size: number;
    }[] | Record<string, string[]>;
    key: string;
    rows?: {
        text: string;
        id: string;
    }[] | undefined;
    options?: {
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
            url: string;
            id: string;
            name: string;
            mimeType: string;
            size: number;
        }, {
            url: string;
            id: string;
            name: string;
            mimeType: string;
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
        type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE";
        label: string;
        value: string | number | boolean | string[] | {
            url: string;
            id: string;
            name: string;
            mimeType: string;
            size: number;
        }[] | Record<string, string[]>;
        key: string;
        rows?: {
            text: string;
            id: string;
        }[] | undefined;
        options?: {
            text: string;
            id: string;
        }[] | undefined;
        columns?: {
            text: string;
            id: string;
        }[] | undefined;
    }, {
        type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE";
        label: string;
        value: string | number | boolean | string[] | {
            url: string;
            id: string;
            name: string;
            mimeType: string;
            size: number;
        }[] | Record<string, string[]>;
        key: string;
        rows?: {
            text: string;
            id: string;
        }[] | undefined;
        options?: {
            text: string;
            id: string;
        }[] | undefined;
        columns?: {
            text: string;
            id: string;
        }[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    formId: string;
    createdAt: string;
    fields: {
        type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE";
        label: string;
        value: string | number | boolean | string[] | {
            url: string;
            id: string;
            name: string;
            mimeType: string;
            size: number;
        }[] | Record<string, string[]>;
        key: string;
        rows?: {
            text: string;
            id: string;
        }[] | undefined;
        options?: {
            text: string;
            id: string;
        }[] | undefined;
        columns?: {
            text: string;
            id: string;
        }[] | undefined;
    }[];
    respondentId: string;
    responseId: string;
    submissionId: string;
    formName: string;
}, {
    formId: string;
    createdAt: string;
    fields: {
        type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE";
        label: string;
        value: string | number | boolean | string[] | {
            url: string;
            id: string;
            name: string;
            mimeType: string;
            size: number;
        }[] | Record<string, string[]>;
        key: string;
        rows?: {
            text: string;
            id: string;
        }[] | undefined;
        options?: {
            text: string;
            id: string;
        }[] | undefined;
        columns?: {
            text: string;
            id: string;
        }[] | undefined;
    }[];
    respondentId: string;
    responseId: string;
    submissionId: string;
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
                url: string;
                id: string;
                name: string;
                mimeType: string;
                size: number;
            }, {
                url: string;
                id: string;
                name: string;
                mimeType: string;
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
            type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE";
            label: string;
            value: string | number | boolean | string[] | {
                url: string;
                id: string;
                name: string;
                mimeType: string;
                size: number;
            }[] | Record<string, string[]>;
            key: string;
            rows?: {
                text: string;
                id: string;
            }[] | undefined;
            options?: {
                text: string;
                id: string;
            }[] | undefined;
            columns?: {
                text: string;
                id: string;
            }[] | undefined;
        }, {
            type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE";
            label: string;
            value: string | number | boolean | string[] | {
                url: string;
                id: string;
                name: string;
                mimeType: string;
                size: number;
            }[] | Record<string, string[]>;
            key: string;
            rows?: {
                text: string;
                id: string;
            }[] | undefined;
            options?: {
                text: string;
                id: string;
            }[] | undefined;
            columns?: {
                text: string;
                id: string;
            }[] | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        formId: string;
        createdAt: string;
        fields: {
            type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE";
            label: string;
            value: string | number | boolean | string[] | {
                url: string;
                id: string;
                name: string;
                mimeType: string;
                size: number;
            }[] | Record<string, string[]>;
            key: string;
            rows?: {
                text: string;
                id: string;
            }[] | undefined;
            options?: {
                text: string;
                id: string;
            }[] | undefined;
            columns?: {
                text: string;
                id: string;
            }[] | undefined;
        }[];
        respondentId: string;
        responseId: string;
        submissionId: string;
        formName: string;
    }, {
        formId: string;
        createdAt: string;
        fields: {
            type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE";
            label: string;
            value: string | number | boolean | string[] | {
                url: string;
                id: string;
                name: string;
                mimeType: string;
                size: number;
            }[] | Record<string, string[]>;
            key: string;
            rows?: {
                text: string;
                id: string;
            }[] | undefined;
            options?: {
                text: string;
                id: string;
            }[] | undefined;
            columns?: {
                text: string;
                id: string;
            }[] | undefined;
        }[];
        respondentId: string;
        responseId: string;
        submissionId: string;
        formName: string;
    }>;
}, "strip", z.ZodTypeAny, {
    data: {
        formId: string;
        createdAt: string;
        fields: {
            type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE";
            label: string;
            value: string | number | boolean | string[] | {
                url: string;
                id: string;
                name: string;
                mimeType: string;
                size: number;
            }[] | Record<string, string[]>;
            key: string;
            rows?: {
                text: string;
                id: string;
            }[] | undefined;
            options?: {
                text: string;
                id: string;
            }[] | undefined;
            columns?: {
                text: string;
                id: string;
            }[] | undefined;
        }[];
        respondentId: string;
        responseId: string;
        submissionId: string;
        formName: string;
    };
    createdAt: string;
    eventId: string;
    eventType: "FORM_RESPONSE";
}, {
    data: {
        formId: string;
        createdAt: string;
        fields: {
            type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE";
            label: string;
            value: string | number | boolean | string[] | {
                url: string;
                id: string;
                name: string;
                mimeType: string;
                size: number;
            }[] | Record<string, string[]>;
            key: string;
            rows?: {
                text: string;
                id: string;
            }[] | undefined;
            options?: {
                text: string;
                id: string;
            }[] | undefined;
            columns?: {
                text: string;
                id: string;
            }[] | undefined;
        }[];
        respondentId: string;
        responseId: string;
        submissionId: string;
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
    url: z.ZodOptional<z.ZodString>;
    embedUrl: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    url?: string | undefined;
    description?: string | undefined;
    status?: string | undefined;
    isPublished?: boolean | undefined;
    submissionsCount?: number | undefined;
    embedUrl?: string | undefined;
}, {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    url?: string | undefined;
    description?: string | undefined;
    status?: string | undefined;
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
        url: z.ZodOptional<z.ZodString>;
        embedUrl: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        createdAt: string;
        updatedAt: string;
        url?: string | undefined;
        description?: string | undefined;
        status?: string | undefined;
        isPublished?: boolean | undefined;
        submissionsCount?: number | undefined;
        embedUrl?: string | undefined;
    }, {
        id: string;
        title: string;
        createdAt: string;
        updatedAt: string;
        url?: string | undefined;
        description?: string | undefined;
        status?: string | undefined;
        isPublished?: boolean | undefined;
        submissionsCount?: number | undefined;
        embedUrl?: string | undefined;
    }>, "many">;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    hasMore: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    forms: {
        id: string;
        title: string;
        createdAt: string;
        updatedAt: string;
        url?: string | undefined;
        description?: string | undefined;
        status?: string | undefined;
        isPublished?: boolean | undefined;
        submissionsCount?: number | undefined;
        embedUrl?: string | undefined;
    }[];
    page?: number | undefined;
    limit?: number | undefined;
    hasMore?: boolean | undefined;
}, {
    forms: {
        id: string;
        title: string;
        createdAt: string;
        updatedAt: string;
        url?: string | undefined;
        description?: string | undefined;
        status?: string | undefined;
        isPublished?: boolean | undefined;
        submissionsCount?: number | undefined;
        embedUrl?: string | undefined;
    }[];
    page?: number | undefined;
    limit?: number | undefined;
    hasMore?: boolean | undefined;
}>;
export declare const UserRoleSchema: z.ZodEnum<["owner", "admin", "member"]>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export declare const TallyWorkspaceMemberSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodEnum<["owner", "admin", "member"]>;
    joinedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    id: string;
    role: "owner" | "admin" | "member";
    joinedAt: string;
    name?: string | undefined;
}, {
    email: string;
    id: string;
    role: "owner" | "admin" | "member";
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
        email: string;
        id: string;
        role: "owner" | "admin" | "member";
        joinedAt: string;
        name?: string | undefined;
    }, {
        email: string;
        id: string;
        role: "owner" | "admin" | "member";
        joinedAt: string;
        name?: string | undefined;
    }>, "many">>;
    formsCount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    description?: string | undefined;
    slug?: string | undefined;
    members?: {
        email: string;
        id: string;
        role: "owner" | "admin" | "member";
        joinedAt: string;
        name?: string | undefined;
    }[] | undefined;
    formsCount?: number | undefined;
}, {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    description?: string | undefined;
    slug?: string | undefined;
    members?: {
        email: string;
        id: string;
        role: "owner" | "admin" | "member";
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
            email: string;
            id: string;
            role: "owner" | "admin" | "member";
            joinedAt: string;
            name?: string | undefined;
        }, {
            email: string;
            id: string;
            role: "owner" | "admin" | "member";
            joinedAt: string;
            name?: string | undefined;
        }>, "many">>;
        formsCount: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        description?: string | undefined;
        slug?: string | undefined;
        members?: {
            email: string;
            id: string;
            role: "owner" | "admin" | "member";
            joinedAt: string;
            name?: string | undefined;
        }[] | undefined;
        formsCount?: number | undefined;
    }, {
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        description?: string | undefined;
        slug?: string | undefined;
        members?: {
            email: string;
            id: string;
            role: "owner" | "admin" | "member";
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
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        description?: string | undefined;
        slug?: string | undefined;
        members?: {
            email: string;
            id: string;
            role: "owner" | "admin" | "member";
            joinedAt: string;
            name?: string | undefined;
        }[] | undefined;
        formsCount?: number | undefined;
    }[];
    page?: number | undefined;
    limit?: number | undefined;
    hasMore?: boolean | undefined;
}, {
    workspaces: {
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        description?: string | undefined;
        slug?: string | undefined;
        members?: {
            email: string;
            id: string;
            role: "owner" | "admin" | "member";
            joinedAt: string;
            name?: string | undefined;
        }[] | undefined;
        formsCount?: number | undefined;
    }[];
    page?: number | undefined;
    limit?: number | undefined;
    hasMore?: boolean | undefined;
}>;
export declare const FormAccessLevelSchema: z.ZodEnum<["view", "edit", "manage", "admin"]>;
export type FormAccessLevel = z.infer<typeof FormAccessLevelSchema>;
export declare const FormPermissionSchema: z.ZodObject<{
    userId: z.ZodString;
    formId: z.ZodString;
    accessLevel: z.ZodEnum<["view", "edit", "manage", "admin"]>;
    inheritFromWorkspace: z.ZodBoolean;
    grantedAt: z.ZodString;
    grantedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    formId: string;
    userId: string;
    accessLevel: "admin" | "view" | "edit" | "manage";
    inheritFromWorkspace: boolean;
    grantedAt: string;
    grantedBy: string;
}, {
    formId: string;
    userId: string;
    accessLevel: "admin" | "view" | "edit" | "manage";
    inheritFromWorkspace: boolean;
    grantedAt: string;
    grantedBy: string;
}>;
export declare const FormPermissionResponseSchema: z.ZodObject<{
    userId: z.ZodString;
    formId: z.ZodString;
    accessLevel: z.ZodEnum<["view", "edit", "manage", "admin"]>;
    inheritFromWorkspace: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    grantedAt: z.ZodString;
    grantedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    formId: string;
    userId: string;
    accessLevel: "admin" | "view" | "edit" | "manage";
    inheritFromWorkspace: boolean;
    grantedAt: string;
    grantedBy: string;
}, {
    formId: string;
    userId: string;
    accessLevel: "admin" | "view" | "edit" | "manage";
    grantedAt: string;
    grantedBy: string;
    inheritFromWorkspace?: boolean | undefined;
}>;
export declare const FormPermissionInputSchema: z.ZodObject<{
    userId: z.ZodString;
    formId: z.ZodString;
    accessLevel: z.ZodEnum<["view", "edit", "manage", "admin"]>;
    inheritFromWorkspace: z.ZodDefault<z.ZodBoolean>;
    grantedAt: z.ZodString;
    grantedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    formId: string;
    userId: string;
    accessLevel: "admin" | "view" | "edit" | "manage";
    inheritFromWorkspace: boolean;
    grantedAt: string;
    grantedBy: string;
}, {
    formId: string;
    userId: string;
    accessLevel: "admin" | "view" | "edit" | "manage";
    grantedAt: string;
    grantedBy: string;
    inheritFromWorkspace?: boolean | undefined;
}>;
export declare const BulkFormPermissionSchema: z.ZodObject<{
    formIds: z.ZodArray<z.ZodString, "many">;
    userId: z.ZodString;
    accessLevel: z.ZodEnum<["view", "edit", "manage", "admin"]>;
    inheritFromWorkspace: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    accessLevel: "admin" | "view" | "edit" | "manage";
    inheritFromWorkspace: boolean;
    formIds: string[];
}, {
    userId: string;
    accessLevel: "admin" | "view" | "edit" | "manage";
    formIds: string[];
    inheritFromWorkspace?: boolean | undefined;
}>;
export declare const FormPermissionSettingsSchema: z.ZodObject<{
    formId: z.ZodString;
    workspaceId: z.ZodString;
    defaultAccessLevel: z.ZodEnum<["view", "edit", "manage", "admin"]>;
    allowWorkspaceInheritance: z.ZodBoolean;
    permissions: z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        formId: z.ZodString;
        accessLevel: z.ZodEnum<["view", "edit", "manage", "admin"]>;
        inheritFromWorkspace: z.ZodBoolean;
        grantedAt: z.ZodString;
        grantedBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        formId: string;
        userId: string;
        accessLevel: "admin" | "view" | "edit" | "manage";
        inheritFromWorkspace: boolean;
        grantedAt: string;
        grantedBy: string;
    }, {
        formId: string;
        userId: string;
        accessLevel: "admin" | "view" | "edit" | "manage";
        inheritFromWorkspace: boolean;
        grantedAt: string;
        grantedBy: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    formId: string;
    workspaceId: string;
    defaultAccessLevel: "admin" | "view" | "edit" | "manage";
    allowWorkspaceInheritance: boolean;
    permissions: {
        formId: string;
        userId: string;
        accessLevel: "admin" | "view" | "edit" | "manage";
        inheritFromWorkspace: boolean;
        grantedAt: string;
        grantedBy: string;
    }[];
}, {
    formId: string;
    workspaceId: string;
    defaultAccessLevel: "admin" | "view" | "edit" | "manage";
    allowWorkspaceInheritance: boolean;
    permissions: {
        formId: string;
        userId: string;
        accessLevel: "admin" | "view" | "edit" | "manage";
        inheritFromWorkspace: boolean;
        grantedAt: string;
        grantedBy: string;
    }[];
}>;
export declare const FormPermissionSettingsResponseSchema: z.ZodObject<{
    formId: z.ZodString;
    workspaceId: z.ZodString;
    defaultAccessLevel: z.ZodDefault<z.ZodOptional<z.ZodEnum<["view", "edit", "manage", "admin"]>>>;
    allowWorkspaceInheritance: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    permissions: z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        formId: z.ZodString;
        accessLevel: z.ZodEnum<["view", "edit", "manage", "admin"]>;
        inheritFromWorkspace: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        grantedAt: z.ZodString;
        grantedBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        formId: string;
        userId: string;
        accessLevel: "admin" | "view" | "edit" | "manage";
        inheritFromWorkspace: boolean;
        grantedAt: string;
        grantedBy: string;
    }, {
        formId: string;
        userId: string;
        accessLevel: "admin" | "view" | "edit" | "manage";
        grantedAt: string;
        grantedBy: string;
        inheritFromWorkspace?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    formId: string;
    workspaceId: string;
    defaultAccessLevel: "admin" | "view" | "edit" | "manage";
    allowWorkspaceInheritance: boolean;
    permissions: {
        formId: string;
        userId: string;
        accessLevel: "admin" | "view" | "edit" | "manage";
        inheritFromWorkspace: boolean;
        grantedAt: string;
        grantedBy: string;
    }[];
}, {
    formId: string;
    workspaceId: string;
    permissions: {
        formId: string;
        userId: string;
        accessLevel: "admin" | "view" | "edit" | "manage";
        grantedAt: string;
        grantedBy: string;
        inheritFromWorkspace?: boolean | undefined;
    }[];
    defaultAccessLevel?: "admin" | "view" | "edit" | "manage" | undefined;
    allowWorkspaceInheritance?: boolean | undefined;
}>;
export declare const FormPermissionSettingsInputSchema: z.ZodObject<{
    formId: z.ZodString;
    workspaceId: z.ZodString;
    defaultAccessLevel: z.ZodDefault<z.ZodEnum<["view", "edit", "manage", "admin"]>>;
    allowWorkspaceInheritance: z.ZodDefault<z.ZodBoolean>;
    permissions: z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        formId: z.ZodString;
        accessLevel: z.ZodEnum<["view", "edit", "manage", "admin"]>;
        inheritFromWorkspace: z.ZodDefault<z.ZodBoolean>;
        grantedAt: z.ZodString;
        grantedBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        formId: string;
        userId: string;
        accessLevel: "admin" | "view" | "edit" | "manage";
        inheritFromWorkspace: boolean;
        grantedAt: string;
        grantedBy: string;
    }, {
        formId: string;
        userId: string;
        accessLevel: "admin" | "view" | "edit" | "manage";
        grantedAt: string;
        grantedBy: string;
        inheritFromWorkspace?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    formId: string;
    workspaceId: string;
    defaultAccessLevel: "admin" | "view" | "edit" | "manage";
    allowWorkspaceInheritance: boolean;
    permissions: {
        formId: string;
        userId: string;
        accessLevel: "admin" | "view" | "edit" | "manage";
        inheritFromWorkspace: boolean;
        grantedAt: string;
        grantedBy: string;
    }[];
}, {
    formId: string;
    workspaceId: string;
    permissions: {
        formId: string;
        userId: string;
        accessLevel: "admin" | "view" | "edit" | "manage";
        grantedAt: string;
        grantedBy: string;
        inheritFromWorkspace?: boolean | undefined;
    }[];
    defaultAccessLevel?: "admin" | "view" | "edit" | "manage" | undefined;
    allowWorkspaceInheritance?: boolean | undefined;
}>;
export declare const FormPermissionsResponseSchema: z.ZodObject<{
    formId: z.ZodString;
    permissions: z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        formId: z.ZodString;
        accessLevel: z.ZodEnum<["view", "edit", "manage", "admin"]>;
        inheritFromWorkspace: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        grantedAt: z.ZodString;
        grantedBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        formId: string;
        userId: string;
        accessLevel: "admin" | "view" | "edit" | "manage";
        inheritFromWorkspace: boolean;
        grantedAt: string;
        grantedBy: string;
    }, {
        formId: string;
        userId: string;
        accessLevel: "admin" | "view" | "edit" | "manage";
        grantedAt: string;
        grantedBy: string;
        inheritFromWorkspace?: boolean | undefined;
    }>, "many">;
    settings: z.ZodObject<{
        formId: z.ZodString;
        workspaceId: z.ZodString;
        defaultAccessLevel: z.ZodDefault<z.ZodOptional<z.ZodEnum<["view", "edit", "manage", "admin"]>>>;
        allowWorkspaceInheritance: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        permissions: z.ZodArray<z.ZodObject<{
            userId: z.ZodString;
            formId: z.ZodString;
            accessLevel: z.ZodEnum<["view", "edit", "manage", "admin"]>;
            inheritFromWorkspace: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            grantedAt: z.ZodString;
            grantedBy: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            formId: string;
            userId: string;
            accessLevel: "admin" | "view" | "edit" | "manage";
            inheritFromWorkspace: boolean;
            grantedAt: string;
            grantedBy: string;
        }, {
            formId: string;
            userId: string;
            accessLevel: "admin" | "view" | "edit" | "manage";
            grantedAt: string;
            grantedBy: string;
            inheritFromWorkspace?: boolean | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        formId: string;
        workspaceId: string;
        defaultAccessLevel: "admin" | "view" | "edit" | "manage";
        allowWorkspaceInheritance: boolean;
        permissions: {
            formId: string;
            userId: string;
            accessLevel: "admin" | "view" | "edit" | "manage";
            inheritFromWorkspace: boolean;
            grantedAt: string;
            grantedBy: string;
        }[];
    }, {
        formId: string;
        workspaceId: string;
        permissions: {
            formId: string;
            userId: string;
            accessLevel: "admin" | "view" | "edit" | "manage";
            grantedAt: string;
            grantedBy: string;
            inheritFromWorkspace?: boolean | undefined;
        }[];
        defaultAccessLevel?: "admin" | "view" | "edit" | "manage" | undefined;
        allowWorkspaceInheritance?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    formId: string;
    permissions: {
        formId: string;
        userId: string;
        accessLevel: "admin" | "view" | "edit" | "manage";
        inheritFromWorkspace: boolean;
        grantedAt: string;
        grantedBy: string;
    }[];
    settings: {
        formId: string;
        workspaceId: string;
        defaultAccessLevel: "admin" | "view" | "edit" | "manage";
        allowWorkspaceInheritance: boolean;
        permissions: {
            formId: string;
            userId: string;
            accessLevel: "admin" | "view" | "edit" | "manage";
            inheritFromWorkspace: boolean;
            grantedAt: string;
            grantedBy: string;
        }[];
    };
}, {
    formId: string;
    permissions: {
        formId: string;
        userId: string;
        accessLevel: "admin" | "view" | "edit" | "manage";
        grantedAt: string;
        grantedBy: string;
        inheritFromWorkspace?: boolean | undefined;
    }[];
    settings: {
        formId: string;
        workspaceId: string;
        permissions: {
            formId: string;
            userId: string;
            accessLevel: "admin" | "view" | "edit" | "manage";
            grantedAt: string;
            grantedBy: string;
            inheritFromWorkspace?: boolean | undefined;
        }[];
        defaultAccessLevel?: "admin" | "view" | "edit" | "manage" | undefined;
        allowWorkspaceInheritance?: boolean | undefined;
    };
}>;
export declare const BulkPermissionResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    updatedCount: z.ZodNumber;
    failedCount: z.ZodNumber;
    errors: z.ZodOptional<z.ZodArray<z.ZodObject<{
        formId: z.ZodString;
        error: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        error: string;
        formId: string;
    }, {
        error: string;
        formId: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    updatedCount: number;
    failedCount: number;
    errors?: {
        error: string;
        formId: string;
    }[] | undefined;
}, {
    success: boolean;
    updatedCount: number;
    failedCount: number;
    errors?: {
        error: string;
        formId: string;
    }[] | undefined;
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
    page: number;
    limit: number;
    hasMore: boolean;
    total?: number | undefined;
}, {
    page: number;
    limit: number;
    hasMore: boolean;
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
export type FormPermission = z.infer<typeof FormPermissionSchema>;
export type FormPermissionResponse = z.infer<typeof FormPermissionResponseSchema>;
export type FormPermissionInput = z.infer<typeof FormPermissionInputSchema>;
export type BulkFormPermission = z.infer<typeof BulkFormPermissionSchema>;
export type FormPermissionSettings = z.infer<typeof FormPermissionSettingsSchema>;
export type FormPermissionSettingsResponse = z.infer<typeof FormPermissionSettingsResponseSchema>;
export type FormPermissionSettingsInput = z.infer<typeof FormPermissionSettingsInputSchema>;
export type FormPermissionsResponse = z.infer<typeof FormPermissionsResponseSchema>;
export type BulkPermissionResponse = z.infer<typeof BulkPermissionResponseSchema>;
export type TallySuccessResponse = z.infer<typeof TallySuccessResponseSchema>;
export type TallyPagination = z.infer<typeof TallyPaginationSchema>;
export declare function validateTallyResponse<T>(schema: z.ZodSchema<T>, data: unknown): T;
export declare function safeParseTallyResponse<T>(schema: z.ZodSchema<T>, data: unknown): z.SafeParseReturnType<unknown, T>;
export declare function createTallyValidator<T>(schema: z.ZodSchema<T>): (data: unknown) => T;
export declare function createSafeTallyValidator<T>(schema: z.ZodSchema<T>): (data: unknown) => z.SafeParseReturnType<unknown, T>;
//# sourceMappingURL=tally-schemas.d.ts.map
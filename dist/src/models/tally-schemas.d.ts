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
    title: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    isPublished: z.ZodOptional<z.ZodBoolean>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    submissionsCount: z.ZodOptional<z.ZodNumber>;
    url: z.ZodOptional<z.ZodString>;
    embedUrl: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    shareUrl: z.ZodOptional<z.ZodString>;
    share_url: z.ZodOptional<z.ZodString>;
    publicUrl: z.ZodOptional<z.ZodString>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    id: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    isPublished: z.ZodOptional<z.ZodBoolean>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    submissionsCount: z.ZodOptional<z.ZodNumber>;
    url: z.ZodOptional<z.ZodString>;
    embedUrl: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    shareUrl: z.ZodOptional<z.ZodString>;
    share_url: z.ZodOptional<z.ZodString>;
    publicUrl: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    id: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    isPublished: z.ZodOptional<z.ZodBoolean>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    submissionsCount: z.ZodOptional<z.ZodNumber>;
    url: z.ZodOptional<z.ZodString>;
    embedUrl: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    shareUrl: z.ZodOptional<z.ZodString>;
    share_url: z.ZodOptional<z.ZodString>;
    publicUrl: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">>;
export declare const TallyFormsResponseSchema: z.ZodObject<{
    forms: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        isPublished: z.ZodOptional<z.ZodBoolean>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        submissionsCount: z.ZodOptional<z.ZodNumber>;
        url: z.ZodOptional<z.ZodString>;
        embedUrl: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        shareUrl: z.ZodOptional<z.ZodString>;
        share_url: z.ZodOptional<z.ZodString>;
        publicUrl: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        id: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        isPublished: z.ZodOptional<z.ZodBoolean>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        submissionsCount: z.ZodOptional<z.ZodNumber>;
        url: z.ZodOptional<z.ZodString>;
        embedUrl: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        shareUrl: z.ZodOptional<z.ZodString>;
        share_url: z.ZodOptional<z.ZodString>;
        publicUrl: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        id: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        isPublished: z.ZodOptional<z.ZodBoolean>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        submissionsCount: z.ZodOptional<z.ZodNumber>;
        url: z.ZodOptional<z.ZodString>;
        embedUrl: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        shareUrl: z.ZodOptional<z.ZodString>;
        share_url: z.ZodOptional<z.ZodString>;
        publicUrl: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    hasMore: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    forms: z.objectOutputType<{
        id: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        isPublished: z.ZodOptional<z.ZodBoolean>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        submissionsCount: z.ZodOptional<z.ZodNumber>;
        url: z.ZodOptional<z.ZodString>;
        embedUrl: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        shareUrl: z.ZodOptional<z.ZodString>;
        share_url: z.ZodOptional<z.ZodString>;
        publicUrl: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">[];
    page?: number | undefined;
    limit?: number | undefined;
    hasMore?: boolean | undefined;
}, {
    forms: z.objectInputType<{
        id: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        isPublished: z.ZodOptional<z.ZodBoolean>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        submissionsCount: z.ZodOptional<z.ZodNumber>;
        url: z.ZodOptional<z.ZodString>;
        embedUrl: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        shareUrl: z.ZodOptional<z.ZodString>;
        share_url: z.ZodOptional<z.ZodString>;
        publicUrl: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">[];
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
export declare const TallyBlockTypeSchema: z.ZodEnum<["FORM_TITLE", "TITLE", "INPUT_TEXT", "INPUT_EMAIL", "INPUT_NUMBER", "INPUT_PHONE_NUMBER", "INPUT_LINK", "INPUT_DATE", "INPUT_TIME", "TEXTAREA", "DROPDOWN", "DROPDOWN_OPTION", "CHECKBOXES", "CHECKBOX", "MULTIPLE_CHOICE", "MULTIPLE_CHOICE_OPTION", "LINEAR_SCALE", "RATING", "FILE_UPLOAD", "SIGNATURE", "HIDDEN_FIELDS", "CALCULATED_FIELDS", "MULTI_SELECT", "MATRIX", "RANKING", "PAYMENT"]>;
export declare const TallyGroupTypeSchema: z.ZodEnum<["TEXT", "QUESTION", "INPUT_TEXT", "INPUT_EMAIL", "INPUT_NUMBER", "INPUT_PHONE_NUMBER", "INPUT_LINK", "INPUT_DATE", "INPUT_TIME", "TEXTAREA", "DROPDOWN", "CHECKBOXES", "MULTIPLE_CHOICE", "LINEAR_SCALE", "RATING", "FILE_UPLOAD", "SIGNATURE"]>;
export declare const TallyBlockBasePayloadSchema: z.ZodObject<{
    html: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    isRequired: z.ZodOptional<z.ZodBoolean>;
    placeholder: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    placeholder?: string | undefined;
    title?: string | undefined;
    html?: string | undefined;
    isRequired?: boolean | undefined;
}, {
    placeholder?: string | undefined;
    title?: string | undefined;
    html?: string | undefined;
    isRequired?: boolean | undefined;
}>;
export declare const TallyBlockOptionSchema: z.ZodObject<{
    id: z.ZodString;
    text: z.ZodString;
    index: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    text: string;
    id: string;
    index?: number | undefined;
}, {
    text: string;
    id: string;
    index?: number | undefined;
}>;
export declare const TallyChoiceOptionPayloadSchema: z.ZodObject<{
    html: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    isRequired: z.ZodOptional<z.ZodBoolean>;
    placeholder: z.ZodOptional<z.ZodString>;
} & {
    index: z.ZodNumber;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
    index: number;
    placeholder?: string | undefined;
    title?: string | undefined;
    html?: string | undefined;
    isRequired?: boolean | undefined;
}, {
    text: string;
    index: number;
    placeholder?: string | undefined;
    title?: string | undefined;
    html?: string | undefined;
    isRequired?: boolean | undefined;
}>;
export declare const TallyInputPayloadSchema: z.ZodObject<{
    html: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
} & {
    isRequired: z.ZodBoolean;
    placeholder: z.ZodString;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        index: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        id: string;
        index?: number | undefined;
    }, {
        text: string;
        id: string;
        index?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    placeholder: string;
    isRequired: boolean;
    options?: {
        text: string;
        id: string;
        index?: number | undefined;
    }[] | undefined;
    title?: string | undefined;
    html?: string | undefined;
}, {
    placeholder: string;
    isRequired: boolean;
    options?: {
        text: string;
        id: string;
        index?: number | undefined;
    }[] | undefined;
    title?: string | undefined;
    html?: string | undefined;
}>;
export declare const TallyTitlePayloadSchema: z.ZodObject<{
    html: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    html: string;
    title?: string | undefined;
}, {
    html: string;
    title?: string | undefined;
}>;
export declare const TallyBlockPayloadSchema: z.ZodUnion<[z.ZodObject<{
    html: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    html: string;
    title?: string | undefined;
}, {
    html: string;
    title?: string | undefined;
}>, z.ZodObject<{
    html: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
} & {
    isRequired: z.ZodBoolean;
    placeholder: z.ZodString;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        text: z.ZodString;
        index: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        id: string;
        index?: number | undefined;
    }, {
        text: string;
        id: string;
        index?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    placeholder: string;
    isRequired: boolean;
    options?: {
        text: string;
        id: string;
        index?: number | undefined;
    }[] | undefined;
    title?: string | undefined;
    html?: string | undefined;
}, {
    placeholder: string;
    isRequired: boolean;
    options?: {
        text: string;
        id: string;
        index?: number | undefined;
    }[] | undefined;
    title?: string | undefined;
    html?: string | undefined;
}>, z.ZodObject<{
    html: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    isRequired: z.ZodOptional<z.ZodBoolean>;
    placeholder: z.ZodOptional<z.ZodString>;
} & {
    index: z.ZodNumber;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
    index: number;
    placeholder?: string | undefined;
    title?: string | undefined;
    html?: string | undefined;
    isRequired?: boolean | undefined;
}, {
    text: string;
    index: number;
    placeholder?: string | undefined;
    title?: string | undefined;
    html?: string | undefined;
    isRequired?: boolean | undefined;
}>, z.ZodObject<{
    html: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    isRequired: z.ZodOptional<z.ZodBoolean>;
    placeholder: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    placeholder?: string | undefined;
    title?: string | undefined;
    html?: string | undefined;
    isRequired?: boolean | undefined;
}, {
    placeholder?: string | undefined;
    title?: string | undefined;
    html?: string | undefined;
    isRequired?: boolean | undefined;
}>]>;
export declare const TallyBlockSchema: z.ZodObject<{
    uuid: z.ZodString;
    type: z.ZodEnum<["FORM_TITLE", "TITLE", "INPUT_TEXT", "INPUT_EMAIL", "INPUT_NUMBER", "INPUT_PHONE_NUMBER", "INPUT_LINK", "INPUT_DATE", "INPUT_TIME", "TEXTAREA", "DROPDOWN", "DROPDOWN_OPTION", "CHECKBOXES", "CHECKBOX", "MULTIPLE_CHOICE", "MULTIPLE_CHOICE_OPTION", "LINEAR_SCALE", "RATING", "FILE_UPLOAD", "SIGNATURE", "HIDDEN_FIELDS", "CALCULATED_FIELDS", "MULTI_SELECT", "MATRIX", "RANKING", "PAYMENT"]>;
    groupUuid: z.ZodString;
    groupType: z.ZodEnum<["TEXT", "QUESTION", "INPUT_TEXT", "INPUT_EMAIL", "INPUT_NUMBER", "INPUT_PHONE_NUMBER", "INPUT_LINK", "INPUT_DATE", "INPUT_TIME", "TEXTAREA", "DROPDOWN", "CHECKBOXES", "MULTIPLE_CHOICE", "LINEAR_SCALE", "RATING", "FILE_UPLOAD", "SIGNATURE"]>;
    title: z.ZodString;
    payload: z.ZodUnion<[z.ZodObject<{
        html: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        html: string;
        title?: string | undefined;
    }, {
        html: string;
        title?: string | undefined;
    }>, z.ZodObject<{
        html: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
    } & {
        isRequired: z.ZodBoolean;
        placeholder: z.ZodString;
        options: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            text: z.ZodString;
            index: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            text: string;
            id: string;
            index?: number | undefined;
        }, {
            text: string;
            id: string;
            index?: number | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        placeholder: string;
        isRequired: boolean;
        options?: {
            text: string;
            id: string;
            index?: number | undefined;
        }[] | undefined;
        title?: string | undefined;
        html?: string | undefined;
    }, {
        placeholder: string;
        isRequired: boolean;
        options?: {
            text: string;
            id: string;
            index?: number | undefined;
        }[] | undefined;
        title?: string | undefined;
        html?: string | undefined;
    }>, z.ZodObject<{
        html: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        isRequired: z.ZodOptional<z.ZodBoolean>;
        placeholder: z.ZodOptional<z.ZodString>;
    } & {
        index: z.ZodNumber;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
        index: number;
        placeholder?: string | undefined;
        title?: string | undefined;
        html?: string | undefined;
        isRequired?: boolean | undefined;
    }, {
        text: string;
        index: number;
        placeholder?: string | undefined;
        title?: string | undefined;
        html?: string | undefined;
        isRequired?: boolean | undefined;
    }>, z.ZodObject<{
        html: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        isRequired: z.ZodOptional<z.ZodBoolean>;
        placeholder: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        placeholder?: string | undefined;
        title?: string | undefined;
        html?: string | undefined;
        isRequired?: boolean | undefined;
    }, {
        placeholder?: string | undefined;
        title?: string | undefined;
        html?: string | undefined;
        isRequired?: boolean | undefined;
    }>]>;
}, "strip", z.ZodTypeAny, {
    type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE" | "TITLE" | "DROPDOWN_OPTION" | "CHECKBOX" | "MULTIPLE_CHOICE_OPTION";
    uuid: string;
    title: string;
    groupUuid: string;
    groupType: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "RATING" | "SIGNATURE" | "TEXT" | "QUESTION";
    payload: {
        placeholder?: string | undefined;
        title?: string | undefined;
        html?: string | undefined;
        isRequired?: boolean | undefined;
    } | {
        text: string;
        index: number;
        placeholder?: string | undefined;
        title?: string | undefined;
        html?: string | undefined;
        isRequired?: boolean | undefined;
    } | {
        placeholder: string;
        isRequired: boolean;
        options?: {
            text: string;
            id: string;
            index?: number | undefined;
        }[] | undefined;
        title?: string | undefined;
        html?: string | undefined;
    } | {
        html: string;
        title?: string | undefined;
    };
}, {
    type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE" | "TITLE" | "DROPDOWN_OPTION" | "CHECKBOX" | "MULTIPLE_CHOICE_OPTION";
    uuid: string;
    title: string;
    groupUuid: string;
    groupType: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "RATING" | "SIGNATURE" | "TEXT" | "QUESTION";
    payload: {
        placeholder?: string | undefined;
        title?: string | undefined;
        html?: string | undefined;
        isRequired?: boolean | undefined;
    } | {
        text: string;
        index: number;
        placeholder?: string | undefined;
        title?: string | undefined;
        html?: string | undefined;
        isRequired?: boolean | undefined;
    } | {
        placeholder: string;
        isRequired: boolean;
        options?: {
            text: string;
            id: string;
            index?: number | undefined;
        }[] | undefined;
        title?: string | undefined;
        html?: string | undefined;
    } | {
        html: string;
        title?: string | undefined;
    };
}>;
export declare const TallyFormCreatePayloadSchema: z.ZodObject<{
    status: z.ZodDefault<z.ZodEnum<["PUBLISHED", "DRAFT"]>>;
    name: z.ZodString;
    blocks: z.ZodArray<z.ZodObject<{
        uuid: z.ZodString;
        type: z.ZodEnum<["FORM_TITLE", "TITLE", "INPUT_TEXT", "INPUT_EMAIL", "INPUT_NUMBER", "INPUT_PHONE_NUMBER", "INPUT_LINK", "INPUT_DATE", "INPUT_TIME", "TEXTAREA", "DROPDOWN", "DROPDOWN_OPTION", "CHECKBOXES", "CHECKBOX", "MULTIPLE_CHOICE", "MULTIPLE_CHOICE_OPTION", "LINEAR_SCALE", "RATING", "FILE_UPLOAD", "SIGNATURE", "HIDDEN_FIELDS", "CALCULATED_FIELDS", "MULTI_SELECT", "MATRIX", "RANKING", "PAYMENT"]>;
        groupUuid: z.ZodString;
        groupType: z.ZodEnum<["TEXT", "QUESTION", "INPUT_TEXT", "INPUT_EMAIL", "INPUT_NUMBER", "INPUT_PHONE_NUMBER", "INPUT_LINK", "INPUT_DATE", "INPUT_TIME", "TEXTAREA", "DROPDOWN", "CHECKBOXES", "MULTIPLE_CHOICE", "LINEAR_SCALE", "RATING", "FILE_UPLOAD", "SIGNATURE"]>;
        title: z.ZodString;
        payload: z.ZodUnion<[z.ZodObject<{
            html: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            html: string;
            title?: string | undefined;
        }, {
            html: string;
            title?: string | undefined;
        }>, z.ZodObject<{
            html: z.ZodOptional<z.ZodString>;
            title: z.ZodOptional<z.ZodString>;
        } & {
            isRequired: z.ZodBoolean;
            placeholder: z.ZodString;
            options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                text: z.ZodString;
                index: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                text: string;
                id: string;
                index?: number | undefined;
            }, {
                text: string;
                id: string;
                index?: number | undefined;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            placeholder: string;
            isRequired: boolean;
            options?: {
                text: string;
                id: string;
                index?: number | undefined;
            }[] | undefined;
            title?: string | undefined;
            html?: string | undefined;
        }, {
            placeholder: string;
            isRequired: boolean;
            options?: {
                text: string;
                id: string;
                index?: number | undefined;
            }[] | undefined;
            title?: string | undefined;
            html?: string | undefined;
        }>, z.ZodObject<{
            html: z.ZodOptional<z.ZodString>;
            title: z.ZodOptional<z.ZodString>;
            isRequired: z.ZodOptional<z.ZodBoolean>;
            placeholder: z.ZodOptional<z.ZodString>;
        } & {
            index: z.ZodNumber;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            index: number;
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        }, {
            text: string;
            index: number;
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        }>, z.ZodObject<{
            html: z.ZodOptional<z.ZodString>;
            title: z.ZodOptional<z.ZodString>;
            isRequired: z.ZodOptional<z.ZodBoolean>;
            placeholder: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        }, {
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        }>]>;
    }, "strip", z.ZodTypeAny, {
        type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE" | "TITLE" | "DROPDOWN_OPTION" | "CHECKBOX" | "MULTIPLE_CHOICE_OPTION";
        uuid: string;
        title: string;
        groupUuid: string;
        groupType: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "RATING" | "SIGNATURE" | "TEXT" | "QUESTION";
        payload: {
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        } | {
            text: string;
            index: number;
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        } | {
            placeholder: string;
            isRequired: boolean;
            options?: {
                text: string;
                id: string;
                index?: number | undefined;
            }[] | undefined;
            title?: string | undefined;
            html?: string | undefined;
        } | {
            html: string;
            title?: string | undefined;
        };
    }, {
        type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE" | "TITLE" | "DROPDOWN_OPTION" | "CHECKBOX" | "MULTIPLE_CHOICE_OPTION";
        uuid: string;
        title: string;
        groupUuid: string;
        groupType: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "RATING" | "SIGNATURE" | "TEXT" | "QUESTION";
        payload: {
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        } | {
            text: string;
            index: number;
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        } | {
            placeholder: string;
            isRequired: boolean;
            options?: {
                text: string;
                id: string;
                index?: number | undefined;
            }[] | undefined;
            title?: string | undefined;
            html?: string | undefined;
        } | {
            html: string;
            title?: string | undefined;
        };
    }>, "many">;
    settings: z.ZodOptional<z.ZodObject<{
        language: z.ZodOptional<z.ZodString>;
        closeDate: z.ZodOptional<z.ZodString>;
        closeTime: z.ZodOptional<z.ZodString>;
        closeTimezone: z.ZodOptional<z.ZodString>;
        submissionsLimit: z.ZodOptional<z.ZodNumber>;
        redirectOnCompletion: z.ZodOptional<z.ZodObject<{
            html: z.ZodString;
            mentions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        }, "strip", z.ZodTypeAny, {
            html: string;
            mentions?: any[] | undefined;
        }, {
            html: string;
            mentions?: any[] | undefined;
        }>>;
        hasSelfEmailNotifications: z.ZodOptional<z.ZodBoolean>;
        selfEmailTo: z.ZodOptional<z.ZodObject<{
            html: z.ZodString;
            mentions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        }, "strip", z.ZodTypeAny, {
            html: string;
            mentions?: any[] | undefined;
        }, {
            html: string;
            mentions?: any[] | undefined;
        }>>;
        selfEmailReplyTo: z.ZodOptional<z.ZodObject<{
            html: z.ZodString;
            mentions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        }, "strip", z.ZodTypeAny, {
            html: string;
            mentions?: any[] | undefined;
        }, {
            html: string;
            mentions?: any[] | undefined;
        }>>;
        selfEmailSubject: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        selfEmailFromName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        selfEmailBody: z.ZodOptional<z.ZodObject<{
            html: z.ZodString;
            mentions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        }, "strip", z.ZodTypeAny, {
            html: string;
            mentions?: any[] | undefined;
        }, {
            html: string;
            mentions?: any[] | undefined;
        }>>;
        uniqueSubmissionKey: z.ZodOptional<z.ZodObject<{
            html: z.ZodString;
            mentions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        }, "strip", z.ZodTypeAny, {
            html: string;
            mentions?: any[] | undefined;
        }, {
            html: string;
            mentions?: any[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        language?: string | undefined;
        closeDate?: string | undefined;
        closeTime?: string | undefined;
        closeTimezone?: string | undefined;
        submissionsLimit?: number | undefined;
        redirectOnCompletion?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        hasSelfEmailNotifications?: boolean | undefined;
        selfEmailTo?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        selfEmailReplyTo?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        selfEmailSubject?: string | null | undefined;
        selfEmailFromName?: string | null | undefined;
        selfEmailBody?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        uniqueSubmissionKey?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
    }, {
        language?: string | undefined;
        closeDate?: string | undefined;
        closeTime?: string | undefined;
        closeTimezone?: string | undefined;
        submissionsLimit?: number | undefined;
        redirectOnCompletion?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        hasSelfEmailNotifications?: boolean | undefined;
        selfEmailTo?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        selfEmailReplyTo?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        selfEmailSubject?: string | null | undefined;
        selfEmailFromName?: string | null | undefined;
        selfEmailBody?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        uniqueSubmissionKey?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    status: "PUBLISHED" | "DRAFT";
    blocks: {
        type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE" | "TITLE" | "DROPDOWN_OPTION" | "CHECKBOX" | "MULTIPLE_CHOICE_OPTION";
        uuid: string;
        title: string;
        groupUuid: string;
        groupType: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "RATING" | "SIGNATURE" | "TEXT" | "QUESTION";
        payload: {
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        } | {
            text: string;
            index: number;
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        } | {
            placeholder: string;
            isRequired: boolean;
            options?: {
                text: string;
                id: string;
                index?: number | undefined;
            }[] | undefined;
            title?: string | undefined;
            html?: string | undefined;
        } | {
            html: string;
            title?: string | undefined;
        };
    }[];
    settings?: {
        language?: string | undefined;
        closeDate?: string | undefined;
        closeTime?: string | undefined;
        closeTimezone?: string | undefined;
        submissionsLimit?: number | undefined;
        redirectOnCompletion?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        hasSelfEmailNotifications?: boolean | undefined;
        selfEmailTo?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        selfEmailReplyTo?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        selfEmailSubject?: string | null | undefined;
        selfEmailFromName?: string | null | undefined;
        selfEmailBody?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        uniqueSubmissionKey?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
    } | undefined;
}, {
    name: string;
    blocks: {
        type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE" | "TITLE" | "DROPDOWN_OPTION" | "CHECKBOX" | "MULTIPLE_CHOICE_OPTION";
        uuid: string;
        title: string;
        groupUuid: string;
        groupType: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "RATING" | "SIGNATURE" | "TEXT" | "QUESTION";
        payload: {
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        } | {
            text: string;
            index: number;
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        } | {
            placeholder: string;
            isRequired: boolean;
            options?: {
                text: string;
                id: string;
                index?: number | undefined;
            }[] | undefined;
            title?: string | undefined;
            html?: string | undefined;
        } | {
            html: string;
            title?: string | undefined;
        };
    }[];
    status?: "PUBLISHED" | "DRAFT" | undefined;
    settings?: {
        language?: string | undefined;
        closeDate?: string | undefined;
        closeTime?: string | undefined;
        closeTimezone?: string | undefined;
        submissionsLimit?: number | undefined;
        redirectOnCompletion?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        hasSelfEmailNotifications?: boolean | undefined;
        selfEmailTo?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        selfEmailReplyTo?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        selfEmailSubject?: string | null | undefined;
        selfEmailFromName?: string | null | undefined;
        selfEmailBody?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        uniqueSubmissionKey?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
    } | undefined;
}>;
export declare const TallyFormUpdatePayloadSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PUBLISHED", "DRAFT"]>>;
    blocks: z.ZodOptional<z.ZodArray<z.ZodObject<{
        uuid: z.ZodString;
        type: z.ZodEnum<["FORM_TITLE", "TITLE", "INPUT_TEXT", "INPUT_EMAIL", "INPUT_NUMBER", "INPUT_PHONE_NUMBER", "INPUT_LINK", "INPUT_DATE", "INPUT_TIME", "TEXTAREA", "DROPDOWN", "DROPDOWN_OPTION", "CHECKBOXES", "CHECKBOX", "MULTIPLE_CHOICE", "MULTIPLE_CHOICE_OPTION", "LINEAR_SCALE", "RATING", "FILE_UPLOAD", "SIGNATURE", "HIDDEN_FIELDS", "CALCULATED_FIELDS", "MULTI_SELECT", "MATRIX", "RANKING", "PAYMENT"]>;
        groupUuid: z.ZodString;
        groupType: z.ZodEnum<["TEXT", "QUESTION", "INPUT_TEXT", "INPUT_EMAIL", "INPUT_NUMBER", "INPUT_PHONE_NUMBER", "INPUT_LINK", "INPUT_DATE", "INPUT_TIME", "TEXTAREA", "DROPDOWN", "CHECKBOXES", "MULTIPLE_CHOICE", "LINEAR_SCALE", "RATING", "FILE_UPLOAD", "SIGNATURE"]>;
        title: z.ZodString;
        payload: z.ZodUnion<[z.ZodObject<{
            html: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            html: string;
            title?: string | undefined;
        }, {
            html: string;
            title?: string | undefined;
        }>, z.ZodObject<{
            html: z.ZodOptional<z.ZodString>;
            title: z.ZodOptional<z.ZodString>;
        } & {
            isRequired: z.ZodBoolean;
            placeholder: z.ZodString;
            options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                text: z.ZodString;
                index: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                text: string;
                id: string;
                index?: number | undefined;
            }, {
                text: string;
                id: string;
                index?: number | undefined;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            placeholder: string;
            isRequired: boolean;
            options?: {
                text: string;
                id: string;
                index?: number | undefined;
            }[] | undefined;
            title?: string | undefined;
            html?: string | undefined;
        }, {
            placeholder: string;
            isRequired: boolean;
            options?: {
                text: string;
                id: string;
                index?: number | undefined;
            }[] | undefined;
            title?: string | undefined;
            html?: string | undefined;
        }>, z.ZodObject<{
            html: z.ZodOptional<z.ZodString>;
            title: z.ZodOptional<z.ZodString>;
            isRequired: z.ZodOptional<z.ZodBoolean>;
            placeholder: z.ZodOptional<z.ZodString>;
        } & {
            index: z.ZodNumber;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            index: number;
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        }, {
            text: string;
            index: number;
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        }>, z.ZodObject<{
            html: z.ZodOptional<z.ZodString>;
            title: z.ZodOptional<z.ZodString>;
            isRequired: z.ZodOptional<z.ZodBoolean>;
            placeholder: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        }, {
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        }>]>;
    }, "strip", z.ZodTypeAny, {
        type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE" | "TITLE" | "DROPDOWN_OPTION" | "CHECKBOX" | "MULTIPLE_CHOICE_OPTION";
        uuid: string;
        title: string;
        groupUuid: string;
        groupType: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "RATING" | "SIGNATURE" | "TEXT" | "QUESTION";
        payload: {
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        } | {
            text: string;
            index: number;
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        } | {
            placeholder: string;
            isRequired: boolean;
            options?: {
                text: string;
                id: string;
                index?: number | undefined;
            }[] | undefined;
            title?: string | undefined;
            html?: string | undefined;
        } | {
            html: string;
            title?: string | undefined;
        };
    }, {
        type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE" | "TITLE" | "DROPDOWN_OPTION" | "CHECKBOX" | "MULTIPLE_CHOICE_OPTION";
        uuid: string;
        title: string;
        groupUuid: string;
        groupType: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "RATING" | "SIGNATURE" | "TEXT" | "QUESTION";
        payload: {
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        } | {
            text: string;
            index: number;
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        } | {
            placeholder: string;
            isRequired: boolean;
            options?: {
                text: string;
                id: string;
                index?: number | undefined;
            }[] | undefined;
            title?: string | undefined;
            html?: string | undefined;
        } | {
            html: string;
            title?: string | undefined;
        };
    }>, "many">>;
    settings: z.ZodOptional<z.ZodObject<{
        language: z.ZodOptional<z.ZodString>;
        closeDate: z.ZodOptional<z.ZodString>;
        closeTime: z.ZodOptional<z.ZodString>;
        closeTimezone: z.ZodOptional<z.ZodString>;
        submissionsLimit: z.ZodOptional<z.ZodNumber>;
        redirectOnCompletion: z.ZodOptional<z.ZodObject<{
            html: z.ZodString;
            mentions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        }, "strip", z.ZodTypeAny, {
            html: string;
            mentions?: any[] | undefined;
        }, {
            html: string;
            mentions?: any[] | undefined;
        }>>;
        hasSelfEmailNotifications: z.ZodOptional<z.ZodBoolean>;
        selfEmailTo: z.ZodOptional<z.ZodObject<{
            html: z.ZodString;
            mentions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        }, "strip", z.ZodTypeAny, {
            html: string;
            mentions?: any[] | undefined;
        }, {
            html: string;
            mentions?: any[] | undefined;
        }>>;
        selfEmailReplyTo: z.ZodOptional<z.ZodObject<{
            html: z.ZodString;
            mentions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        }, "strip", z.ZodTypeAny, {
            html: string;
            mentions?: any[] | undefined;
        }, {
            html: string;
            mentions?: any[] | undefined;
        }>>;
        selfEmailSubject: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        selfEmailFromName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        selfEmailBody: z.ZodOptional<z.ZodObject<{
            html: z.ZodString;
            mentions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        }, "strip", z.ZodTypeAny, {
            html: string;
            mentions?: any[] | undefined;
        }, {
            html: string;
            mentions?: any[] | undefined;
        }>>;
        uniqueSubmissionKey: z.ZodOptional<z.ZodObject<{
            html: z.ZodString;
            mentions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        }, "strip", z.ZodTypeAny, {
            html: string;
            mentions?: any[] | undefined;
        }, {
            html: string;
            mentions?: any[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        language?: string | undefined;
        closeDate?: string | undefined;
        closeTime?: string | undefined;
        closeTimezone?: string | undefined;
        submissionsLimit?: number | undefined;
        redirectOnCompletion?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        hasSelfEmailNotifications?: boolean | undefined;
        selfEmailTo?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        selfEmailReplyTo?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        selfEmailSubject?: string | null | undefined;
        selfEmailFromName?: string | null | undefined;
        selfEmailBody?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        uniqueSubmissionKey?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
    }, {
        language?: string | undefined;
        closeDate?: string | undefined;
        closeTime?: string | undefined;
        closeTimezone?: string | undefined;
        submissionsLimit?: number | undefined;
        redirectOnCompletion?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        hasSelfEmailNotifications?: boolean | undefined;
        selfEmailTo?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        selfEmailReplyTo?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        selfEmailSubject?: string | null | undefined;
        selfEmailFromName?: string | null | undefined;
        selfEmailBody?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        uniqueSubmissionKey?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    status?: "PUBLISHED" | "DRAFT" | undefined;
    settings?: {
        language?: string | undefined;
        closeDate?: string | undefined;
        closeTime?: string | undefined;
        closeTimezone?: string | undefined;
        submissionsLimit?: number | undefined;
        redirectOnCompletion?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        hasSelfEmailNotifications?: boolean | undefined;
        selfEmailTo?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        selfEmailReplyTo?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        selfEmailSubject?: string | null | undefined;
        selfEmailFromName?: string | null | undefined;
        selfEmailBody?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        uniqueSubmissionKey?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
    } | undefined;
    blocks?: {
        type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE" | "TITLE" | "DROPDOWN_OPTION" | "CHECKBOX" | "MULTIPLE_CHOICE_OPTION";
        uuid: string;
        title: string;
        groupUuid: string;
        groupType: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "RATING" | "SIGNATURE" | "TEXT" | "QUESTION";
        payload: {
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        } | {
            text: string;
            index: number;
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        } | {
            placeholder: string;
            isRequired: boolean;
            options?: {
                text: string;
                id: string;
                index?: number | undefined;
            }[] | undefined;
            title?: string | undefined;
            html?: string | undefined;
        } | {
            html: string;
            title?: string | undefined;
        };
    }[] | undefined;
}, {
    name?: string | undefined;
    status?: "PUBLISHED" | "DRAFT" | undefined;
    settings?: {
        language?: string | undefined;
        closeDate?: string | undefined;
        closeTime?: string | undefined;
        closeTimezone?: string | undefined;
        submissionsLimit?: number | undefined;
        redirectOnCompletion?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        hasSelfEmailNotifications?: boolean | undefined;
        selfEmailTo?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        selfEmailReplyTo?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        selfEmailSubject?: string | null | undefined;
        selfEmailFromName?: string | null | undefined;
        selfEmailBody?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
        uniqueSubmissionKey?: {
            html: string;
            mentions?: any[] | undefined;
        } | undefined;
    } | undefined;
    blocks?: {
        type: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "HIDDEN_FIELDS" | "CALCULATED_FIELDS" | "RATING" | "MULTI_SELECT" | "MATRIX" | "RANKING" | "SIGNATURE" | "PAYMENT" | "FORM_TITLE" | "TITLE" | "DROPDOWN_OPTION" | "CHECKBOX" | "MULTIPLE_CHOICE_OPTION";
        uuid: string;
        title: string;
        groupUuid: string;
        groupType: "INPUT_TEXT" | "INPUT_NUMBER" | "INPUT_EMAIL" | "INPUT_PHONE_NUMBER" | "INPUT_LINK" | "INPUT_DATE" | "INPUT_TIME" | "TEXTAREA" | "MULTIPLE_CHOICE" | "DROPDOWN" | "CHECKBOXES" | "LINEAR_SCALE" | "FILE_UPLOAD" | "RATING" | "SIGNATURE" | "TEXT" | "QUESTION";
        payload: {
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        } | {
            text: string;
            index: number;
            placeholder?: string | undefined;
            title?: string | undefined;
            html?: string | undefined;
            isRequired?: boolean | undefined;
        } | {
            placeholder: string;
            isRequired: boolean;
            options?: {
                text: string;
                id: string;
                index?: number | undefined;
            }[] | undefined;
            title?: string | undefined;
            html?: string | undefined;
        } | {
            html: string;
            title?: string | undefined;
        };
    }[] | undefined;
}>;
export declare function validateTallyResponse<T>(schema: z.ZodSchema<T>, data: unknown): T;
export declare function safeParseTallyResponse<T>(schema: z.ZodSchema<T>, data: unknown): z.SafeParseReturnType<unknown, T>;
export declare function createTallyValidator<T>(schema: z.ZodSchema<T>): (data: unknown) => T;
export declare function createSafeTallyValidator<T>(schema: z.ZodSchema<T>): (data: unknown) => z.SafeParseReturnType<unknown, T>;
export type TallyBlockType = z.infer<typeof TallyBlockTypeSchema>;
export type TallyGroupType = z.infer<typeof TallyGroupTypeSchema>;
export type TallyBlockBasePayload = z.infer<typeof TallyBlockBasePayloadSchema>;
export type TallyBlockOption = z.infer<typeof TallyBlockOptionSchema>;
export type TallyChoiceOptionPayload = z.infer<typeof TallyChoiceOptionPayloadSchema>;
export type TallyInputPayload = z.infer<typeof TallyInputPayloadSchema>;
export type TallyTitlePayload = z.infer<typeof TallyTitlePayloadSchema>;
export type TallyBlockPayload = z.infer<typeof TallyBlockPayloadSchema>;
export type TallyBlock = z.infer<typeof TallyBlockSchema>;
export type TallyFormCreatePayload = z.infer<typeof TallyFormCreatePayloadSchema>;
export type TallyFormUpdatePayload = z.infer<typeof TallyFormUpdatePayloadSchema>;
//# sourceMappingURL=tally-schemas.d.ts.map
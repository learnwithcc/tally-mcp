# Form Creation Tool (create_form)

## 1. Overview

The `create_form` tool generates **fully-functional [Tally](https://tally.so) forms** and now uses the new **block-based implementation** powered by the internal `BlockBuilder` utility.  
It accepts high-level descriptions (natural language), templates, **or** a complete `FormConfig` object and converts them into a single API request to `POST /forms` that contains a compliant `blocks[]` array.

Key highlights of this new version:

* 🧩 Builds Tally-compliant `FORM_TITLE`, `TITLE`, and `INPUT_*` blocks with RFC 4122 v4 UUIDs.
* ⚙️ Supports 18+ question / field types with automatic mapping (see Field Type Mapping).
* 🗂️ Generates one request – no more two-step create/patch flow.
* 🛡️ All payloads are validated against strict Zod schemas **before** calling the Tally API.

---

## 2. Input Schema

Pass the arguments as a JSON object. **Exactly one** of `formConfig`, `naturalLanguagePrompt`, or `templateId` must be provided; if more than one is present, priority is `formConfig` → `templateId` → `naturalLanguagePrompt`.

| Parameter               | Type              | Description                                                                                                                    | Required |
| ----------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------- |
| `formConfig`           | `FormConfig`      | A fully-formed configuration object. Skips NLP + template logic and is sent directly to the `createForm` service.             | ✔️* |
| `naturalLanguagePrompt` | `string`          | English description of the desired form (e.g., "Create a feedback form with a rating 1-5 and comments"). Ignored if `formConfig` is present. | ✔️* |
| `templateId`            | `string`          | ID of a saved template to instantiate. Ignored if `formConfig` is present.                                                    | ✔️* |
| `formTitle`             | `string`          | Optional title override. Applies to any of the above flows.                                                                    | No |

<sup>*Exactly one of these three ✔️* columns must be supplied.</sup>

Additional optional fields inherited from `FormConfig` (e.g., `description`, `settings`) can be nested inside `formConfig`.

---

## 3. Output Schema

```ts
interface FormCreationResult {
  formUrl:  string | undefined;                      // "https://tally.so/r/<id>" if available
  formId:   string;                                  // Tally form ID returned by the API
  formConfig: FormConfig;                            // The final config that was sent (after NLP/template processing)
  
  // ✨ NEW: Enhanced API Response Features (Added 2025-06-20)
  generatedFieldIds?: string[];                      // Array of field IDs created during form creation
  enrichedFieldConfigurations?: EnrichedFieldConfiguration[]; // Detailed field configurations with metadata
}
```

### Enhanced Response Details

The `create_form` tool now returns additional information to provide better visibility into the generated form structure:

#### `generatedFieldIds` (Array)
Contains the unique field IDs for each question/field in the form, in the same order as they appear in the form. These IDs are generated using RFC 4122 v4 UUIDs and can be used for:
- Tracking specific fields for analytics
- Referencing fields in subsequent form modifications
- Building field-specific validation or conditional logic

#### `enrichedFieldConfigurations` (Array) 
Provides detailed configuration objects for each field, including:

```ts
interface EnrichedFieldConfiguration {
  id: string;                                        // Unique field identifier (UUID)
  type: QuestionType;                               // Field type (text, email, dropdown, etc.)
  label: string;                                    // Display label for the field
  description?: string;                             // Optional field description/help text
  required: boolean;                                // Whether field is required
  placeholder?: string;                             // Placeholder text for input fields
  order: number;                                    // Position in form (1-based index)
  
  // Advanced Configuration
  validationRules?: {                               // Validation rules applied to field
    rules: Array<{
      type: string;                                 // Rule type (minLength, maxLength, pattern, etc.)
      value?: any;                                  // Rule value/constraint
      errorMessage?: string;                        // Custom error message
      enabled: boolean;                             // Whether rule is active
    }>;
  };
  
  options?: Array<{                                 // For choice-based fields (dropdown, radio, etc.)
    id: string;                                     // Option identifier
    label: string;                                  // Display text
    value: string;                                  // Option value
  }>;
  
  conditionalLogic?: {                              // Conditional visibility/requirements
    showIf?: any;                                   // Conditions to show field
    hideIf?: any;                                   // Conditions to hide field
    requireIf?: any;                                // Conditions to require field
  };
  
  typeSpecificProperties?: {                        // Field-type specific settings
    [key: string]: any;                             // e.g., min/max for numbers, currency for payment
  };
  
  metadata: {                                       // System metadata
    originalIndex: number;                          // Original position in form config
    createdAt: string;                              // ISO timestamp
    blockUuid?: string;                             // Corresponding Tally block UUID
    blockType?: string;                             // Tally block type
  };
}
```

### Backward Compatibility

The enhanced response structure is **fully backward compatible**. Existing integrations will continue to work unchanged, as the new fields (`generatedFieldIds` and `enrichedFieldConfigurations`) are optional and only add information without modifying existing response properties.

---

## 4. Field Type Mapping

The tool automatically converts high-level `QuestionType` values into Tally block types. Below is the current mapping table.

| QuestionType            | Tally Block Type |
| ----------------------- | ---------------- |
| `text`                  | `INPUT_TEXT` |
| `email`                 | `INPUT_EMAIL` |
| `number`                | `INPUT_NUMBER` |
| `phone`                 | `INPUT_PHONE_NUMBER` |
| `url`                   | `INPUT_LINK` |
| `date`                  | `INPUT_DATE` |
| `time`                  | `INPUT_TIME` |
| `textarea`              | `TEXTAREA` |
| `dropdown`/`select`     | `DROPDOWN` + `DROPDOWN_OPTION` blocks |
| `checkboxes`            | `CHECKBOXES` |
| `multiple_choice`       | `MULTIPLE_CHOICE` |
| `linear_scale`          | `LINEAR_SCALE` |
| `rating`                | `RATING` |
| `file`                  | `FILE_UPLOAD` |
| `signature`             | `SIGNATURE` |

> **Tip:** Extend this mapping via `src/utils/block-builder.ts` if you introduce new field types.

---

## 5. Example Workflows

### 5.1 Natural Language Prompt

```jsonc
{
  "tool": "create_form",
  "args": {
    "naturalLanguagePrompt": "Create a contact form with name, email, and message fields"
  }
}
```

### 5.2 Template Instantiation

```jsonc
{
  "tool": "create_form",
  "args": {
    "templateId": "contact-form-v2",
    "formTitle": "New Website Contact Form"
  }
}
```

### 5.3 Direct FormConfig

```jsonc
{
  "tool": "create_form",
  "args": {
    "formConfig": {
      "title": "Bug Report",
      "description": "Help us squash bugs. Please fill out the details below.",
      "fields": [
        { "type": "text", "label": "Summary of the bug", "required": true },
        { "type": "textarea", "label": "Steps to reproduce", "required": true },
        { "type": "file", "label": "Attach screenshot" }
      ]
    }
  }
}
```

All three flows now produce an enhanced response similar to:

```jsonc
{
  "formUrl": "https://tally.so/r/wMDxQr",
  "formId": "wMDxQr",
  "formConfig": {
    "title": "Bug Report",
    "fields": [/* … */]
  },
  // ✨ NEW: Enhanced response fields
  "generatedFieldIds": [
    "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8", 
    "6ba7b811-9dad-11d1-80b4-00c04fd430c9"
  ],
  "enrichedFieldConfigurations": [
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "type": "text",
      "label": "Summary of the bug",
      "required": true,
      "order": 1,
      "validationRules": {
        "rules": [
          {
            "type": "minLength",
            "value": 5,
            "errorMessage": "Please provide at least 5 characters",
            "enabled": true
          }
        ]
      },
      "metadata": {
        "originalIndex": 0,
        "createdAt": "2025-06-20T00:48:30.123Z",
        "blockUuid": "550e8400-e29b-41d4-a716-446655440000",
        "blockType": "INPUT_TEXT"
      }
    },
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "type": "textarea", 
      "label": "Steps to reproduce",
      "required": true,
      "order": 2,
      "typeSpecificProperties": {
        "rows": 4
      },
      "metadata": {
        "originalIndex": 1,
        "createdAt": "2025-06-20T00:48:30.124Z",
        "blockUuid": "550e8400-e29b-41d4-a716-446655440001",
        "blockType": "TEXTAREA"
      }
    },
    {
      "id": "6ba7b811-9dad-11d1-80b4-00c04fd430c9",
      "type": "file",
      "label": "Attach screenshot",
      "required": false,
      "order": 3,
      "typeSpecificProperties": {
        "allowedTypes": ["image/png", "image/jpeg"],
        "maxSize": "5MB"
      },
      "metadata": {
        "originalIndex": 2,
        "createdAt": "2025-06-20T00:48:30.125Z",
        "blockUuid": "550e8400-e29b-41d4-a716-446655440002", 
        "blockType": "FILE_UPLOAD"
      }
    }
  ]
}
```

---

## 6. Troubleshooting

| Symptom | Likely Cause | Resolution |
| ------- | ------------ | ---------- |
| `Tally API error 415: blocks is required` | Using an older two-step create/patch flow. | Ensure you are on `create_form` ≥ 2025-06-18 which sends the `blocks[]` array in the **initial** POST. |
| Missing share link in result | Tally sometimes omits `url` field in API response. | The tool falls back to `https://tally.so/r/<id>`. Verify that `formId` is present. |
| Validation errors thrown before API call | Zod schema rejected the payload. | Review the error message; ensure every field has a `label`, required flags are boolean, and `options[]` exist for choice controls. |
| Unknown field type | Mapping not defined in `BlockBuilder`. | Add new mapping and unit tests, then redeploy. |

---

## 7. Developer Guide

1. **Extending Field Support:**  
   Edit `src/utils/block-builder.ts`, add the new `QuestionType` to `mapQuestionTypeToBlockType`, and create corresponding payload logic.
2. **Adding Validation Rules:**  
   Update Zod schemas in `src/models/form-config-schemas.ts` and write unit tests in `src/utils/__tests__/block-builder.test.ts`.
3. **Performance Considerations:**  
   • Prefer `DRAFT` status during bulk test creation to avoid triggering Tally anti-spam logic.  
   • Block generation is O(n) to field count; UUID generation cost is negligible.
4. **Migration from v1 (two-step flow):**  
   Replace the previous `form_creation_tool` calls with `create_form`, remove any explicit PATCH calls, and ensure your code passes a `blocks[]` array in the initial request (handled for you when using this tool).

---

## 8. Changelog (Documentation Only)

| Date | Version | Notes |
| ---- | ------- | ----- |
| 2025-06-20 | v2.1 | **Enhanced API Response** – Added `generatedFieldIds` and `enrichedFieldConfigurations` to provide detailed field information, UUIDs, validation rules, and metadata. Maintains full backward compatibility. |
| 2025-06-18 | v2 | Major rewrite – reflects block-based implementation, new input schema, mapping table, troubleshooting, and developer guide. |
| 2025-04-30 | v1 | Initial version describing two-step flow. | 
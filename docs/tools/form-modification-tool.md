# Form Modification Tool

## 1. Overview

The `form_modification_tool` allows you to modify an existing Tally.so form using natural language commands. You can describe the changes you want to make, and the tool will parse your command and apply them to the specified form.

## 2. Input Schema

The tool accepts the following arguments in a JSON object:

| Parameter | Type   | Description                                                     | Required |
| --------- | ------ | --------------------------------------------------------------- | -------- |
| `command` | string | A description of the modification to make (e.g., "add a text field for 'address'"). | Yes      |
| `formId`  | string | The ID of the Tally form you want to modify.                    | Yes      |

## 3. Output Schema

The tool returns a JSON object with the following fields:

| Field         | Type     | Description                                                                                               |
| ------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `status`      | string   | The result of the operation. Can be `success`, `error`, or `clarification_needed`.                        |
| `message`     | string   | A human-readable message summarizing the outcome.                                                         |
| `finalFormConfig` | object   | The final `FormConfig` object after the modifications have been applied (only present on `success`).    |
| `changes`     | string[] | An array of strings describing the specific changes made (only present on `success`).                       |
| `errors`      | string[] | An array of error messages if the operation failed.                                                       |
| `clarification` | object   | If the command was ambiguous, this object contains a message and suggestions for clarifying the command. |
| `generatedFieldIds` | string[] | ✨ **NEW:** Array of field IDs after modification, including any newly generated UUIDs (only present on `success`). |
| `enrichedFieldConfigurations` | object[] | ✨ **NEW:** Detailed field configuration objects with metadata, validation rules, and type-specific properties (only present on `success`). |
| `fieldIdMappings` | object[] | ✨ **NEW:** Mapping between old and new field IDs for tracking changes during modifications (only present on `success`). |

### Enhanced Response Details (Added 2025-06-20)

The form modification tool now provides additional information about the modified form structure:

#### `generatedFieldIds` (Array)
Contains the complete list of field IDs after modification, including:
- Existing field IDs that were preserved
- New field IDs for added fields (RFC 4122 v4 UUIDs)
- Updated field IDs if fields were modified

#### `enrichedFieldConfigurations` (Array)
Provides detailed configuration objects for each field in the modified form (same structure as `create_form` tool - see Form Creation Tool documentation for complete interface details).

#### `fieldIdMappings` (Array)
Tracks field changes during modification:

```ts
interface FieldIdMapping {
  oldId?: string;          // Original field ID (undefined for new fields)
  newId: string;           // Current field ID after modification
  operation: string;       // Type of change: 'added', 'modified', 'preserved'
  fieldLabel: string;      // Field label for identification
}
```

### Backward Compatibility

The enhanced response structure is **fully backward compatible**. Existing integrations will continue to work unchanged, as the new fields are optional and only add information without modifying existing response properties.

## 4. Example Commands

### Example 1: Add a new field to a form

```json
{
  "tool": "form_modification_tool",
  "args": {
    "formId": "abCDe123",
    "command": "Add a new multiple choice question asking 'What is your favorite color?' with options Red, Green, and Blue."
  }
}
```

**Expected Output:**

```json
{
  "status": "success",
  "message": "Successfully modified the form.",
  "changes": [
    "Added new multiple choice field: 'What is your favorite color?'"
  ],
  "finalFormConfig": {
    "title": "Existing Form Title",
    "fields": [
      // ... existing fields ...
      {
        "type": "multiple_choice",
        "label": "What is your favorite color?",
        "options": ["Red", "Green", "Blue"]
      }
    ]
  },
  // ✨ NEW: Enhanced response fields
  "generatedFieldIds": [
    "existing-field-1",
    "existing-field-2", 
    "f47ac10b-58cc-4372-a567-0e02b2c3d480"
  ],
  "enrichedFieldConfigurations": [
    // ... existing field configurations ...
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d480",
      "type": "multiple_choice",
      "label": "What is your favorite color?",
      "required": false,
      "order": 3,
      "options": [
        {
          "id": "f47ac10b-58cc-4372-a567-0e02b2c3d481",
          "label": "Red",
          "value": "red"
        },
        {
          "id": "f47ac10b-58cc-4372-a567-0e02b2c3d482", 
          "label": "Green",
          "value": "green"
        },
        {
          "id": "f47ac10b-58cc-4372-a567-0e02b2c3d483",
          "label": "Blue", 
          "value": "blue"
        }
      ],
      "metadata": {
        "originalIndex": 2,
        "createdAt": "2025-06-20T00:50:15.123Z",
        "blockUuid": "550e8400-e29b-41d4-a716-446655440003",
        "blockType": "MULTIPLE_CHOICE"
      }
    }
  ],
  "fieldIdMappings": [
    {
      "oldId": "existing-field-1",
      "newId": "existing-field-1", 
      "operation": "preserved",
      "fieldLabel": "Name"
    },
    {
      "oldId": "existing-field-2",
      "newId": "existing-field-2",
      "operation": "preserved", 
      "fieldLabel": "Email"
    },
    {
      "newId": "f47ac10b-58cc-4372-a567-0e02b2c3d480",
      "operation": "added",
      "fieldLabel": "What is your favorite color?"
    }
  ]
}
```

### Example 2: Change the title of a form

```json
{
  "tool": "form_modification_tool",
  "args": {
    "formId": "abCDe123",
    "command": "Change the form title to 'Updated Contact Form'"
  }
}
```

**Expected Output:**

```json
{
  "status": "success",
  "message": "Successfully modified the form.",
  "changes": [
    "Updated form title to 'Updated Contact Form'"
  ],
  "finalFormConfig": {
    "title": "Updated Contact Form",
    "fields": [
      // ... existing fields ...
    ]
  }
}
```

## 5. Error Handling

- If `formId` is not provided, the tool will return an error.
- If the specified `formId` does not exist, the tool will return an error.
- If the command is ambiguous or cannot be understood, the `status` will be `clarification_needed`, and the `clarification` object will provide guidance.

---

## 6. Changelog (Documentation Only)

| Date | Version | Notes |
| ---- | ------- | ----- |
| 2025-06-20 | v1.1 | **Enhanced API Response** – Added `generatedFieldIds`, `enrichedFieldConfigurations`, and `fieldIdMappings` to provide detailed field information, track modifications, and include UUIDs and metadata. Maintains full backward compatibility. |
| 2025-04-30 | v1.0 | Initial version with basic form modification capabilities and natural language command parsing. | 
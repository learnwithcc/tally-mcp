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
  }
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
# Form Creation Tool

## 1. Overview

The `form_creation_tool` is used to create new Tally.so forms. It can generate a form in two ways:

1.  **From a natural language prompt:** You can describe the form you want to create in plain English.
2.  **From a template:** You can use a pre-defined template by providing its ID.

## 2. Input Schema

The tool accepts the following arguments in a JSON object:

| Parameter               | Type   | Description                                                                                             | Required |
| ----------------------- | ------ | ------------------------------------------------------------------------------------------------------- | -------- |
| `naturalLanguagePrompt` | string | A description of the form you want to create (e.g., "a contact form with name, email, and message").      | Yes      |
| `templateId`            | string | The ID of a pre-existing form template to use.                                                          | Yes      |
| `formTitle`             | string | An optional title for the new form. If not provided, a title will be generated or taken from the template. | No       |

**Note:** You must provide *either* `naturalLanguagePrompt` *or* `templateId`.

## 3. Output Schema

The tool returns a JSON object with the following fields:

| Field        | Type                | Description                                         |
| ------------ | ------------------- | --------------------------------------------------- |
| `formUrl`    | string \| undefined | The URL of the newly created Tally form.            |
| `formConfig` | object              | The `FormConfig` object that was used to create the form. |

## 4. Example Commands

### Example 1: Create a form from a natural language prompt

```json
{
  "tool": "form_creation_tool",
  "args": {
    "naturalLanguagePrompt": "Create a simple survey to gauge customer satisfaction with our new product. Include a rating scale from 1 to 5 and a field for open-ended feedback."
  }
}
```

**Expected Output:**

```json
{
  "formUrl": "https://tally.so/r/wMDxQr",
  "formConfig": {
    "title": "Customer Satisfaction Survey",
    "fields": [
      { "type": "rating", "label": "How would you rate our new product?", "options": ["1", "2", "3", "4", "5"] },
      { "type": "textarea", "label": "Please provide any additional feedback:" }
    ]
  }
}
```

### Example 2: Create a form from a template

```json
{
  "tool": "form_creation_tool",
  "args": {
    "templateId": "contact-form-v1",
    "formTitle": "New Website Contact Form"
  }
}
```

**Expected Output:**

```json
{
  "formUrl": "https://tally.so/r/wMDxQz",
  "formConfig": {
    "title": "New Website Contact Form",
    "fields": [
      { "type": "input", "label": "Full Name" },
      { "type": "email", "label": "Email Address" },
      { "type": "textarea", "label": "Your Message" }
    ]
  }
}
```

## 5. Error Handling

- If neither `naturalLanguagePrompt` nor `templateId` is provided, the tool will throw an error.
- If a `templateId` is provided but not found, the tool will throw an error. 
# Template Tool

## 1. Overview

The `TemplateTool` is used to manage and use form templates. It allows you to list available templates, instantiate a template to create a new form configuration, and customize a template using natural language.

## 2. Key Functions

The tool has a single `execute` method, and the `action` parameter determines what it does.

### `action: 'list'`

Lists all available form templates.

**Input Schema:** No arguments needed.

### `action: 'use'`

Creates a new form configuration from a template.

**Input Schema:**

| Parameter   | Type   | Description                                | Required |
| ----------- | ------ | ------------------------------------------ | -------- |
| `templateId`| string | The ID of the template to use.             | Yes      |
| `customTitle`| string | An optional title for the new form.        | No       |

### `action: 'customize'`

Customizes an existing template using a natural language prompt.

**Input Schema:**

| Parameter           | Type   | Description                                      | Required |
| ------------------- | ------ | ------------------------------------------------ | -------- |
| `templateId`        | string | The ID of the template to customize.             | Yes      |
| `customizationPrompt`| string | A natural language description of the changes.   | Yes      |

## 3. Example Usage

**List all templates:**
```json
{
  "tool": "template_tool",
  "args": {
    "action": "list"
  }
}
```

**Use a template to create a form:**
```json
{
  "tool": "template_tool",
  "args": {
    "action": "use",
    "templateId": "event-rsvp",
    "customTitle": "Company Picnic RSVP"
  }
}
```

**Customize a template:**
```json
{
  "tool": "template_tool",
  "args": {
    "action": "customize",
    "templateId": "contact-form-v1",
    "customizationPrompt": "Add a field for 'Company Name' and make the 'Phone Number' field optional."
  }
}
``` 
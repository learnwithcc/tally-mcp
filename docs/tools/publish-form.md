# Publish Form Function

## 1. Overview

This function is part of the [Form Sharing Tool](./form-sharing-tool.md) and is used to publish a Tally.so form, making it accessible to users. It also allows you to control various publication settings.

You can call the following methods:
- `publishForm`
- `unpublishForm`
- `getPublicationSettings`
- `updatePublicationSettings`

## 2. `publishForm`

Publishes a form with the specified settings.

### Input Schema

| Parameter            | Type     | Description                                             | Required |
| -------------------- | -------- | ------------------------------------------------------- | -------- |
| `formId`             | string   | The ID of the form to publish.                          | Yes      |
| `visibility`         | string   | `public`, `private`, or `password`.                     | No       |
| `password`           | string   | Required if `visibility` is `password`.                 | No       |
| `publishDate`        | string   | ISO 8601 datetime to schedule publishing.               | No       |
| `unpublishDate`      | string   | ISO 8601 datetime to schedule unpublishing.             | No       |
| `notificationEmails` | string[] | An array of emails to notify on new submissions.        | No       |

### Example

```json
{
  "tool": "form_sharing_tool",
  "method": "publishForm",
  "args": {
    "formId": "abCDe123",
    "visibility": "public"
  }
}
```

## 3. `unpublishForm`

Makes a form private and inaccessible.

### Input Schema

| Parameter | Type   | Description                    | Required |
| --------- | ------ | ------------------------------ | -------- |
| `formId`  | string | The ID of the form to unpublish. | Yes      |

### Example

```json
{
  "tool": "form_sharing_tool",
  "method": "unpublishForm",
  "args": {
    "formId": "abCDe123"
  }
}
```

## 4. `updatePublicationSettings`

Updates the settings for an already published form.

### Input Schema

The `settings` object can contain any of the parameters from the `publishForm` input schema (except `formId`).

| Parameter | Type   | Description                             | Required |
| --------- | ------ | --------------------------------------- | -------- |
| `formId`  | string | The ID of the form to update.           | Yes      |
| `settings`| object | An object containing the settings to update. | Yes      |

### Example

```json
{
  "tool": "form_sharing_tool",
  "method": "updatePublicationSettings",
  "args": {
    "formId": "abCDe123",
    "settings": {
      "visibility": "password",
      "password": "new-password"
    }
  }
}
``` 
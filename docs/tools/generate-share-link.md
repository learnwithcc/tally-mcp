# Generate Share Link Function

## 1. Overview

This function is part of the [Form Sharing Tool](./form-sharing-tool.md) and is used to generate a shareable link for a Tally.so form. You can create different types of links with various restrictions.

You can call the following methods:
- `generateShareLink`
- `getShareLinks`
- `deactivateShareLink`

## 2. `generateShareLink`

Creates a new shareable link for a form.

### Input Schema

| Parameter         | Type    | Description                                       | Required |
| ----------------- | ------- | ------------------------------------------------- | -------- |
| `formId`          | string  | The ID of the form.                               | Yes      |
| `type`            | string  | `public` or `private`.                            | Yes      |
| `customSlug`      | string  | A custom string for the link URL.                 | No       |
| `password`        | string  | A password to protect the link.                   | No       |
| `expirationHours` | number  | The number of hours until the link expires.       | No       |
| `maxUses`         | number  | The maximum number of times the link can be used. | No       |
| `trackingEnabled` | boolean | Enable analytics tracking for this link.          | No       |

### Example

```json
{
  "tool": "form_sharing_tool",
  "method": "generateShareLink",
  "args": {
    "formId": "abCDe123",
    "type": "public",
    "customSlug": "my-cool-form",
    "expirationHours": 24
  }
}
```

## 3. `getShareLinks`

Retrieves all active share links for a form.

### Input Schema

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| `formId`  | string | The ID of the form.   | Yes      |

### Example

```json
{
  "tool": "form_sharing_tool",
  "method": "getShareLinks",
  "args": {
    "formId": "abCDe123"
  }
}
```

## 4. `deactivateShareLink`

Deactivates a specific share link.

### Input Schema

| Parameter | Type   | Description                      | Required |
| --------- | ------ | -------------------------------- | -------- |
| `linkId`  | string | The ID of the share link to deactivate. | Yes      |

### Example

```json
{
  "tool": "form_sharing_tool",
  "method": "deactivateShareLink",
  "args": {
    "linkId": "link-xyz-456"
  }
}
``` 
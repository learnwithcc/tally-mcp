# Form Analytics Functions

## 1. Overview

This function is part of the [Form Sharing Tool](./form-sharing-tool.md) and is used to retrieve analytics and sharing statistics for your Tally.so forms.

You can call the following methods:
- `getFormAnalytics`
- `getFormSharingStats`

## 2. `getFormAnalytics`

Retrieves analytics data for a form, such as views and submission rates.

### Input Schema

| Parameter | Type   | Description                                   | Required |
| --------- | ------ | --------------------------------------------- | -------- |
| `formId`  | string | The ID of the form.                           | Yes      |
| `period`  | string | `day`, `week`, `month`, or `year`. Default is `week`. | No       |

### Example

```json
{
  "tool": "form_sharing_tool",
  "method": "getFormAnalytics",
  "args": {
    "formId": "abCDe123",
    "period": "month"
  }
}
```

### Output Schema

The output will be a JSON object containing analytics data, such as:
- `views`
- `submissions`
- `completionRate`
- `averageTime`

## 3. `getFormSharingStats`

Retrieves statistics related to how a form is being shared.

### Input Schema

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| `formId`  | string | The ID of the form.   | Yes      |

### Example

```json
{
  "tool": "form_sharing_tool",
  "method": "getFormSharingStats",
  "args": {
    "formId": "abCDe123"
  }
}
```

### Output Schema

The output will be a JSON object containing sharing statistics, such as:
- `totalShares`
- `viewsBySource`
- `linkClicks`

</rewritten_file> 
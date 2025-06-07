# Submission Analysis Tool

## 1. Overview

The `SubmissionAnalysisTool` is used to retrieve, analyze, and export submissions for a Tally.so form.

## 2. Key Functions

### `list`

Lists all submissions for a form, with optional filters.

**Input Schema:**

| Parameter | Type   | Description                                   | Required |
| --------- | ------ | --------------------------------------------- | -------- |
| `formId`  | string | The ID of the form.                           | Yes      |
| `filters` | object | An object with `startDate`, `endDate`, or `status`. | No       |

### `analyze`

Provides a high-level analysis of form submissions.

**Input Schema:**

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| `formId`  | string | The ID of the form.   | Yes      |
| `filters` | object | Optional filters.     | No       |

### `getAverageRating`

Calculates the average rating for a specific question.

**Input Schema:**

| Parameter     | Type   | Description                       | Required |
| ------------- | ------ | --------------------------------- | -------- |
| `formId`      | string | The ID of the form.               | Yes      |
| `questionTitle`| string | The title of the rating question. | Yes      |

### `getResponseDistribution`

Gets the distribution of answers for a specific question.

**Input Schema:**

| Parameter     | Type   | Description                      | Required |
| ------------- | ------ | -------------------------------- | -------- |
| `formId`      | string | The ID of the form.              | Yes      |
| `questionTitle`| string | The title of the question.       | Yes      |

### `exportToCSV` / `exportToJSON`

Exports submissions to a CSV or JSON file.

**Input Schema:**

| Parameter | Type   | Description                  | Required |
| --------- | ------ | ---------------------------- | -------- |
| `formId`  | string | The ID of the form.          | Yes      |
| `filePath`| string | The path to save the file to. | Yes      |

### `search`

Searches for submissions containing a specific query.

**Input Schema:**

| Parameter | Type   | Description                  | Required |
| --------- | ------ | ---------------------------- | -------- |
| `formId`  | string | The ID of the form.          | Yes      |
| `query`   | string | The text to search for.      | Yes      |

## 3. Example Usage

**Get the average rating for a question:**
```json
{
  "tool": "submission_analysis_tool",
  "method": "getAverageRating",
  "args": {
    "formId": "abCDe123",
    "questionTitle": "How satisfied are you?"
  }
}
```

**Export submissions to a CSV file:**
```json
{
  "tool": "submission_analysis_tool",
  "method": "exportToCSV",
  "args": {
    "formId": "abCDe123",
    "filePath": "/path/to/submissions.csv"
  }
}
``` 
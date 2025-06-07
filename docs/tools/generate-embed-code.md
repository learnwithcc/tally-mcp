# Generate Embed Code Function

## 1. Overview

This function is part of the [Form Sharing Tool](./form-sharing-tool.md) and is used to generate embed codes for a Tally.so form. You can customize the appearance of the embedded form.

## 2. Input Schema

| Parameter         | Type    | Description                               | Required |
| ----------------- | ------- | ----------------------------------------- | -------- |
| `formId`          | string  | The ID of the form to embed.              | Yes      |
| `theme`           | string  | `light` or `dark`.                        | No       |
| `autoHeight`      | boolean | Automatically adjust the height.          | No       |
| `width`           | string  | Width of the embed (e.g., "100%", "500px").| No       |
| `height`          | string  | Height of the embed (e.g., "600px").      | No       |
| `hideHeader`      | boolean | Hide the form header.                     | No       |
| `hideFooter`      | boolean | Hide the form footer.                     | No       |
| `backgroundColor` | string  | A hex color code (e.g., "#FFFFFF").       | No       |
| `borderRadius`    | number  | Border radius in pixels.                  | No       |
| `customCss`       | string  | Custom CSS to apply to the form.          | No       |

## 3. Output Schema

The tool returns a JSON object containing the embed codes:

| Field        | Type   | Description                            |
| ------------ | ------ | -------------------------------------- |
| `html`       | string | The raw HTML embed code.               |
| `javascript` | string | The JavaScript snippet for embedding.  |
| `iframe`     | string | The iframe embed code.                 |

## 4. Example

```json
{
  "tool": "form_sharing_tool",
  "method": "generateEmbedCode",
  "args": {
    "formId": "abCDe123",
    "theme": "dark",
    "width": "80%",
    "hideHeader": true
  }
}
```

**Expected Output:**

```json
{
  "success": true,
  "embedCode": {
    "html": "<div data-tally-id=\"abCDe123\" ...></div>",
    "javascript": "<script>...</script>",
    "iframe": "<iframe src=\"https://tally.so/embed/abCDe123?...\"></iframe>"
  }
}
``` 
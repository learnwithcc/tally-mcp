# Form Permission Manager

## 1. Overview

The `FormPermissionManager` is a tool for managing access control for your Tally.so forms. It allows you to set granular permissions for individual users, manage inheritance from workspace settings, and validate user access.

## 2. Key Functions

### `setFormPermission`

Sets a specific access level for a user on a form.

**Input Schema:**

| Parameter            | Type    | Description                                             | Required |
| -------------------- | ------- | ------------------------------------------------------- | -------- |
| `formId`             | string  | The ID of the form.                                     | Yes      |
| `userId`             | string  | The ID of the user.                                     | Yes      |
| `accessLevel`        | string  | `view`, `edit`, `manage`, or `admin`.                   | Yes      |
| `inheritFromWorkspace` | boolean | If `false`, this permission overrides workspace settings. | No       |
| `grantedBy`          | string  | The ID of the user granting the permission.             | Yes      |

### `removeFormPermission`

Removes a user's permission from a form.

**Input Schema:**

| Parameter | Type   | Description           | Required |
| --------- | ------ | --------------------- | -------- |
| `formId`  | string | The ID of the form.   | Yes      |
| `userId`  | string | The ID of the user.   | Yes      |

### `getEffectivePermission`

Gets the actual permission level a user has on a form, considering both direct and inherited permissions.

**Input Schema:**

| Parameter   | Type   | Description              | Required |
| ----------- | ------ | ------------------------ | -------- |
| `formId`    | string | The ID of the form.      | Yes      |
| `userId`    | string | The ID of the user.      | Yes      |
| `workspaceId`| string | The ID of the workspace. | Yes      |

### `validateAccess`

Checks if a user has at least a required level of access.

**Input Schema:**

| Parameter           | Type   | Description                   | Required |
| ------------------- | ------ | ----------------------------- | -------- |
| `formId`            | string | The ID of the form.           | Yes      |
| `userId`            | string | The ID of the user.           | Yes      |
| `requiredAccessLevel`| string | The minimum access level to check for. | Yes      |

### `copyFormPermissions`

Copies all permissions from one form to another.

**Input Schema:**

| Parameter      | Type    | Description                           | Required |
| -------------- | ------- | ------------------------------------- | -------- |
| `sourceFormId` | string  | The ID of the form to copy from.      | Yes      |
| `targetFormId` | string  | The ID of the form to copy to.        | Yes      |
| `includeSettings`| boolean | If `true`, also copies permission settings. | No       |

## 3. Example Usage

**Set a user's permission to 'edit':**
```json
{
  "tool": "form_permission_manager",
  "method": "setFormPermission",
  "args": {
    "formId": "abCDe123",
    "userId": "user-xyz-789",
    "accessLevel": "edit",
    "grantedBy": "admin-user-123"
  }
}
```

**Check if a user can manage a form:**
```json
{
  "tool": "form_permission_manager",
  "method": "validateAccess",
  "args": {
    "formId": "abCDe123",
    "userId": "user-xyz-789",
    "requiredAccessLevel": "manage"
  }
}
``` 
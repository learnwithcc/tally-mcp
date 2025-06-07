# Workspace Management Tool

## 1. Overview

The `WorkspaceManagementTool` is used to manage workspaces, including listing workspaces, viewing details, and managing user access.

## 2. Key Functions

### `listWorkspaces`

Lists all available workspaces.

**Input Schema:**

| Parameter | Type   | Description                       | Required |
| --------- | ------ | --------------------------------- | -------- |
| `page`    | number | The page number for pagination.   | No       |
| `limit`   | number | The number of workspaces per page.| No       |

### `getWorkspaceDetails`

Retrieves the details for a specific workspace.

**Input Schema:**

| Parameter   | Type   | Description                 | Required |
| ----------- | ------ | --------------------------- | -------- |
| `workspaceId`| string | The ID of the workspace.    | Yes      |

### `inviteUserToWorkspace`

Invites a user to a workspace.

**Input Schema:**

| Parameter   | Type   | Description                             | Required |
| ----------- | ------ | --------------------------------------- | -------- |
| `workspaceId`| string | The ID of the workspace.                | Yes      |
| `email`     | string | The email address of the user to invite. | Yes      |
| `role`      | string | `owner`, `admin`, or `member`.          | Yes      |

### `removeUserFromWorkspace`

Removes a user from a workspace.

**Input Schema:**

| Parameter   | Type   | Description                        | Required |
| ----------- | ------ | ---------------------------------- | -------- |
| `workspaceId`| string | The ID of the workspace.           | Yes      |
| `userId`    | string | The ID of the user to remove.      | Yes      |

### `updateUserRoleInWorkspace`

Updates a user's role within a workspace.

**Input Schema:**

| Parameter   | Type   | Description                        | Required |
| ----------- | ------ | ---------------------------------- | -------- |
| `workspaceId`| string | The ID of the workspace.           | Yes      |
| `userId`    | string | The ID of the user to update.      | Yes      |
| `role`      | string | The new role for the user.         | Yes      |

## 3. Example Usage

**List the first page of workspaces:**
```json
{
  "tool": "workspace_management_tool",
  "method": "listWorkspaces",
  "args": {
    "page": 1,
    "limit": 10
  }
}
```

**Invite a new member to a workspace:**
```json
{
  "tool": "workspace_management_tool",
  "method": "inviteUserToWorkspace",
  "args": {
    "workspaceId": "ws-12345",
    "email": "new.member@example.com",
    "role": "member"
  }
}
``` 
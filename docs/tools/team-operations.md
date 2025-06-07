# Basic Team Operations

## 1. Overview

These functions, part of the [Team Manager](./team-manager.md), handle the fundamental operations for managing teams.

You can call the following methods:
- `createTeam`
- `getTeam`
- `updateTeam`
- `deleteTeam`
- `getTeams`

## 2. `createTeam`

Creates a new team.

### Input Schema

| Parameter     | Type   | Description                       | Required |
| ------------- | ------ | --------------------------------- | -------- |
| `workspaceId` | string | The ID of the workspace.          | Yes      |
| `name`        | string | The name of the new team.         | Yes      |
| `description` | string | A description for the team.       | No       |
| `parentTeamId`| string | The ID of the parent team, if any. | No       |

## 3. `getTeam`

Retrieves details for a specific team.

### Input Schema

| Parameter | Type   | Description              | Required |
| --------- | ------ | ------------------------ | -------- |
| `teamId`  | string | The ID of the team to get. | Yes      |

## 4. `updateTeam`

Updates an existing team's properties.

### Input Schema

| Parameter | Type   | Description                             | Required |
| --------- | ------ | --------------------------------------- | -------- |
| `teamId`  | string | The ID of the team to update.           | Yes      |
| `updates` | object | An object with the new `name`, `description`, or `parentTeamId`. | Yes      |

## 5. `deleteTeam`

Deletes a team.

### Input Schema

| Parameter             | Type    | Description                                           | Required |
| --------------------- | ------- | ----------------------------------------------------- | -------- |
| `teamId`              | string  | The ID of the team to delete.                         | Yes      |
| `reassignMembersTo`   | string  | A team ID to move members to.                         | No       |
| `deleteChildTeams`    | boolean | If `true`, deletes all nested teams. Default is `false`. | No       |

## 6. `getTeams`

Lists teams in a workspace.

### Input Schema

| Parameter         | Type    | Description                               | Required |
| ----------------- | ------- | ----------------------------------------- | -------- |
| `workspaceId`     | string  | The ID of the workspace.                  | Yes      |
| `parentTeamId`    | string  | Filter by parent team ID.                 | No       |
| `includeSubteams` | boolean | Include all nested sub-teams.             | No       |
| `sortBy`          | string  | `name`, `created`, `updated`, `memberCount`. | No       |
| `sortOrder`       | string  | `asc` or `desc`.                          | No       |
| `page`            | number  | The page number for pagination.           | No       |
| `limit`           | number  | The number of teams per page.             | No       |

</rewritten_file> 
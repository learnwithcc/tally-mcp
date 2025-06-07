# Team Hierarchy

## 1. Overview

These functions, part of the [Team Manager](./team-manager.md), are used to manage the nested structure of teams within a workspace.

You can call the following methods:
- `moveTeam`
- `getOrganizationStructure`
- `createTeamHierarchy`
- `getTeamPath`
- `getTeamDescendants`

## 2. `moveTeam`

Moves a team to a new parent, or makes it a root-level team.

### Input Schema

| Parameter      | Type   | Description                               | Required |
| -------------- | ------ | ----------------------------------------- | -------- |
| `teamId`       | string | The ID of the team to move.               | Yes      |
| `newParentTeamId` | string | The ID of the new parent. Omit to make it a root team. | No       |

## 3. `getOrganizationStructure`

Retrieves the entire team hierarchy for a workspace.

### Input Schema

| Parameter   | Type   | Description              | Required |
| ----------- | ------ | ------------------------ | -------- |
| `workspaceId`| string | The ID of the workspace. | Yes      |

## 4. `createTeamHierarchy`

Creates a nested team structure from a defined hierarchy.

### Input Schema

The input is a `hierarchy` object with `name`, `description`, and an array of `children` objects.

| Parameter   | Type   | Description              | Required |
| ----------- | ------ | ------------------------ | -------- |
| `workspaceId`| string | The ID of the workspace. | Yes      |
| `hierarchy` | object | The hierarchy definition. | Yes      |

### Example Hierarchy Object

```json
{
  "name": "Engineering",
  "children": [
    { "name": "Frontend" },
    { "name": "Backend", "children": [{ "name": "API" }, { "name": "Database" }] }
  ]
}
```

## 5. `getTeamPath`

Retrieves the path from the root to a specific team.

### Input Schema

| Parameter | Type   | Description              | Required |
| --------- | ------ | ------------------------ | -------- |
| `teamId`  | string | The ID of the team.      | Yes      |

## 6. `getTeamDescendants`

Retrieves all teams nested under a specific team.

### Input Schema

| Parameter | Type   | Description              | Required |
| --------- | ------ | ------------------------ | -------- |
| `teamId`  | string | The ID of the team.      | Yes      |
 
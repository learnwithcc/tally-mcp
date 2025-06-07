# Team Membership

## 1. Overview

These functions, part of the [Team Manager](./team-manager.md), are used to manage the members of a team.

You can call the following methods:
- `addTeamMember`
- `removeTeamMember`
- `updateTeamMember`
- `bulkUpdateMemberships`
- `moveUsersBetweenTeams`

## 2. `addTeamMember`

Adds a user to a team.

### Input Schema

| Parameter   | Type     | Description                                | Required |
| ----------- | -------- | ------------------------------------------ | -------- |
| `teamId`    | string   | The ID of the team.                        | Yes      |
| `userId`    | string   | The ID of the user to add.                 | Yes      |
| `role`      | string   | `admin`, `member`, or `guest`. Default is `member`. | No       |
| `permissions`| string[] | An array of specific permission strings.   | No       |

## 3. `removeTeamMember`

Removes a user from a team.

### Input Schema

| Parameter | Type   | Description                      | Required |
| --------- | ------ | -------------------------------- | -------- |
| `teamId`  | string | The ID of the team.              | Yes      |
| `userId`  | string | The ID of the user to remove.    | Yes      |

## 4. `updateTeamMember`

Updates a team member's role or permissions.

### Input Schema

| Parameter | Type   | Description                                  | Required |
| --------- | ------ | -------------------------------------------- | -------- |
| `teamId`  | string | The ID of the team.                          | Yes      |
| `userId`  | string | The ID of the user to update.                | Yes      |
| `updates` | object | An object with the new `role` or `permissions`. | Yes      |

## 5. `bulkUpdateMemberships`

Performs a bulk update of memberships for a single team.

### Input Schema

| Parameter | Type     | Description                                           | Required |
| --------- | -------- | ----------------------------------------------------- | -------- |
| `teamId`  | string   | The ID of the team.                                   | Yes      |
| `updates` | object[] | An array of update objects, each with `userId`, `action` (`add` or `remove`), and optional `role`. | Yes      |

## 6. `moveUsersBetweenTeams`

Moves a list of users from one team to another.

### Input Schema

| Parameter  | Type     | Description                     | Required |
| ---------- | -------- | ------------------------------- | -------- |
| `userIds`  | string[] | An array of user IDs to move.   | Yes      |
| `fromTeamId`| string   | The ID of the source team.      | Yes      |
| `toTeamId` | string   | The ID of the destination team. | Yes      |
| `newRole`  | string   | The new role for the users in the destination team. | No       |

</rewritten_file> 
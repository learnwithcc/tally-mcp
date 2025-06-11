import { WorkspaceManagementTool } from '../workspace-tool';
import { WorkspaceService } from '../../services';
jest.mock('../../services');
const MockedWorkspaceService = WorkspaceService;
const mockWorkspacesResponse = {
    workspaces: [
        { id: 'ws1', name: 'Workspace 1', slug: 'ws1', createdAt: '', updatedAt: '' },
    ],
    page: 1,
    limit: 50,
    hasMore: false,
};
const mockWorkspace = {
    id: 'ws1', name: 'Workspace 1', slug: 'ws1', createdAt: '', updatedAt: ''
};
describe('WorkspaceManagementTool', () => {
    let tool;
    let service;
    beforeEach(() => {
        MockedWorkspaceService.mockClear();
        MockedWorkspaceService.prototype.getWorkspaces = jest.fn().mockResolvedValue(mockWorkspacesResponse);
        MockedWorkspaceService.prototype.getWorkspace = jest.fn().mockResolvedValue(mockWorkspace);
        tool = new WorkspaceManagementTool();
        service = MockedWorkspaceService.mock.instances[0];
    });
    describe('listWorkspaces', () => {
        it('should call WorkspaceService.getWorkspaces and return the result', async () => {
            const options = { page: 2, limit: 10 };
            const result = await tool.listWorkspaces(options);
            expect(service.getWorkspaces).toHaveBeenCalledWith(options);
            expect(result).toEqual(mockWorkspacesResponse);
        });
    });
    describe('getWorkspaceDetails', () => {
        it('should call WorkspaceService.getWorkspace and return the result', async () => {
            const workspaceId = 'ws1';
            const result = await tool.getWorkspaceDetails(workspaceId);
            expect(service.getWorkspace).toHaveBeenCalledWith(workspaceId);
            expect(result).toEqual(mockWorkspace);
        });
    });
    describe('inviteUserToWorkspace', () => {
        it('should call WorkspaceService.inviteUser with the correct parameters', async () => {
            const workspaceId = 'ws1';
            const email = 'test@example.com';
            const role = 'member';
            await tool.inviteUserToWorkspace(workspaceId, email, role);
            expect(service.inviteUser).toHaveBeenCalledWith(workspaceId, email, role);
        });
    });
    describe('removeUserFromWorkspace', () => {
        it('should call WorkspaceService.removeUser with the correct parameters', async () => {
            const workspaceId = 'ws1';
            const userId = 'user1';
            await tool.removeUserFromWorkspace(workspaceId, userId);
            expect(service.removeUser).toHaveBeenCalledWith(workspaceId, userId);
        });
    });
    describe('updateUserRoleInWorkspace', () => {
        it('should call WorkspaceService.updateUserRole with the correct parameters', async () => {
            const workspaceId = 'ws1';
            const userId = 'user1';
            const role = 'admin';
            await tool.updateUserRoleInWorkspace(workspaceId, userId, role);
            expect(service.updateUserRole).toHaveBeenCalledWith(workspaceId, userId, role);
        });
    });
});
//# sourceMappingURL=workspace-tool.test.js.map
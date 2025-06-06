import { WorkspaceService } from '../workspace-service';
import { TallyApiClient } from '../TallyApiClient';
import { TallyWorkspacesResponse, TallyWorkspace } from '../../models';

jest.mock('../TallyApiClient');
const MockedTallyApiClient = TallyApiClient as jest.MockedClass<typeof TallyApiClient>;

const mockWorkspacesResponse: TallyWorkspacesResponse = {
    workspaces: [
        { id: 'ws1', name: 'Workspace 1', slug: 'ws1', createdAt: '', updatedAt: '' },
    ],
    page: 1,
    limit: 50,
    hasMore: false,
};

const mockWorkspace: TallyWorkspace = {
    id: 'ws1', name: 'Workspace 1', slug: 'ws1', createdAt: '', updatedAt: ''
};

describe('WorkspaceService', () => {
    let service: WorkspaceService;
    let apiClient: jest.Mocked<TallyApiClient>;

    beforeEach(() => {
        MockedTallyApiClient.mockClear();
        MockedTallyApiClient.prototype.getWorkspaces = jest.fn().mockResolvedValue(mockWorkspacesResponse);
        MockedTallyApiClient.prototype.getWorkspace = jest.fn().mockResolvedValue(mockWorkspace);
        
        service = new WorkspaceService();
        apiClient = MockedTallyApiClient.mock.instances[0] as jest.Mocked<TallyApiClient>;
    });

    describe('getWorkspaces', () => {
        it('should call TallyApiClient.getWorkspaces and return the result', async () => {
            const options = { page: 2, limit: 10 };
            const result = await service.getWorkspaces(options);
            expect(apiClient.getWorkspaces).toHaveBeenCalledWith(options);
            expect(result).toEqual(mockWorkspacesResponse);
        });
    });

    describe('getWorkspace', () => {
        it('should call TallyApiClient.getWorkspace and return the result', async () => {
            const workspaceId = 'ws1';
            const result = await service.getWorkspace(workspaceId);
            expect(apiClient.getWorkspace).toHaveBeenCalledWith(workspaceId);
            expect(result).toEqual(mockWorkspace);
        });
    });

    describe('inviteUser', () => {
        it('should call TallyApiClient.inviteUserToWorkspace with the correct parameters', async () => {
            const workspaceId = 'ws1';
            const email = 'test@example.com';
            const role = 'member';
            await service.inviteUser(workspaceId, email, role);
            expect(apiClient.inviteUserToWorkspace).toHaveBeenCalledWith(workspaceId, email, role);
        });
    });

    describe('removeUser', () => {
        it('should call TallyApiClient.removeUserFromWorkspace with the correct parameters', async () => {
            const workspaceId = 'ws1';
            const userId = 'user1';
            await service.removeUser(workspaceId, userId);
            expect(apiClient.removeUserFromWorkspace).toHaveBeenCalledWith(workspaceId, userId);
        });
    });

    describe('updateUserRole', () => {
        it('should call TallyApiClient.updateUserRole with the correct parameters', async () => {
            const workspaceId = 'ws1';
            const userId = 'user1';
            const role = 'admin';
            await service.updateUserRole(workspaceId, userId, role);
            expect(apiClient.updateUserRole).toHaveBeenCalledWith(workspaceId, userId, role);
        });
    });
}); 
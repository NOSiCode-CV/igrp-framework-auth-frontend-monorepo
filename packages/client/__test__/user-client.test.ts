import { describe, it, expect, vi, beforeEach } from 'vitest';
import {UserClient} from "../src/client/user-client";
import {IGRPUserDTO} from "../src";
import {Status} from "../src/types"

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock('../src/client/base-client.ts', () => {
    return {
        BaseApiClient: class {
            get = mockGet;
            post = mockPost;
            put = mockPut;
            delete = mockDelete;
        }
    };
});

describe('UserClient', () => {
    let client: UserClient;
    const mockConfig = { baseUrl: 'https://api.example.com', timeout: 5000 };

    beforeEach(() => {
        client = new UserClient(mockConfig);
        vi.clearAllMocks();
    });

    it('should get users with filters', async () => {
        const mockResponse: IGRPUserDTO[] = [{ id: 1, name: 'John Doe', username: 'johndoe', email: 'john@example.com', status: Status.ACTIVE }];
        mockPost.mockResolvedValue(mockResponse);

        const filters = { name: 'John' };
        const result = await client.getUsers(filters);

        expect(mockPost).toHaveBeenCalledWith('/api/users/list', [], { params: filters});
        expect(result).toBe(mockResponse);
    });

    it('should get user by ID', async () => {
        const mockResponse = { id: 2, name: 'Jane Doe', username: 'janedoe', email: 'jane@example.com' };
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getUserById(2);

        expect(mockGet).toHaveBeenCalledWith('/api/users/2');
        expect(result).toBe(mockResponse);
    });

    it('should get current user', async () => {
        const mockResponse = { id: 3, name: 'Current User', username: 'current', email: 'current@example.com' };
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getCurrentUser();

        expect(mockGet).toHaveBeenCalledWith('/api/users/current');
        expect(result).toBe(mockResponse);
    });

    it('should create a new user', async () => {
        const mockResponse = { id: 4, name: 'New User', username: 'newuser', email: 'new@example.com', status: Status.ACTIVE };
        mockPost.mockResolvedValue(mockResponse);

        const newUser = { name: 'New User', username: 'newuser', email: 'new@example.com', status: Status.ACTIVE };
        const result = await client.createUser(newUser);

        expect(mockPost).toHaveBeenCalledWith('/api/users', newUser);
        expect(result).toBe(mockResponse);
    });

    it('should invite a new user', async () => {
        const mockResponse = { id: 4, name: 'New User', username: 'newuser', email: 'new@example.com' };
        mockPost.mockResolvedValue(mockResponse);

        const newUser = { name: 'New User', username: 'newuser', email: 'new@example.com', status: Status.ACTIVE };
        const result = await client.inviteUser(newUser);

        expect(mockPost).toHaveBeenCalledWith('/api/users/invite', newUser);
        expect(result).toBe(mockResponse);
    });

    it('should update a user', async () => {
        const mockResponse = { id: 4, name: 'Updated User', username: 'newuser', email: 'new@example.com' };
        mockPut.mockResolvedValue(mockResponse);

        const updateData = { name: 'Updated User' };
        const result = await client.updateUser(4, updateData);

        expect(mockPut).toHaveBeenCalledWith('/api/users/4', updateData);
        expect(result).toBe(mockResponse);
    });

    it('should get user roles', async () => {
        const mockResponse = [{ id: 1, name: 'Admin', departmentCode: 'HR' }];
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getUserRoles(1);

        expect(mockGet).toHaveBeenCalledWith('/api/users/1/roles');
        expect(result).toBe(mockResponse);
    });

    it('should add roles to a user', async () => {
        const mockResponse = { id: 1, name: 'Admin', departmentId: 1 };
        mockPost.mockResolvedValue(mockResponse);

        const result = await client.addRolesToUser(1, ['admin', 'editor']);

        expect(mockPost).toHaveBeenCalledWith(
            '/api/users/1/roles',
            ['admin', 'editor']
        );
        expect(result).toBe(mockResponse);
    });

    it('should handle errors when adding roles', async () => {
        const mockError = new Error('Failed to add roles');
        mockPost.mockRejectedValue(mockError);

        await expect(client.addRolesToUser(1, ['admin']))
            .rejects.toThrow('Failed to add roles');
    });

    it('should remove roles from a user', async () => {
        const mockResponse = { id: 1, name: 'Admin', departmentId: 1 };
        mockDelete.mockResolvedValue(mockResponse);

        const result = await client.removeRolesFromUser(1, ['editor']);

        expect(mockDelete).toHaveBeenCalledWith(
            '/api/users/1/roles',
            ['editor']
        );
        expect(result).toBe(mockResponse);
    });

    it('should handle errors when removing roles', async () => {
        const mockError = new Error('Failed to remove roles');
        mockDelete.mockRejectedValue(mockError);

        await expect(client.removeRolesFromUser(1, ['editor']))
            .rejects.toThrow('Failed to remove roles');
    });

    describe('updateCurrentUser', () => {
        it('should update the current authenticated user', async () => {
            const mockResponse = { id: 1, name: 'Updated User', username: 'current', email: 'current@example.com', status: Status.ACTIVE };
            mockPut.mockResolvedValue(mockResponse);

            const userData = { id: 1, name: 'Updated User', username: 'current', email: 'current@example.com', status: Status.ACTIVE } as IGRPUserDTO;
            const result = await client.updateCurrentUser(userData);

            expect(mockPut).toHaveBeenCalledWith('/api/users/me', userData);
            expect(result).toBe(mockResponse);
        });
    });

    describe('validateInvitationEmail', () => {
        it('should validate invitation email and send OTP', async () => {
            const mockResponse = { success: true, message: 'OTP sent' };
            mockPost.mockResolvedValue(mockResponse);

            const request = { email: 'invite@example.com', token: 'abc123' };
            const result = await client.validateInvitationEmail(request);

            expect(mockPost).toHaveBeenCalledWith('/api/users/invite/validate-email', request);
            expect(result).toBe(mockResponse);
        });
    });

    describe('validateInvitationOtp', () => {
        it('should validate invitation OTP code', async () => {
            const mockResponse = { success: true, message: 'OTP valid' };
            mockPost.mockResolvedValue(mockResponse);

            const request = { email: 'invite@example.com', otp: '123456', token: 'abc123' };
            const result = await client.validateInvitationOtp(request);

            expect(mockPost).toHaveBeenCalledWith('/api/users/invite/validate-otp', request);
            expect(result).toBe(mockResponse);
        });
    });

});
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

// UUIDs used across the test fixtures (Phase G2: user PK is String UUID).
const USER_ID_1 = '11111111-1111-1111-1111-111111111111';
const USER_ID_2 = '22222222-2222-2222-2222-222222222222';
const USER_ID_3 = '33333333-3333-3333-3333-333333333333';
const USER_ID_4 = '44444444-4444-4444-4444-444444444444';
const USER_ID_7 = '77777777-7777-7777-7777-777777777777';

describe('UserClient', () => {
    let client: UserClient;
    const mockConfig = { baseUrl: 'https://api.example.com', timeout: 5000 };

    beforeEach(() => {
        client = new UserClient(mockConfig);
        vi.clearAllMocks();
    });

    it('should get users with filters', async () => {
        const mockResponse: IGRPUserDTO[] = [{ id: USER_ID_1, name: 'John Doe', username: 'johndoe', email: 'john@example.com', status: Status.ACTIVE }];
        mockPost.mockResolvedValue(mockResponse);

        const filters = { name: 'John' };
        const result = await client.getUsers(filters);

        expect(mockPost).toHaveBeenCalledWith('/api/users/list', [], { params: filters});
        expect(result).toBe(mockResponse);
    });

    it('should get user by ID', async () => {
        const mockResponse = { id: USER_ID_2, name: 'Jane Doe', username: 'janedoe', email: 'jane@example.com' };
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getUser(USER_ID_2);

        expect(mockGet).toHaveBeenCalledWith(`/api/users/${USER_ID_2}`);
        expect(result).toBe(mockResponse);
    });

    it('should get current user', async () => {
        const mockResponse = { id: USER_ID_3, name: 'Current User', username: 'current', email: 'current@example.com' };
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getCurrentUser();

        expect(mockGet).toHaveBeenCalledWith('/api/users/me');
        expect(result).toBe(mockResponse);
    });

    it('should create a new user', async () => {
        const mockResponse = { id: USER_ID_4, name: 'New User', username: 'newuser', email: 'new@example.com', status: Status.ACTIVE };
        mockPost.mockResolvedValue(mockResponse);

        const newUser = { name: 'New User', email: 'new@example.com', status: Status.ACTIVE };
        const result = await client.createUser(newUser);

        expect(mockPost).toHaveBeenCalledWith('/api/users', newUser);
        expect(result).toBe(mockResponse);
    });

    it('should invite a new user', async () => {
        const mockResponse = { id: 4, email: 'new@example.com' };
        mockPost.mockResolvedValue(mockResponse);

        const newUser = { email: 'new@example.com', departmentCode: 'HR', roles: ['admin'] };
        const result = await client.inviteUser(newUser);

        expect(mockPost).toHaveBeenCalledWith('/api/users/invite', newUser);
        expect(result).toBe(mockResponse);
    });

    it('should update a user', async () => {
        const mockResponse = { id: USER_ID_4, name: 'Updated User', username: 'newuser', email: 'new@example.com' };
        mockPut.mockResolvedValue(mockResponse);

        const updateData = { id: USER_ID_4, name: 'Updated User', email: 'new@example.com', status: Status.ACTIVE } as IGRPUserDTO;
        const result = await client.updateUser(USER_ID_4, updateData);

        expect(mockPut).toHaveBeenCalledWith(`/api/users/${USER_ID_4}`, updateData);
        expect(result).toBe(mockResponse);
    });

    it('should get user roles', async () => {
        const mockResponse = [{ id: 1, name: 'Admin', departmentCode: 'HR' }];
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getUserRoles(USER_ID_1);

        expect(mockGet).toHaveBeenCalledWith(`/api/users/${USER_ID_1}/roles`);
        expect(result).toBe(mockResponse);
    });

    describe('updateCurrentUser', () => {
        it('should update the current authenticated user', async () => {
            const mockResponse = { id: USER_ID_1, name: 'Updated User', username: 'current', email: 'current@example.com', status: Status.ACTIVE };
            mockPut.mockResolvedValue(mockResponse);

            const userData = { id: USER_ID_1, name: 'Updated User', username: 'current', email: 'current@example.com', status: Status.ACTIVE } as IGRPUserDTO;
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

            const request = { token: 'abc123', otpCode: '123456' };
            const result = await client.validateInvitationOtp(request);

            expect(mockPost).toHaveBeenCalledWith('/api/users/invite/validate-otp', request);
            expect(result).toBe(mockResponse);
        });
    });

    describe('addRolesToUser (AddRolesToUserRequestDTO)', () => {
        it('should wrap a string[] of role codes into {roles} body', async () => {
            mockPost.mockResolvedValue({ id: 1 });

            await client.addRolesToUser(USER_ID_7, 'HR', ['admin', 'editor']);

            expect(mockPost).toHaveBeenCalledWith(
                `/api/users/${USER_ID_7}/departments/HR/roles`,
                { roles: ['admin', 'editor'] },
            );
        });

        it('should pass through an AddRolesToUserRequestDTO with expiresAt (temporary role)', async () => {
            mockPost.mockResolvedValue({ id: 1 });

            const request = { roles: ['viewer'], expiresAt: '2027-01-01T00:00:00' };
            await client.addRolesToUser(USER_ID_7, 'HR', request);

            expect(mockPost).toHaveBeenCalledWith(
                `/api/users/${USER_ID_7}/departments/HR/roles`,
                request,
            );
        });
    });

});

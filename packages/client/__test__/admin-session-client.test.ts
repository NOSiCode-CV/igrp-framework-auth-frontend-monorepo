import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminSessionClient } from '../src/client/admin-session-client';

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

describe('AdminSessionClient', () => {
    let client: AdminSessionClient;
    const mockConfig = { baseUrl: 'https://api.example.com', timeout: 5000 };

    beforeEach(() => {
        client = new AdminSessionClient(mockConfig);
        vi.clearAllMocks();
    });

    describe('listSessions', () => {
        it('should list sessions with filters', async () => {
            const mockResponse = { content: [{ id: 'session-1', userId: 'user-1', status: 'ACTIVE' }], totalElements: 1 };
            mockGet.mockResolvedValue(mockResponse);

            const filters = { status: 'ACTIVE', page: 0, size: 10 };
            const result = await client.listSessions(filters);

            expect(mockGet).toHaveBeenCalledWith('/api/admin/sessions', filters);
            expect(result).toBe(mockResponse);
        });

        it('should list sessions without filters', async () => {
            const mockResponse = { content: [], totalElements: 0 };
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.listSessions();

            expect(mockGet).toHaveBeenCalledWith('/api/admin/sessions', undefined);
            expect(result).toBe(mockResponse);
        });
    });

    describe('getUserSession', () => {
        it('should get the session for a specific user', async () => {
            const mockResponse = { id: 'session-1', userId: 'user-123', status: 'ACTIVE' };
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getUserSession('user-123');

            expect(mockGet).toHaveBeenCalledWith('/api/admin/sessions/users/user-123');
            expect(result).toBe(mockResponse);
        });

        it('should propagate errors when user session is not found', async () => {
            mockGet.mockRejectedValue(new Error('Not Found'));

            await expect(client.getUserSession('unknown-user')).rejects.toThrow('Not Found');
        });
    });

    describe('killSession', () => {
        it('should kill a specific session by ID', async () => {
            const mockResponse = {};
            mockPost.mockResolvedValue(mockResponse);

            const request = { reason: 'Administrative action' };
            const result = await client.killSession('session-1', request);

            expect(mockPost).toHaveBeenCalledWith('/api/admin/sessions/session-1/kill', request);
            expect(result).toBe(mockResponse);
        });
    });

    describe('listSessionsByRole', () => {
        it('should list sessions by role code with filters', async () => {
            const mockResponse = { content: [{ id: 'session-1', userId: 'user-1', status: 'ACTIVE' }], totalElements: 1 };
            mockGet.mockResolvedValue(mockResponse);

            const filters = { departmentCode: 'DEPT1', status: 'ACTIVE', page: 0, size: 20 };
            const result = await client.listSessionsByRole('ADMIN', filters);

            expect(mockGet).toHaveBeenCalledWith('/api/admin/sessions/roles/ADMIN', filters);
            expect(result).toBe(mockResponse);
        });

        it('should list sessions by role code without filters', async () => {
            const mockResponse = { content: [], totalElements: 0 };
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.listSessionsByRole('ADMIN');

            expect(mockGet).toHaveBeenCalledWith('/api/admin/sessions/roles/ADMIN', undefined);
            expect(result).toBe(mockResponse);
        });
    });

    describe('killSessionsByRole', () => {
        it('should kill sessions by role without department filter', async () => {
            const mockResponse = {};
            mockPost.mockResolvedValue(mockResponse);

            const request = { reason: 'Role revoked' };
            const result = await client.killSessionsByRole('ADMIN', request);

            expect(mockPost).toHaveBeenCalledWith('/api/admin/sessions/roles/ADMIN/kill', request);
            expect(result).toBe(mockResponse);
        });

        it('should kill sessions by role with department filter', async () => {
            const mockResponse = {};
            mockPost.mockResolvedValue(mockResponse);

            const request = { reason: 'Department restructuring' };
            const result = await client.killSessionsByRole('ADMIN', request, 'DEPT1');

            expect(mockPost).toHaveBeenCalledWith('/api/admin/sessions/roles/ADMIN/kill?departmentCode=DEPT1', request);
            expect(result).toBe(mockResponse);
        });
    });

    describe('killSessionsByDepartment', () => {
        it('should kill all sessions for a specific department', async () => {
            const mockResponse = {};
            mockPost.mockResolvedValue(mockResponse);

            const request = { reason: 'Department deactivated' };
            const result = await client.killSessionsByDepartment('DEPT1', request);

            expect(mockPost).toHaveBeenCalledWith('/api/admin/sessions/departments/DEPT1/kill', request);
            expect(result).toBe(mockResponse);
        });
    });

    describe('getSessionStatistics', () => {
        it('should get session statistics', async () => {
            const mockResponse = { activeSessions: 42, totalSessions: 100 };
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getSessionStatistics();

            expect(mockGet).toHaveBeenCalledWith('/api/admin/sessions/statistics');
            expect(result).toBe(mockResponse);
        });
    });
});

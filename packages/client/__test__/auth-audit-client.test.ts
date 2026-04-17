import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthAuditClient } from '../src/client/auth-audit-client';

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

describe('AuthAuditClient', () => {
    let client: AuthAuditClient;
    const mockConfig = { baseUrl: 'https://api.example.com', timeout: 5000 };

    beforeEach(() => {
        client = new AuthAuditClient(mockConfig);
        vi.clearAllMocks();
    });

    describe('listAuditLogs', () => {
        it('should list audit logs with pagination filters', async () => {
            const mockResponse = {
                content: [{ id: 1, action: 'LOGIN', userId: 'user-1', timestamp: '2026-01-01T00:00:00Z' }],
                totalElements: 1
            };
            mockGet.mockResolvedValue(mockResponse);

            const filters = { page: 0, size: 20, action: 'LOGIN' };
            const result = await client.listAuditLogs(filters);

            expect(mockGet).toHaveBeenCalledWith('/api/auth/audit', filters);
            expect(result).toBe(mockResponse);
        });

        it('should list audit logs without filters', async () => {
            const mockResponse = { content: [], totalElements: 0 };
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.listAuditLogs();

            expect(mockGet).toHaveBeenCalledWith('/api/auth/audit', undefined);
            expect(result).toBe(mockResponse);
        });

        it('should propagate errors when listing audit logs fails', async () => {
            mockGet.mockRejectedValue(new Error('Forbidden'));

            await expect(client.listAuditLogs()).rejects.toThrow('Forbidden');
        });
    });

    describe('getAuditLogById', () => {
        it('should get a specific audit log by ID', async () => {
            const mockResponse = { id: 42, action: 'LOGIN', userId: 'user-1', timestamp: '2026-01-01T00:00:00Z' };
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getAuditLogById(42);

            expect(mockGet).toHaveBeenCalledWith('/api/auth/audit/42');
            expect(result).toBe(mockResponse);
        });

        it('should propagate errors when audit log is not found', async () => {
            mockGet.mockRejectedValue(new Error('Not Found'));

            await expect(client.getAuditLogById(999)).rejects.toThrow('Not Found');
        });
    });

    describe('getAuditLogsByUserId', () => {
        it('should get audit logs for a specific user with filters', async () => {
            const mockResponse = {
                content: [{ id: 1, action: 'LOGIN', userId: 'user-123', timestamp: '2026-01-01T00:00:00Z' }],
                totalElements: 1
            };
            mockGet.mockResolvedValue(mockResponse);

            const filters = { page: 0, size: 10 };
            const result = await client.getAuditLogsByUserId('user-123', filters);

            expect(mockGet).toHaveBeenCalledWith('/api/auth/audit/user/user-123', filters);
            expect(result).toBe(mockResponse);
        });

        it('should get audit logs for a specific user without filters', async () => {
            const mockResponse = { content: [], totalElements: 0 };
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getAuditLogsByUserId('user-123');

            expect(mockGet).toHaveBeenCalledWith('/api/auth/audit/user/user-123', undefined);
            expect(result).toBe(mockResponse);
        });
    });
});

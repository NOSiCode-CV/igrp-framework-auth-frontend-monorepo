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
        it('should list audit logs with filters', async () => {
            const mockResponse = {
                content: [{ id: 'uuid-1', eventType: 'LOGIN_SUCCESS', userId: 'user-1', timestamp: '2026-01-01T00:00:00Z' }],
                totalElements: 1
            };
            mockGet.mockResolvedValue(mockResponse);

            const filters = { page: 0, size: 20, eventType: 'LOGIN_SUCCESS' };
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

    describe('validate', () => {
        it('should POST to the validate endpoint and return the chain result', async () => {
            const mockResponse = { valid: false, rows_checked: 42, broken_at: 7 };
            mockPost.mockResolvedValue(mockResponse);

            const result = await client.validate();

            expect(mockPost).toHaveBeenCalledWith('/api/auth/audit/validate', undefined, { params: undefined });
            expect(result).toBe(mockResponse);
        });
    });

    describe('purge', () => {
        it('should DELETE the purge endpoint and return the removed count', async () => {
            const mockResponse = { purged: 128 };
            mockDelete.mockResolvedValue(mockResponse);

            const result = await client.purge();

            expect(mockDelete).toHaveBeenCalledWith('/api/auth/audit/purge', undefined, { params: undefined });
            expect(result).toBe(mockResponse);
        });
    });
});

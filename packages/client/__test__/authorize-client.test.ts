import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthorizeClient } from '../src';

const mockPost = vi.fn();

vi.mock('../src/client/base-client.ts', () => {
    return {
        BaseApiClient: class {
            post = mockPost;
        }
    };
});

describe('AuthorizeClient', () => {
    let client: AuthorizeClient;
    const mockConfig = { baseUrl: 'https://api.example.com', timeout: 5000 };

    beforeEach(() => {
        client = new AuthorizeClient(mockConfig);
        vi.clearAllMocks();
    });

    describe('checkAuthorization', () => {
        it('should check authorization for a single request', async () => {
            const mockRequest = { resource: 'document', action: 'read' };
            const mockResponse = {
                allowed: true,
                via_roles: ['admin'],
                cache_hit: false,
                resolution_time_ms: 10
            };
            mockPost.mockResolvedValue(mockResponse);

            const result = await client.checkAuthorization(mockRequest);

            expect(mockPost).toHaveBeenCalledWith(
                '/api/authorize/check',
                mockRequest
            );
            expect(result).toBe(mockResponse);
        });

        it('should handle authorization check errors', async () => {
            const mockRequest = { resource: 'document', action: 'read' };
            const mockError = new Error('Authorization check failed');
            mockPost.mockRejectedValue(mockError);

            await expect(client.checkAuthorization(mockRequest))
                .rejects.toThrow('Authorization check failed');
        });
    });

    describe('batchCheckAuthorization', () => {
        it('should check authorization for multiple requests', async () => {
            const mockRequests = [
                { resource: 'document', action: 'read' },
                { resource: 'document', action: 'write' }
            ];
            const mockResponse = {
                allowed: true,
                via_roles: ['admin'],
                cache_hit: true,
                resolution_time_ms: 5
            };
            mockPost.mockResolvedValue(mockResponse);

            const result = await client.batchCheckAuthorization(mockRequests);

            expect(mockPost).toHaveBeenCalledWith(
                '/api/authorize/batch-check',
                mockRequests
            );
            expect(result).toBe(mockResponse);
        });

        it('should handle batch authorization check errors', async () => {
            const mockRequests = [
                { resource: 'document', action: 'read' }
            ];
            const mockError = new Error('Batch authorization check failed');
            mockPost.mockRejectedValue(mockError);

            await expect(client.batchCheckAuthorization(mockRequests))
                .rejects.toThrow('Batch authorization check failed');
        });
    });
});
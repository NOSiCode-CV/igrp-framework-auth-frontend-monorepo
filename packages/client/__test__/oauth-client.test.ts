import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OAuthClient } from '../src/client/oauth-client';

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

describe('OAuthClient', () => {
    let client: OAuthClient;
    const mockConfig = { baseUrl: 'https://api.example.com', timeout: 5000 };
    const id = '3f1d2c4e-0000-4000-8000-000000000001';

    beforeEach(() => {
        client = new OAuthClient(mockConfig);
        vi.clearAllMocks();
    });

    describe('rotateOAuthClientSecret', () => {
        it('should POST to the rotate-secret endpoint', async () => {
            const mockResponse = { id, clientId: 'acme', clientSecret: 'new-raw-secret' };
            mockPost.mockResolvedValue(mockResponse);

            const result = await client.rotateOAuthClientSecret(id);

            expect(mockPost).toHaveBeenCalledWith(`/api/clients/${id}/rotate-secret`);
            expect(result).toBe(mockResponse);
        });

        it('should surface the new raw secret and preserve identity', async () => {
            // Rotation must keep id/clientId — that is what distinguishes it
            // from the delete-and-recreate workaround it replaces.
            const mockResponse = { id, clientId: 'acme', clientSecret: 'new-raw-secret' };
            mockPost.mockResolvedValue(mockResponse);

            const result: any = await client.rotateOAuthClientSecret(id);

            expect(result.clientSecret).toBe('new-raw-secret');
            expect(result.id).toBe(id);
            expect(result.clientId).toBe('acme');
        });

        it('should not send a request body', async () => {
            mockPost.mockResolvedValue({});

            await client.rotateOAuthClientSecret(id);

            expect(mockPost).toHaveBeenCalledTimes(1);
            expect(mockPost.mock.calls[0]).toHaveLength(1);
        });
    });

    describe('createOAuthClient', () => {
        it('should POST to /api/clients with the request body', async () => {
            const request: any = { clientId: 'acme', clientName: 'Acme' };
            const mockResponse = { id, clientId: 'acme', clientSecret: 'raw' };
            mockPost.mockResolvedValue(mockResponse);

            const result = await client.createOAuthClient(request);

            expect(mockPost).toHaveBeenCalledWith('/api/clients', request);
            expect(result).toBe(mockResponse);
        });
    });
});

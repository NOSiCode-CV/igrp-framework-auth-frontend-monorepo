import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionClient } from '../src/client/session-client';

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

describe('SessionClient', () => {
    let client: SessionClient;
    const mockConfig = { baseUrl: 'https://api.example.com', timeout: 5000 };

    beforeEach(() => {
        client = new SessionClient(mockConfig);
        vi.clearAllMocks();
    });

    describe('getCurrentSession', () => {
        it('should get the current active session', async () => {
            const mockResponse = { id: 'session-1', userId: 'user-1', status: 'ACTIVE' };
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getCurrentSession();

            expect(mockGet).toHaveBeenCalledWith('/api/session');
            expect(result).toBe(mockResponse);
        });

        it('should propagate errors when getting current session fails', async () => {
            mockGet.mockRejectedValue(new Error('Unauthorized'));

            await expect(client.getCurrentSession()).rejects.toThrow('Unauthorized');
        });
    });

    describe('initializeSession', () => {
        it('should initialize a new session with request data', async () => {
            const mockResponse = { id: 'session-2', userId: 'user-1', status: 'ACTIVE' };
            mockPost.mockResolvedValue(mockResponse);

            const request = { applicationCode: 'APP1', organizationCode: 'ORG1' };
            const result = await client.initializeSession(request);

            expect(mockPost).toHaveBeenCalledWith('/api/session/init', request);
            expect(result).toBe(mockResponse);
        });
    });

    describe('refreshSession', () => {
        it('should refresh the current session with request data', async () => {
            const mockResponse = { id: 'session-1', userId: 'user-1', status: 'ACTIVE' };
            mockPost.mockResolvedValue(mockResponse);

            const request = { extendDuration: true };
            const result = await client.refreshSession(request);

            expect(mockPost).toHaveBeenCalledWith('/api/session/refresh', request);
            expect(result).toBe(mockResponse);
        });

        it('should refresh the current session without request data', async () => {
            const mockResponse = { id: 'session-1', userId: 'user-1', status: 'ACTIVE' };
            mockPost.mockResolvedValue(mockResponse);

            const result = await client.refreshSession();

            expect(mockPost).toHaveBeenCalledWith('/api/session/refresh', undefined);
            expect(result).toBe(mockResponse);
        });
    });

    describe('closeSession', () => {
        it('should close the current active session', async () => {
            const mockResponse = {};
            mockPost.mockResolvedValue(mockResponse);

            const result = await client.closeSession();

            expect(mockPost).toHaveBeenCalledWith('/api/session/close');
            expect(result).toBe(mockResponse);
        });
    });

    describe('rotateSession', () => {
        it('should rotate the current session with new init request', async () => {
            const mockResponse = { id: 'session-3', userId: 'user-1', status: 'ACTIVE' };
            mockPost.mockResolvedValue(mockResponse);

            const request = { applicationCode: 'APP2', organizationCode: 'ORG1' };
            const result = await client.rotateSession(request);

            expect(mockPost).toHaveBeenCalledWith('/api/session/rotate', request);
            expect(result).toBe(mockResponse);
        });
    });
});

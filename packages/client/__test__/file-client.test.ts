// file-client.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileClient } from '../src';

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock('../src/client/base-client.ts', () => {
    return {
        BaseApiClient: class {
            get = mockGet;
            post = mockPost;
        }
    };
});

describe('FileClient', () => {
    let client: FileClient;
    const mockConfig = { baseUrl: 'https://api.example.com', timeout: 5000 };

    beforeEach(() => {
        client = new FileClient(mockConfig);
        vi.clearAllMocks();
    });

    describe('uploadPublicFile', () => {
        it('should upload a public file', async () => {
            const mockFile = new File(['content'], 'test.txt');
            const mockResponse = 'file-id-123';
            mockPost.mockResolvedValue(mockResponse);

            const result = await client.uploadPublicFile(mockFile, { folder: 'uploads' });

            expect(mockPost).toHaveBeenCalledWith(
                '/api/files/public',
                expect.any(FormData),
                {
                    params: { folder: 'uploads' },
                }
            );
            expect(result).toBe(mockResponse);
        });
    });

    describe('uploadPrivateFile', () => {
        it('should upload a private file', async () => {
            const mockFile = new File(['content'], 'test.txt');
            const mockResponse = 'file-id-456';
            mockPost.mockResolvedValue(mockResponse);

            const result = await client.uploadPrivateFile(mockFile, { folder: 'private' });

            expect(mockPost).toHaveBeenCalledWith(
                '/api/files/private',
                expect.any(FormData),
                {
                    params: { folder: 'private' },
                }
            );
            expect(result).toBe(mockResponse);
        });
    });

    describe('getFileUrl', () => {
        it('should get a file URL', async () => {
            const mockResponse = {
                url: 'https://example.com/file',
                expiration: new Date()
            };
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getFileUrl('path/to/file');

            expect(mockGet).toHaveBeenCalledWith('/api/files/url', {
                privateFilePath: 'path/to/file'
            });
            expect(result).toBe(mockResponse);
        });
    });
});
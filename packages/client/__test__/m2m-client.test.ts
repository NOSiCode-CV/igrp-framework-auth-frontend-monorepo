import { describe, it, expect, vi, beforeEach } from 'vitest';
import { M2MClient } from '../src/client/m2m-client';
import type { MenuEntryDTO } from '../src/types';

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
        },
    };
});

describe('M2MClient', () => {
    let client: M2MClient;
    const mockConfig = { baseUrl: 'https://api.example.com', timeout: 5000 };

    beforeEach(() => {
        client = new M2MClient(mockConfig);
        vi.clearAllMocks();
    });

    describe('syncApplicationMenus', () => {
        const menus: MenuEntryDTO[] = [
            { id: 1, code: 'M1', name: 'Menu 1' } as unknown as MenuEntryDTO,
        ];

        it('should POST to /api/m2m/sync/applications/{code}/menus without query params when syncRoles is not provided', async () => {
            mockPost.mockResolvedValue('');

            await client.syncApplicationMenus('APP1', menus);

            expect(mockPost).toHaveBeenCalledWith(
                '/api/m2m/sync/applications/APP1/menus',
                menus,
                { params: undefined, headers: expect.any(Object) },
            );
        });

        it('should pass syncRoles=false as query param when syncRoles=false', async () => {
            mockPost.mockResolvedValue('');

            await client.syncApplicationMenus('APP1', menus, false);

            expect(mockPost).toHaveBeenCalledWith(
                '/api/m2m/sync/applications/APP1/menus',
                menus,
                { params: { syncRoles: false }, headers: expect.any(Object) },
            );
        });

        it('should pass syncRoles=true as query param when syncRoles=true', async () => {
            mockPost.mockResolvedValue('');

            await client.syncApplicationMenus('APP1', menus, true);

            expect(mockPost).toHaveBeenCalledWith(
                '/api/m2m/sync/applications/APP1/menus',
                menus,
                { params: { syncRoles: true }, headers: expect.any(Object) },
            );
        });
    });
});

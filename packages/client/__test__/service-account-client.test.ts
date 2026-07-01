import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceAccountClient } from '../src/client/service-account-client';
import type { ServiceAccountDTO, ServiceAccountRequestDTO } from '../src';

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

describe('ServiceAccountClient', () => {
    let client: ServiceAccountClient;
    const mockConfig = { baseUrl: 'https://api.example.com', timeout: 5000 };

    const sampleAccount: ServiceAccountDTO = {
        id: 'sa-uuid-1',
        name: 'Nightly Invoice ETL',
        description: 'Batch job that syncs invoices at 02:00',
        active: true,
        oauthClientId: 'oc-uuid-1',
        clientId: 'etl-runner-m2m',
        applicationId: 42,
        applicationCode: 'INV',
        roleIds: [10, 11],
        roleCodes: ['INV.invoice.reader', 'INV.invoice.exporter'],
        permissionIds: [201, 202],
        permissionNames: ['my.invoice.approve', 'my.invoice.delete'],
        createdAt: '2026-06-25T12:00:00Z',
        updatedAt: '2026-06-25T12:00:00Z',
    };

    beforeEach(() => {
        client = new ServiceAccountClient(mockConfig);
        vi.clearAllMocks();
    });

    it('lists all service accounts and returns the raw response', async () => {
        const mockResponse = [sampleAccount];
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.listServiceAccounts();

        expect(mockGet).toHaveBeenCalledWith('/api/service-accounts');
        expect(mockGet).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockResponse);
    });

    it('fetches a single service account by id', async () => {
        mockGet.mockResolvedValue(sampleAccount);

        const result = await client.getServiceAccount('sa-uuid-1');

        expect(mockGet).toHaveBeenCalledWith('/api/service-accounts/sa-uuid-1');
        expect(result).toBe(sampleAccount);
    });

    it('encodes the id verbatim into the get URL (backend owns URL-safety)', async () => {
        mockGet.mockResolvedValue(sampleAccount);

        await client.getServiceAccount('sa/with/slashes');

        // Behaviour is intentional: the current base client doesn't URL-encode
        // path segments. Locking the test lets a future encoding change be
        // seen as a breaking one.
        expect(mockGet).toHaveBeenCalledWith('/api/service-accounts/sa/with/slashes');
    });

    it('creates a service account with the request body verbatim', async () => {
        mockPost.mockResolvedValue(sampleAccount);

        const request: ServiceAccountRequestDTO = {
            name: 'Nightly Invoice ETL',
            description: 'Batch job that syncs invoices at 02:00',
            active: true,
            oauthClientId: 'oc-uuid-1',
            applicationId: 42,
            roleIds: [10, 11],
            permissionIds: [201, 202],
        };

        const result = await client.createServiceAccount(request);

        expect(mockPost).toHaveBeenCalledWith('/api/service-accounts', request);
        expect(result).toBe(sampleAccount);
    });

    it('updates a service account with the full replacement body (roleIds + permissionIds)', async () => {
        const updated: ServiceAccountDTO = {
            ...sampleAccount,
            roleIds: [11],           // dropped 10
            roleCodes: ['INV.invoice.exporter'],
            permissionIds: [],       // dropped both direct grants
            permissionNames: [],
        };
        mockPut.mockResolvedValue(updated);

        const request: ServiceAccountRequestDTO = {
            name: sampleAccount.name,
            description: sampleAccount.description,
            active: sampleAccount.active,
            oauthClientId: sampleAccount.oauthClientId,
            applicationId: sampleAccount.applicationId,
            roleIds: [11],
            permissionIds: [],
        };

        const result = await client.updateServiceAccount('sa-uuid-1', request);

        expect(mockPut).toHaveBeenCalledWith('/api/service-accounts/sa-uuid-1', request);
        expect(result).toBe(updated);
    });

    it('deletes a service account by id (returns whatever the base client returns)', async () => {
        mockDelete.mockResolvedValue(undefined);

        const result = await client.deleteServiceAccount('sa-uuid-1');

        expect(mockDelete).toHaveBeenCalledWith('/api/service-accounts/sa-uuid-1');
        expect(result).toBeUndefined();
    });

    it('propagates errors from listServiceAccounts unchanged', async () => {
        const err = new Error('network');
        mockGet.mockRejectedValue(err);

        await expect(client.listServiceAccounts()).rejects.toThrow('network');
    });

    it('propagates errors from createServiceAccount unchanged (e.g. duplicate name → 409)', async () => {
        const err = Object.assign(new Error('duplicate'), { status: 409 });
        mockPost.mockRejectedValue(err);

        await expect(
            client.createServiceAccount({
                name: 'dup',
                oauthClientId: 'oc-uuid-1',
            } as ServiceAccountRequestDTO),
        ).rejects.toMatchObject({ message: 'duplicate', status: 409 });
    });

    it('propagates errors from deleteServiceAccount unchanged (e.g. 404)', async () => {
        mockDelete.mockRejectedValue(new Error('not found'));

        await expect(client.deleteServiceAccount('does-not-exist'))
            .rejects.toThrow('not found');
    });

    it('sends only the fields present on the request (omits undefined optionals)', async () => {
        mockPost.mockResolvedValue(sampleAccount);

        const minimal: ServiceAccountRequestDTO = {
            name: 'Minimal Account',
            oauthClientId: 'oc-uuid-1',
        };

        await client.createServiceAccount(minimal);

        // The client forwards the request object as-is; no client-side
        // synthesis of default values (backend owns defaults).
        expect(mockPost).toHaveBeenCalledWith('/api/service-accounts', minimal);
        const [, sentBody] = mockPost.mock.calls[0];
        expect(sentBody).not.toHaveProperty('applicationId');
        expect(sentBody).not.toHaveProperty('roleIds');
        expect(sentBody).not.toHaveProperty('permissionIds');
    });
});

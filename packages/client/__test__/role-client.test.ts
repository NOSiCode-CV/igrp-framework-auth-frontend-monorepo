import { describe, it, expect, vi, beforeEach } from 'vitest';
import {RoleClient} from "../src/client/role-client";
import {UpdateRoleRequest} from "../src";

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

describe('RoleClient', () => {
    let client: RoleClient;
    const mockConfig = { baseUrl: 'https://api.example.com', timeout: 5000 };

    beforeEach(() => {
        client = new RoleClient(mockConfig);
        vi.clearAllMocks();
    });

    it('should get all roles with filters', async () => {
        const mockResponse = [{ id: 1, code: 'Admin', departmentCode: 'DEPT' }];
        mockGet.mockResolvedValue(mockResponse);

        const filters = { departmentCode: "DEPT" };
        const result = await client.getRoles(filters);

        expect(mockGet).toHaveBeenCalledWith('/api/roles', filters);
        expect(result).toBe(mockResponse);
    });

    it('should get role by ID', async () => {
        const mockResponse = { id: 2, code: 'Editor', departmentId: 1 };
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getRoleById(2);

        expect(mockGet).toHaveBeenCalledWith('/api/roles/2');
        expect(result).toBe(mockResponse);
    });

    it('should get role by code', async () => {
        const mockResponse = { id: 2, code: 'editor', departmentId: 1 };
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getRoleByCode("editor");

        expect(mockGet).toHaveBeenCalledWith('/api/roles/by-code/editor');
        expect(result).toBe(mockResponse);
    });

    it('should create a new role', async () => {
        const mockResponse = { id: 3, code: 'Viewer', departmentCode: 'HR' };
        mockPost.mockResolvedValue(mockResponse);

        const newRole = { code: 'Viewer', departmentCode: 'HR' };
        const result = await client.createRole(newRole);

        expect(mockPost).toHaveBeenCalledWith('/api/roles', newRole);
        expect(result).toBe(mockResponse);
    });

    it('should update a role', async () => {
        const mockResponse = { id: 3, code: 'admin', description: 'Updated Role' };
        mockPut.mockResolvedValue(mockResponse);

        const updateData: UpdateRoleRequest = { description: 'Updated Role' };
        const result = await client.updateRole('admin', updateData);

        expect(mockPut).toHaveBeenCalledWith('/api/roles/admin', updateData);
        expect(result).toBe(mockResponse);
    });

    it('should delete a role', async () => {
        const mockResponse = true;
        mockDelete.mockResolvedValue(mockResponse);

        const result = await client.deleteRole('admin');

        expect(mockDelete).toHaveBeenCalledWith('/api/roles/admin');
        expect(result).toBe(mockResponse);
    });

    it('should get permissions by role code', async () => {
        const mockResponse = [{ id: 1, code: 'read', applicationId: 1 }];
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getPermissionsByRoleCode('read');

        expect(mockGet).toHaveBeenCalledWith('/api/roles/read/permissions');
        expect(result).toBe(mockResponse);
    });

    it('should add permission to a role', async () => {
        const mockResponse = [{ id: 1, code: 'read', applicationId: 1 }];
        mockPost.mockResolvedValue(mockResponse);

        const newRole = { code: 'Viewer', departmentCode: 'HR' };
        const result = await client.createRole(newRole);

        expect(mockPost).toHaveBeenCalledWith('/api/roles', newRole);
        expect(result).toBe(mockResponse);
    });

    it('should add permissions to a role', async () => {
        const mockResponse = { id: 3, code: 'admin', description: 'Updated Role', permissions: ['read', 'write'] };
        mockPost.mockResolvedValue(mockResponse);

        const result = await client.addPermissionsToRole('admin', ['read', 'write']);

        expect(mockPost).toHaveBeenCalledWith(
            '/api/roles/admin/permissions',
            ['read', 'write']
        );
        expect(result).toBe(mockResponse);
    });

    it('should handle errors when adding permissions', async () => {
        const mockError = new Error('Failed to add permissions');
        mockPost.mockRejectedValue(mockError);

        await expect(client.addPermissionsToRole('admin', ['read']))
            .rejects.toThrow('Failed to add permissions');
    });

    it('should remove permissions from a role', async () => {
        const mockResponse = { id: 3, code: 'admin', description: 'Updated Role', permissions: ['read'] };
        mockDelete.mockResolvedValue(mockResponse);

        const result = await client.removePermissionsFromRole('admin', ['write']);

        expect(mockDelete).toHaveBeenCalledWith(
            '/api/roles/admin/permissions',
            ['write']
        );
        expect(result).toBe(mockResponse);
    });

    it('should handle errors when removing permissions', async () => {
        const mockError = new Error('Failed to remove permissions');
        mockDelete.mockRejectedValue(mockError);

        await expect(client.removePermissionsFromRole('admin', ['write']))
            .rejects.toThrow('Failed to remove permissions');
    });

    it('should get available permissions', async () => {
        const mockResponse = [{ id: 1, name: 'read', departmentCode: 'DEPT' }];
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getAvailablePermissions('admin');

        expect(mockGet).toHaveBeenCalledWith('/api/roles/admin/permissions/available');
        expect(result).toBe(mockResponse);
    })

});
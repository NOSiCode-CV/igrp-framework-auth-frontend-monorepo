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


    // Removed: tests for getRoles / createRole / updateRole / deleteRole /
    // getPermissionsByRoleCode / addPermissionsToRole / removePermissionsFromRole /
    // getAvailablePermissions.
    //
    // They described a flat `/api/roles` CRUD surface that exists on neither
    // side of the contract. RolesController serves exactly two endpoints —
    // `roles/{id}` and `roles/by-code/{code}` — which are the two covered above.
    //
    // Roles ARE managed, but they are department-scoped, because a role code is
    // only unique within a department. That surface lives on DepartmentClient
    // (updateRole, deleteRole, getPermissionsByRole, ...) against
    // `departments/{departmentCode}/roles/...`, and is tested there.
});

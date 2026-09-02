import { describe, it, expect, vi, beforeEach } from 'vitest';
import {DepartmentClient} from "../src/client/department-client";

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

describe('DepartmentClient', () => {
    let client: DepartmentClient;
    const mockConfig = { baseUrl: 'https://api.example.com', timeout: 5000 };

    beforeEach(() => {
        client = new DepartmentClient(mockConfig);
        vi.clearAllMocks();
    });

    it('should get all departments', async () => {
        const mockResponse = [{ id: 1, code: 'DEPT1', name: 'Department 1', application_id: 1 }];
        mockGet.mockResolvedValue(mockResponse);

        const filters = { code: 'DEPT1' };
        const result = await client.getDepartments(filters);

        expect(mockGet).toHaveBeenCalledWith('/api/departments', filters);
        expect(result).toBe(mockResponse);
    });

    it('should get department by ID', async () => {
        const mockResponse = { id: 2, code: 'DEPT2', name: 'Department 2', application_id: 1 };
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getDepartmentById(2);

        expect(mockGet).toHaveBeenCalledWith('/api/departments/2');
        expect(result).toBe(mockResponse);
    });

    it('should get department by code', async () => {
        const mockResponse = { id: 2, code: 'DEPT2', name: 'Department 2', application_id: 1 };
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getDepartmentByCode("DEPT2");

        expect(mockGet).toHaveBeenCalledWith('/api/departments/by-code/DEPT2');
        expect(result).toBe(mockResponse);
    });

    it('should create a new department', async () => {
        const mockResponse = { id: 3, code: 'DEPT3', name: 'New Department', application_id: 1 };
        mockPost.mockResolvedValue(mockResponse);

        const newDept = { code: 'DEPT3', name: 'New Department', application_id: 1 };
        const result = await client.createDepartment(newDept);

        expect(mockPost).toHaveBeenCalledWith('/api/departments', newDept);
        expect(result).toBe(mockResponse);
    });

    it('should update a department', async () => {
        const mockResponse = { id: 3, code: 'DEPT3', name: 'Updated Department', application_id: 1 };
        mockPut.mockResolvedValue(mockResponse);

        const updateData = { name: 'Updated Department' };
        const result = await client.updateDepartment('DEPT3', updateData);

        expect(mockPut).toHaveBeenCalledWith('/api/departments/DEPT3', updateData);
        expect(result).toBe(mockResponse);
    });

    it('should delete a department', async () => {
        const mockResponse = {};
        mockDelete.mockResolvedValue(mockResponse);

        const result = await client.deleteDepartment('DEPT3');

        expect(mockDelete).toHaveBeenCalledWith('/api/departments/DEPT3');
        expect(result).toBe(mockResponse);
    });

    it('should get available applications for department', async () => {
        const mockResponse = [{ id: 1, code: 'APP_1', departments: ['DEPT1'] }, { id: 2, code: 'APP_2', departments: ['DEPT1'] }];
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getAvailableApplications('DEPT1');

        expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/applications/available');
        expect(result).toBe(mockResponse);
    })

    it('should get available menus for department', async () => {
        const mockResponse = [{ id: 1, code: 'MENU_1', departments: ['DEPT1'] }, { id: 2, code: 'MENU_2', departments: ['DEPT1'] }];
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getAvailableMenus('DEPT1');

        expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/menus/available');
        expect(result).toBe(mockResponse);
    })

    it('should get available resources for department', async () => {
        const mockResponse = [{ id: 1, name: 'RES_1', departments: ['DEPT1'] }, { id: 2, name: 'RES_2', departments: ['DEPT1'] }];
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getAvailableResources('DEPT1');

        expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/resources/available');
        expect(result).toBe(mockResponse);
    })

    it('should add menus to department', async () => {

        const mockResponse = ""
        mockPost.mockResolvedValue(mockResponse);

        const menuCodes = ["MENU_1", "MENU_2"]
        const result = await client.addMenusToDepartment("DEPT", menuCodes);

        expect(mockPost).toHaveBeenCalledWith('/api/departments/DEPT/menus', menuCodes)
        expect(result).toBe(mockResponse)
    })

    it('should add applications to department', async () => {

        const mockResponse = ""
        mockPost.mockResolvedValue(mockResponse);

        const appCodes = ["APP_1", "APP_2"]
        const result = await client.addApplicationsToDepartment("DEPT", appCodes);

        expect(mockPost).toHaveBeenCalledWith('/api/departments/DEPT/applications', appCodes)
        expect(result).toBe(mockResponse)
    })

    it('should remove menus from department', async () => {

        const mockResponse = ""
        mockDelete.mockResolvedValue(mockResponse);

        const menuCodes = ["MENU_1", "MENU_2"]
        const result = await client.removeMenusFromDepartment("DEPT", menuCodes);

        expect(mockDelete).toHaveBeenCalledWith('/api/departments/DEPT/menus', menuCodes)
        expect(result).toBe(mockResponse)
    })

    it('should remove applications from department', async () => {

        const mockResponse = ""
        mockPost.mockResolvedValue(mockResponse);

        const appCodes = ["APP_1", "APP_2"]
        const result = await client.removeApplicationsFromDepartment("DEPT", appCodes);

        expect(mockDelete).toHaveBeenCalledWith('/api/departments/DEPT/applications', appCodes)
        expect(result).toBe(mockResponse)
    })

    describe('getDepartmentApplicationsFiltered', () => {
        it('should get department applications with filter', async () => {
            const mockResponse = [{ id: 1, code: 'APP1', name: 'App 1' }];
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getDepartmentApplicationsFiltered('DEPT1', 'APP1');

            expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/applications', { applicationCode: 'APP1' });
            expect(result).toBe(mockResponse);
        });

        it('should get department applications without filter', async () => {
            const mockResponse = [{ id: 1, code: 'APP1', name: 'App 1' }];
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getDepartmentApplicationsFiltered('DEPT1');

            expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/applications', undefined);
            expect(result).toBe(mockResponse);
        });
    });

    describe('getDepartmentMenusFiltered', () => {
        it('should get department menus with filter', async () => {
            const mockResponse = [{ id: 1, code: 'MENU1', name: 'Menu 1' }];
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getDepartmentMenusFiltered('DEPT1', 'APP1', 'MENU1');

            expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/applications/APP1/menus', { menuCode: 'MENU1' });
            expect(result).toBe(mockResponse);
        });

        it('should get department menus without filter', async () => {
            const mockResponse = [{ id: 1, code: 'MENU1', name: 'Menu 1' }];
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getDepartmentMenusFiltered('DEPT1', 'APP1');

            expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/applications/APP1/menus', undefined);
            expect(result).toBe(mockResponse);
        });
    });

    describe('getDepartmentResourcesFiltered', () => {
        it('should get department resources with filter', async () => {
            const mockResponse = [{ id: 1, name: 'RES1' }];
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getDepartmentResourcesFiltered('DEPT1', 'RES1');

            expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/resources', { resourceName: 'RES1' });
            expect(result).toBe(mockResponse);
        });

        it('should get department resources without filter', async () => {
            const mockResponse = [{ id: 1, name: 'RES1' }];
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getDepartmentResourcesFiltered('DEPT1');

            expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/resources', undefined);
            expect(result).toBe(mockResponse);
        });
    });

    describe('getDepartmentPermissionsFiltered', () => {
        it('should get department permissions with filter', async () => {
            const mockResponse = [{ id: 1, name: 'PERM1' }];
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getDepartmentPermissionsFiltered('DEPT1', 'PERM1');

            expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/permissions', { permissionName: 'PERM1' });
            expect(result).toBe(mockResponse);
        });

        it('should get department permissions without filter', async () => {
            const mockResponse = [{ id: 1, name: 'PERM1' }];
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getDepartmentPermissionsFiltered('DEPT1');

            expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/permissions', undefined);
            expect(result).toBe(mockResponse);
        });

        it('should get department permissions with resourceName filter only', async () => {
            const mockResponse = [{ id: 1, name: 'PERM1' }];
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getDepartmentPermissionsFiltered('DEPT1', undefined, 'invoice-service');

            expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/permissions', { resourceName: 'invoice-service' });
            expect(result).toBe(mockResponse);
        });

        it('should get department permissions with both permissionName and resourceName filters', async () => {
            const mockResponse = [{ id: 1, name: 'PERM1' }];
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getDepartmentPermissionsFiltered('DEPT1', 'PERM1', 'invoice-service');

            expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/permissions', { permissionName: 'PERM1', resourceName: 'invoice-service' });
            expect(result).toBe(mockResponse);
        });
    });

    describe('getAvailablePermissionsFiltered', () => {
        it('should get available permissions with resource filter', async () => {
            const mockResponse = [{ id: 1, name: 'PERM1' }];
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getAvailablePermissionsFiltered('DEPT1', 'RES1');

            expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/permissions/available', { resourceName: 'RES1' });
            expect(result).toBe(mockResponse);
        });

        it('should get available permissions without resource filter', async () => {
            const mockResponse = [{ id: 1, name: 'PERM1' }];
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getAvailablePermissionsFiltered('DEPT1');

            expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/permissions/available', undefined);
            expect(result).toBe(mockResponse);
        });
    });

    describe('getRoleChildrenHierarchy', () => {
        it('should get role children hierarchy with level', async () => {
            const mockResponse = { roleCode: 'ROLE1', children: [] };
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getRoleChildrenHierarchy('DEPT1', 'ROLE1', 2);

            expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/roles/ROLE1/children', { level: 2 });
            expect(result).toBe(mockResponse);
        });

        it('should get role children hierarchy without level', async () => {
            const mockResponse = { roleCode: 'ROLE1', children: [] };
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getRoleChildrenHierarchy('DEPT1', 'ROLE1');

            expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/roles/ROLE1/children', undefined);
            expect(result).toBe(mockResponse);
        });
    });

    describe('getRoleParentsHierarchy', () => {
        it('should get role parents hierarchy with level', async () => {
            const mockResponse = { roleCode: 'ROLE1', parents: [] };
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getRoleParentsHierarchy('DEPT1', 'ROLE1', 3);

            expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/roles/ROLE1/parents', { level: 3 });
            expect(result).toBe(mockResponse);
        });

        it('should get role parents hierarchy without level', async () => {
            const mockResponse = { roleCode: 'ROLE1', parents: [] };
            mockGet.mockResolvedValue(mockResponse);

            const result = await client.getRoleParentsHierarchy('DEPT1', 'ROLE1');

            expect(mockGet).toHaveBeenCalledWith('/api/departments/DEPT1/roles/ROLE1/parents', undefined);
            expect(result).toBe(mockResponse);
        });
    });

});
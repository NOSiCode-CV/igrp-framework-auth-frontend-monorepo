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

});
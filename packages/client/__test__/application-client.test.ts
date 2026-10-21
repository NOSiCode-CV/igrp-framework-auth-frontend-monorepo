import { describe, it, expect, vi, beforeEach } from 'vitest';
import {ApplicationClient} from "../src/client/application-client";
import {ApplicationType} from "../src/types";

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

describe('ApplicationClient', () => {
    let client: ApplicationClient;
    const mockConfig = { baseUrl: 'https://api.example.com', timeout: 5000 };

    beforeEach(() => {
        client = new ApplicationClient(mockConfig);
        vi.clearAllMocks();
    });

    it('should get applications with filters', async () => {
        const mockResponse = [{ id: 1, code: 'APP1', name: 'Application 1', type: ApplicationType.INTERNAL }];
        mockGet.mockResolvedValue(mockResponse);

        const filters = { name: 'Application' };
        const result = await client.getApplications(filters);

        expect(mockGet).toHaveBeenCalledWith('/api/applications', filters);
        expect(result).toBe(mockResponse);
    });

    it('should get application by ID', async () => {
        const mockResponse = { id: 2, code: 'APP2', name: 'Application 2', type: ApplicationType.EXTERNAL };
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getApplicationById(2);

        expect(mockGet).toHaveBeenCalledWith('/api/applications/2');
        expect(result).toBe(mockResponse);
    });

    it('should get application by code', async () => {
        const mockResponse = { id: 2, code: 'APP2', name: 'Application 2', type: ApplicationType.EXTERNAL };
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getApplicationByCode('APP2');

        expect(mockGet).toHaveBeenCalledWith('/api/applications/by-code/APP2');
        expect(result).toBe(mockResponse);
    });

    it('should create a new application', async () => {
        const mockResponse = { id: 3, code: 'APP3', name: 'New App', type: ApplicationType.INTERNAL, departments: ['HR'] };
        mockPost.mockResolvedValue(mockResponse);

        const newApp = { code: 'APP3', name: 'New App', type: ApplicationType.INTERNAL, departments: ['HR'] };
        const result = await client.createApplication(newApp);

        expect(mockPost).toHaveBeenCalledWith('/api/applications', newApp);
        expect(result).toBe(mockResponse);
    });

    it('should update an application', async () => {
        const mockResponse = { id: 3, code: 'APP3', name: 'Updated App', type: ApplicationType.INTERNAL };
        mockPut.mockResolvedValue(mockResponse);

        const updateData = { name: 'Updated App' };
        const result = await client.updateApplication('APP3', updateData);

        expect(mockPut).toHaveBeenCalledWith('/api/applications/APP3', updateData);
        expect(result).toBe(mockResponse);
    });

    it('should delete an application', async () => {
        const mockResponse = {};
        mockDelete.mockResolvedValue(mockResponse);

        const result = await client.deleteApplication('APP3');

        expect(mockDelete).toHaveBeenCalledWith('/api/applications/APP3');
        expect(result).toBe(mockResponse);
    });

    it('should get applications by user', async () => {
        const mockResponse = [{ id: 1, code: 'APP1', name: 'Application 1', type: ApplicationType.INTERNAL }];
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getApplicationsByUser('user123');

        expect(mockGet).toHaveBeenCalledWith('/api/applications/by-user/user123');
        expect(result).toBe(mockResponse);
    });


    // Removed: 'should get available menus for application'. ApplicationClient has
    // no getAvailableMenus, and no `/applications/{code}/menus/available` endpoint
    // exists. The available-menus listing is department-scoped:
    // `departments/{departmentCode}/applications/{applicationCode}/menus/available`,
    // covered by DepartmentClient.getAvailableMenus.
});

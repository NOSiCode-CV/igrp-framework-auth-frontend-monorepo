import { BaseApiClient } from './base-client.js';
import {
    ApiResponse,
    ApplicationDTO,
    CreateApplicationRequest,
    UpdateApplicationRequest,
    ApplicationFilters, MenuEntryDTO, CreateMenuRequest, UpdateMenuRequest
} from '@/types';

export class ApplicationClient extends BaseApiClient {
    /**
     * Get all applications with optional filters
     */
    async getApplications(filters?: ApplicationFilters): Promise<ApiResponse<ApplicationDTO[]>> {
        return this.get<ApplicationDTO[]>('/api/applications', filters);
    }

    /**
     * Get applications by IDs
     */
    async getApplicationsByIds(ids: number[]): Promise<ApiResponse<ApplicationDTO[]>> {
        return this.post<ApplicationDTO[]>('/api/applications/by-ids', ids);
    }

    /**
     * Get a specific application by ID
     */
    async getApplicationById(id: number): Promise<ApiResponse<ApplicationDTO>> {
        return this.get<ApplicationDTO>(`/api/applications/${id}`);
    }

    /**
     * Get a specific application by code
     */
    async getApplicationByCode(code: string): Promise<ApiResponse<ApplicationDTO>> {
        return this.get<ApplicationDTO>(`/api/applications/by-code/${code}`);
    }

    /**
     * Create a new application
     */
    async createApplication(app: CreateApplicationRequest): Promise<ApiResponse<ApplicationDTO>> {
        return this.post<ApplicationDTO>('/api/applications', app);
    }

    /**
     * Update an existing application
     */
    async updateApplication(code: string, app: UpdateApplicationRequest): Promise<ApiResponse<ApplicationDTO>> {
        return this.put<ApplicationDTO>(`/api/applications/${code}`, app);
    }

    /**
     * Delete an application
     */
    async deleteApplication(code: string): Promise<ApiResponse<string>> {
        return this.delete<string>(`/api/applications/${code}`);
    }

    /**
     * Get application custom fields
     */
    async getApplicationCustomFields(code: string): Promise<ApiResponse<string>> {
        return this.get<string>(`/api/applications/${code}/custom-fields`);
    }

    /**
     * Add custom fields to an application
     */
    async addApplicationCustomFields(code: string, fields: Record<string, any>): Promise<ApiResponse<string>> {
        return this.post<string>(`/api/applications/${code}/custom-fields`, fields);
    }

    /**
     * Remove custom fields from an application
     */
    async removeApplicationCustomFields(code: string, fieldNames: string[]): Promise<ApiResponse<string>> {
        return this.delete<string>(`/api/applications/${code}/custom-fields`, fieldNames);
    }

    /**
     * Get menus for an application
     */
    async getMenus(code: string): Promise<ApiResponse<MenuEntryDTO[]>> {
        return this.get<MenuEntryDTO[]>(`/api/applications/${code}/menus`);
    }

    /**
     * Create a new menu
     */
    async createMenu(appCode: string, menu: CreateMenuRequest): Promise<ApiResponse<MenuEntryDTO>> {
        return this.post<MenuEntryDTO>(`/api/applications/${appCode}/menus`, menu);
    }

    /**
     * Update an existing menu
     */
    async updateMenu(appCode: string, menuCode: string, menu: UpdateMenuRequest): Promise<ApiResponse<MenuEntryDTO>> {
        return this.put<MenuEntryDTO>(`/api/applications/${appCode}/menus/${menuCode}`, menu);
    }

    /**
     * Delete a menu
     */
    async deleteMenu(appCode: string, menuCode: string): Promise<ApiResponse<string>> {
        return this.delete<string>(`/api/applications/${appCode}/menus/${menuCode}`);
    }

    /**
     * Add roles to a menu
     */
    async addRolesToMenu(appCode: string, menuCode: string, departmentCode: string, roleCodes: string[]): Promise<ApiResponse<MenuEntryDTO>> {
        return this.post<MenuEntryDTO>(`/api/applications/${appCode}/menus/${menuCode}/roles?departmentCode=${departmentCode}`, roleCodes);
    }

    /**
     * Remove roles from a menu
     */
    async removeRolesFromMenu(appCode: string, menuCode: string, departmentCode: string, roleCodes: string[]): Promise<ApiResponse<MenuEntryDTO>> {
        return this.delete<MenuEntryDTO>(`/api/applications/${appCode}/menus/${menuCode}/roles?departmentCode=${departmentCode}`, roleCodes);
    }

    /**
     * Get applications accessible by a specific user
     */
    async getApplicationsByUser(uid: string): Promise<ApiResponse<ApplicationDTO[]>> {
        return this.get<ApplicationDTO[]>(`/api/applications/by-user/${uid}`);
    }

    /**
     * Link resource to another application
     */
    async linkResourceToApplication(
        resourceName: string,
        appCode: string
    ): Promise<ApiResponse<string>> {
        return this.post<string>(`/api/applications/${appCode}/resources/${resourceName}`);
    }

    /**
     * Unlink resource from an application
     */
    async unlinkResourceFromApplication(
        resourceName: string,
        appCode: string
    ): Promise<ApiResponse<string>> {
        return this.delete<string>(`/api/applications/${appCode}/resources/${resourceName}`);
    }

}
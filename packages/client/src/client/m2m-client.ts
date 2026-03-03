import { BaseApiClient } from './base-client.js';
import {
    ApiResponse,
    IGRPUserDTO,
    RoleDTO,
    DepartmentDTO,
    PermissionDTO,
    ApplicationDTO,
    ResourceDTO,
    M2MUserQueryOptions,
    M2MRoleQueryOptions,
    M2MDepartmentQueryOptions, MenuEntryDTO
} from '@/types';

export class M2MClient extends BaseApiClient {
    /**
     * Get users for business codes with optional filters
     */
    async getUsersForBusiness(
        identifiers: string[],
        options: M2MUserQueryOptions
    ): Promise<ApiResponse<IGRPUserDTO[]>> {
        return this.post<IGRPUserDTO[]>(
            '/api/m2m/users',
            identifiers,
            { params: options }
        );
    }

    /**
     * Sync resources
     */
    async syncResources(resource: ResourceDTO): Promise<ApiResponse<string>> {
        return this.post<string>('/api/m2m/sync/resources', resource);
    }

    /**
     * Sync permissions
     */
    async syncPermissions(permissions: PermissionDTO[]): Promise<ApiResponse<string>> {
        return this.post<string>('/api/m2m/sync/permissions', permissions);
    }

    /**
     * Sync applications
     */
    async syncApplications(application: ApplicationDTO): Promise<ApiResponse<string>> {
        return this.post<string>('/api/m2m/sync/applications', application);
    }

    /**
     * Sync application's menus
     */
    async syncApplicationMenus(applicationCode: string, menus: MenuEntryDTO[]): Promise<ApiResponse<string>> {
        return this.post<string>(`/api/m2m/sync/applications/${applicationCode}/menus`, menus);
    }

    /**
     * Get roles for business codes with optional filters
     */
    async getRolesForBusiness(
        identifiers: string[],
        options: M2MRoleQueryOptions
    ): Promise<ApiResponse<RoleDTO[]>> {
        return this.post<RoleDTO[]>(
            '/api/m2m/roles',
            identifiers,
            { params: options }
        );
    }

    /**
     * Get departments for business codes with optional filters
     */
    async getDepartmentsForBusiness(
        identifiers: string[],
        options: M2MDepartmentQueryOptions
    ): Promise<ApiResponse<DepartmentDTO[]>> {
        return this.post<DepartmentDTO[]>(
            '/api/m2m/departments',
            identifiers,
            { params: options }
        );
    }
}

import {BaseApiClient} from './base-client.js';
import {
    ApiResponse,
    DepartmentDTO,
    RoleDTO,
    CreateRoleRequest,
    CreateDepartmentRequest,
    UpdateDepartmentRequest,
    DepartmentFilters,
    ApplicationDTO,
    MenuEntryDTO,
    ResourceDTO,
    PermissionDTO,
    RoleDepartmentDTO,
    RoleChildHierarchyDTO,
    RoleParentHierarchyDTO
} from '@/types';

export class DepartmentClient extends BaseApiClient {
    /**
     * Get all departments
     */
    async getDepartments(filters?: DepartmentFilters): Promise<ApiResponse<DepartmentDTO[]>> {
        return this.get<DepartmentDTO[]>("/api/departments", filters);
    }

    /**
     * Get a specific department by ID
     */
    async getDepartmentById(id: number): Promise<ApiResponse<DepartmentDTO>> {
        return this.get<DepartmentDTO>(`/api/departments/${id}`);
    }

    /**
     * Get a specific department by code
     */
    async getDepartmentByCode(code: string): Promise<ApiResponse<DepartmentDTO>> {
        return this.get<DepartmentDTO>(`/api/departments/by-code/${code}`);
    }

    /**
     * Create a new department
     */
    async createDepartment(dept: CreateDepartmentRequest): Promise<ApiResponse<DepartmentDTO>> {
        return this.post<DepartmentDTO>('/api/departments', dept);
    }

    /**
     * Update an existing department
     */
    async updateDepartment(code: string, dept: UpdateDepartmentRequest): Promise<ApiResponse<DepartmentDTO>> {
        return this.put<DepartmentDTO>(`/api/departments/${code}`, dept);
    }

    /**
     * Delete a department
     */
    async deleteDepartment(code: string): Promise<ApiResponse<string>> {
        return this.delete<string>(`/api/departments/${code}`);
    }

    /**
     * Get available applications for a department
     */
    async getAvailableApplications(departmentCode: string): Promise<ApiResponse<ApplicationDTO[]>> {
        return this.get<ApplicationDTO[]>(`/api/departments/${departmentCode}/applications/available`);
    }

    /**
     * Get department's applications
     */
    async getDepartmentApplications(departmentCode: string): Promise<ApiResponse<ApplicationDTO[]>> {
        return this.get<ApplicationDTO[]>(`/api/departments/${departmentCode}/applications`);
    }

    /**
     * Get available menus for a department
     */
    async getAvailableMenus(appCode: string, departmentCode: string): Promise<ApiResponse<MenuEntryDTO[]>> {
        return this.get<MenuEntryDTO[]>(`/api/departments/${departmentCode}/applications/${appCode}/menus/available`);
    }

    /**
     * Get department's menus
     */
    async getDepartmentMenus(appCode: string, departmentCode: string): Promise<ApiResponse<MenuEntryDTO[]>> {
        return this.get<MenuEntryDTO[]>(`/api/departments/${departmentCode}/applications/${appCode}/menus`);
    }

    /**
     * Get available resources for a department
     */
    async getAvailableResources(departmentCode: string): Promise<ApiResponse<ResourceDTO[]>> {
        return this.get<ResourceDTO[]>(`/api/departments/${departmentCode}/resources/available`);
    }

    /**
     * Get department's resources
     */
    async getDepartmentResources(departmentCode: string): Promise<ApiResponse<ResourceDTO[]>> {
        return this.get<ResourceDTO[]>(`/api/departments/${departmentCode}/resources`);
    }

    /**
     * Get department's permissions
     */
     async getDepartmentPermissions(departmentCode: string): Promise<ApiResponse<PermissionDTO[]>> {
        return this.get<PermissionDTO[]>(`/api/departments/${departmentCode}/permissions`);
    }

    /**
     * Get available permissions for a department
     */
     async getAvailablePermissions(departmentCode: string): Promise<ApiResponse<PermissionDTO[]>> {
        return this.get<PermissionDTO[]>(`/api/departments/${departmentCode}/permissions/available`);
    }

    /**
     * Add menus to a department
     */
    async addMenusToDepartment(appCode: string, departmentCode: string, menuCodes: string[]): Promise<ApiResponse<string>> {
        return this.post<string>(`/api/departments/${departmentCode}/applications/${appCode}/menus`, menuCodes);
    }

    async addApplicationsToDepartment(code: string, applicationCodes: string[]): Promise<ApiResponse<string>> {
        return this.post<string>(`/api/departments/${code}/applications`, applicationCodes);
    }

    /**
     * Add Resources To Department
     */
    async addResourcesToDepartment(departmentCode: string, resourceCodes: string[]): Promise<ApiResponse<string>> {
        return this.post<string>(`/api/departments/${departmentCode}/resources`, resourceCodes);
    }

    /**
     * Add Permissions To Department
     */
    async addPermissionsToDepartment(departmentCode: string, permissionCodes: string[]): Promise<ApiResponse<string>> {
        return this.post<string>(`/api/departments/${departmentCode}/permissions`, permissionCodes);
    }

    /**
     * Remove Resources From Department
     */
    async removeResourcesFromDepartment(departmentCode: string, resourceCodes: string[]): Promise<ApiResponse<string>> {
        return this.delete<string>(`/api/departments/${departmentCode}/resources`, resourceCodes);
    }

    /**
     * Remove menus from a department
     * @param appCode
     * @param departmentCode
     * @param menuCodes
     */

    async removeMenusFromDepartment(appCode: string, departmentCode: string, menuCodes: string[]): Promise<ApiResponse<string>> {
        return this.delete<string>(`/api/departments/${departmentCode}/applications/${appCode}/menus`, menuCodes);
    }

    async removeApplicationsFromDepartment(code: string, applicationCodes: string[]): Promise<ApiResponse<string>> {
        return this.delete<string>(`/api/departments/${code}/applications`, applicationCodes);
    }

    /**
     * Remove Permissions From Department
     */
    async removePermissionsFromDepartment(departmentCode: string, permissionCodes: string[]): Promise<ApiResponse<string>> {
        return this.delete<string>(`/api/departments/${departmentCode}/permissions`, permissionCodes);
    }

    async updateRole(departmentCode: string, roleCode: string, role: any): Promise<ApiResponse<any>> {
        return this.put<any>(`/api/departments/${departmentCode}/roles/${roleCode}`, role);
    }

    async deleteRole(departmentCode: string, roleCode: string): Promise<ApiResponse<boolean>> {
        return this.delete<boolean>(`/api/departments/${departmentCode}/roles/${roleCode}`);
    }

    async getPermissionsByRole(departmentCode: string, roleCode: string): Promise<ApiResponse<any>> {
        return this.get<any>(`/api/departments/${departmentCode}/roles/${roleCode}/permissions`);
    }

    async getRoleChildren(departmentCode: string, roleCode: string, level?: number) {
        const params = level ? {level} : undefined;
        return this.get<RoleDepartmentDTO>(`/api/departments/${departmentCode}/roles/${roleCode}/children`, params);
    }

    async getRoleParents(departmentCode: string, roleCode: string, level?: number): Promise<ApiResponse<RoleDepartmentDTO>> {
        const params = level ? {level} : undefined;
        return this.get<RoleDepartmentDTO>(`/api/departments/${departmentCode}/roles/${roleCode}/parents`, params);
    }

    async addPermissionsToRole(departmentCode: string, roleCode: string, permissionCodes: string[]): Promise<ApiResponse<any>> {
        return this.post<any>(`/api/departments/${departmentCode}/roles/${roleCode}/permissions`, permissionCodes);
    }

    async removePermissionsFromRole(departmentCode: string, roleCode: string, permissionCodes: string[]): Promise<ApiResponse<any>> {
        return this.delete<any>(`/api/departments/${departmentCode}/roles/${roleCode}/permissions`, permissionCodes);
    }

    /**
     * Get all roles for a department
     */
    async getRoles(departmentCode: string, roleCode?: string): Promise<ApiResponse<RoleDTO[]>> {
        const params = roleCode ? {roleCode} : undefined;
        return this.get<RoleDTO[]>(`/api/departments/${departmentCode}/roles`, params);
    }

    /**
     * Create a new role in a department
     */
    async createRole(departmentCode: string, role: CreateRoleRequest): Promise<ApiResponse<RoleDTO>> {
        return this.post<RoleDTO>(`/api/departments/${departmentCode}/roles`, role);
    }

    /**
     * Get available permissions for role
     */
    async getAvailablePermissionsForRole(departmentCode: string, roleCode: string): Promise<ApiResponse<PermissionDTO[]>> {
        return this.get<PermissionDTO[]>(`/api/departments/${departmentCode}/roles/${roleCode}/permissions/available`);
    }

    /**
     * Get department's applications with optional filter
     */
    async getDepartmentApplicationsFiltered(departmentCode: string, applicationCode?: string): Promise<ApiResponse<ApplicationDTO[]>> {
        const params = applicationCode ? { applicationCode } : undefined;
        return this.get<ApplicationDTO[]>(`/api/departments/${departmentCode}/applications`, params);
    }

    /**
     * Get department's menus with optional filter
     */
    async getDepartmentMenusFiltered(departmentCode: string, applicationCode: string, menuCode?: string): Promise<ApiResponse<MenuEntryDTO[]>> {
        const params = menuCode ? { menuCode } : undefined;
        return this.get<MenuEntryDTO[]>(`/api/departments/${departmentCode}/applications/${applicationCode}/menus`, params);
    }

    /**
     * Get department's resources with optional filter
     */
    async getDepartmentResourcesFiltered(departmentCode: string, resourceName?: string): Promise<ApiResponse<ResourceDTO[]>> {
        const params = resourceName ? { resourceName } : undefined;
        return this.get<ResourceDTO[]>(`/api/departments/${departmentCode}/resources`, params);
    }

    /**
     * Get department's permissions with optional filter
     */
    async getDepartmentPermissionsFiltered(departmentCode: string, permissionName?: string): Promise<ApiResponse<PermissionDTO[]>> {
        const params = permissionName ? { permissionName } : undefined;
        return this.get<PermissionDTO[]>(`/api/departments/${departmentCode}/permissions`, params);
    }

    /**
     * Get available permissions for a department with optional resource filter
     */
    async getAvailablePermissionsFiltered(departmentCode: string, resourceName?: string): Promise<ApiResponse<PermissionDTO[]>> {
        const params = resourceName ? { resourceName } : undefined;
        return this.get<PermissionDTO[]>(`/api/departments/${departmentCode}/permissions/available`, params);
    }

    /**
     * Get role children hierarchy
     */
    async getRoleChildrenHierarchy(departmentCode: string, roleCode: string, level?: number): Promise<ApiResponse<RoleChildHierarchyDTO>> {
        const params = level ? { level } : undefined;
        return this.get<RoleChildHierarchyDTO>(`/api/departments/${departmentCode}/roles/${roleCode}/children`, params);
    }

    /**
     * Get role parents hierarchy
     */
    async getRoleParentsHierarchy(departmentCode: string, roleCode: string, level?: number): Promise<ApiResponse<RoleParentHierarchyDTO>> {
        const params = level ? { level } : undefined;
        return this.get<RoleParentHierarchyDTO>(`/api/departments/${departmentCode}/roles/${roleCode}/parents`, params);
    }
}
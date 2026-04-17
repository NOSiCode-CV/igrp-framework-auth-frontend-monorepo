import { BaseApiClient } from './base-client.js';
import {
    ApiResponse,
    IGRPUserDTO,
    CreateUserRequest,
    UpdateUserRequest,
    UserFilters,
    RoleDTO,
    RoleUserDTO, ApplicationDTO, MenuEntryDTO, UserInvitationResponseDTO, InviteUserDTO, DepartmentDTO, InvitationDTO,
    PermissionDTO, RoleDepartmentDTO, OtpResponseDTO, ValidateInvitationEmailRequest, ValidateInvitationOtpRequest
} from '@/types';

export class UserClient extends BaseApiClient {
    /**
     * Get users with optional filters
     */
    async getUsers(filters?: UserFilters): Promise<ApiResponse<IGRPUserDTO[]>> {
        return this.get<IGRPUserDTO[]>("/api/users", { params: filters });
    }

    async getUser(id: number): Promise<ApiResponse<IGRPUserDTO>> {
        return this.get<IGRPUserDTO>(`/api/users/${id}`);
    }

    async updateUser(id: number, user: IGRPUserDTO): Promise<ApiResponse<IGRPUserDTO>> {
        return this.put<IGRPUserDTO>(`/api/users/${id}`, user);
    }

    async updateUserStatus(id: number, value: string): Promise<ApiResponse<IGRPUserDTO>> {
        return this.put<IGRPUserDTO>(`/api/users/${id}/status?value=${value}`);
    }

    async inviteUser(user: InviteUserDTO): Promise<ApiResponse<InvitationDTO>> {
        return this.post<InvitationDTO>("/api/users/invite", user);
    }

    async respondUserInvitation(response: UserInvitationResponseDTO, token: string): Promise<ApiResponse<InvitationDTO>> {
        return this.post<InvitationDTO>(`/api/users/invite/response?token=${token}`, response);
    }

    async resendUserInvitation(id: number): Promise<ApiResponse<InvitationDTO>> {
        return this.put<InvitationDTO>(`/api/users/invite/${id}`);
    }

    async cancelUserInvitation(id: number): Promise<ApiResponse<InvitationDTO>> {
        return this.delete<InvitationDTO>(`/api/users/invite/${id}`);
    }

    async getUserInvitation(id: number): Promise<ApiResponse<InvitationDTO>> {
        return this.get<InvitationDTO>(`/api/users/invite/${id}`);
    }

    async getUserInvitationByToken(token: string): Promise<ApiResponse<InvitationDTO>> {
        return this.get<InvitationDTO>(`/api/users/invite/by-token/${token}`);
    }

    /**
     * Get user invitations with optional filters
     */
    async getUserInvitations(email?: string): Promise<ApiResponse<InvitationDTO[]>> {
        return this.get<InvitationDTO[]>("/api/users/invite", { params: { email } });
    }

    async getUserRoles(id: number): Promise<ApiResponse<RoleDTO[]>> {
        return this.get<RoleDTO[]>(`/api/users/${id}/roles`);
    }

    async addRolesToUser(id: number, departmentCode: string, roleCodes: string[]): Promise<ApiResponse<RoleDTO>> {
        return this.post<RoleDTO>(`/api/users/${id}/departments/${departmentCode}/roles`, roleCodes);
    }

    async removeRolesFromUser(id: number, departmentCode: string, roleCodes: string[]): Promise<ApiResponse<RoleDTO>> {
        return this.delete<RoleDTO>(`/api/users/${id}/departments/${departmentCode}/roles`, roleCodes);
    }

    /**
     * Get the current authenticated user
     */
    async getCurrentUser(): Promise<ApiResponse<IGRPUserDTO>> {
        return this.get<IGRPUserDTO>('/api/users/me');
    }

    /**
     * Get the current authenticated user's departments
     */
     async getCurrentUserDepartments(): Promise<ApiResponse<DepartmentDTO[]>> {
        return this.get<DepartmentDTO[]>('/api/users/me/departments');
    }

    /**
     * Get a user's departments
     */
     async getUserDepartments(id: number): Promise<ApiResponse<DepartmentDTO[]>> {
        return this.get<DepartmentDTO[]>(`/api/users/${id}/departments`);
    }

    /**
     * Get the current authenticated user's department roles
     */
     async getCurrentUserDepartmentRoles(departmentCode: string): Promise<ApiResponse<RoleUserDTO[]>> {
        return this.get<RoleUserDTO[]>(`/api/users/me/departments/${departmentCode}/roles`);
    }

     /**
     * Get a user's department roles
     */
     async getUserDepartmentRoles(id: number, departmentCode: string): Promise<ApiResponse<RoleUserDTO[]>> {
        return this.get<RoleUserDTO[]>(`/api/users/${id}/departments/${departmentCode}/roles`);
    }

    /**
     * Get the current authenticated user's applications
     */
     async getCurrentUserApplications(applicationName?: string): Promise<ApiResponse<ApplicationDTO[]>> {
        return this.get<ApplicationDTO[]>(`/api/users/me/applications`, { params: { applicationName } });
    }

    /**
     * Get the current authenticated user's recent applications
     */
     async getCurrentUserRecentApplications(applicationName?: string, max?: string): Promise<ApiResponse<ApplicationDTO[]>> {
        return this.get<ApplicationDTO[]>(`/api/users/me/applications/recent`, { params: { applicationName, max } });
    }

    /**
     * Register current authenticated user's recent application
     */
     async registerCurrentUserApplicationAccess(applicationCode: string): Promise<ApiResponse<ApplicationDTO>> {
        return this.post<ApplicationDTO>(`/api/users/me/applications/recent/${applicationCode}`);
    }

    /**
     * Get the current authenticated user's favorite applications
     */
     async getCurrentUserFavoriteApplications(applicationName?: string): Promise<ApiResponse<ApplicationDTO[]>> {
        return this.get<ApplicationDTO[]>(`/api/users/me/applications/favorites`, { params: { applicationName } });
    }

    /**
     * Add the current authenticated user's favorite application
     */
     async addCurrentUserFavoriteApplication(applicationCode: string): Promise<ApiResponse<ApplicationDTO>> {
        return this.post<ApplicationDTO>(`/api/users/me/applications/favorites/${applicationCode}`);
    }

    /**
     * Remove the current authenticated user's favorite application
     */
     async removeCurrentUserFavoriteApplication(applicationCode: string): Promise<ApiResponse<ApplicationDTO>> {
        return this.delete<ApplicationDTO>(`/api/users/me/applications/favorites/${applicationCode}`);
    }

    /**
     * Get a user's applications
     */
     async getUserApplications(id: number): Promise<ApiResponse<ApplicationDTO[]>> {
        return this.get<ApplicationDTO[]>(`/api/users/${id}/applications`);
    }

    /**
     * Get the current authenticated user's application menus
     */
     async getCurrentUserApplicationMenus(applicationCode: string): Promise<ApiResponse<MenuEntryDTO[]>> {
        return this.get<MenuEntryDTO[]>(`/api/users/me/applications/${applicationCode}/menus`);
    }

     /**
     * Get a user's application menus
     */
     async getUserApplicationMenus(id: number, applicationCode: string): Promise<ApiResponse<MenuEntryDTO[]>> {
        return this.get<MenuEntryDTO[]>(`/api/users/${id}/applications/${applicationCode}/menus`);
    }

    /**
     * Get the current authenticated user's roles
     */
    async getCurrentUserRoles(): Promise<ApiResponse<RoleDTO[]>> {
        return this.get<RoleDTO[]>(`/api/users/me/roles`);
    }

    /**
     * Get the current authenticated user's active role
     */
    async getCurrentUserActiveRole(): Promise<ApiResponse<RoleDepartmentDTO>> {
        return this.get<RoleDepartmentDTO>(`/api/users/me/roles/active`);
    }

    /**
     * Get a user's active role
     */
    async getUserActiveRole(id: number): Promise<ApiResponse<RoleDepartmentDTO>> {
        return this.get<RoleDepartmentDTO>(`/api/users/${id}/roles/active`);
    }

    /**
     * Set the current authenticated user's active role
     */
    async setCurrentUserActiveRole(body: RoleDepartmentDTO): Promise<ApiResponse<RoleDepartmentDTO>> {
        return this.post<RoleDepartmentDTO>(`/api/users/me/roles/active`, body);
    }

    /**
     * Set a user's active role
     */
    async setUserActiveRole(id: number, body: RoleDepartmentDTO): Promise<ApiResponse<RoleDepartmentDTO>> {
        return this.post<RoleDepartmentDTO>(`/api/users/${id}/roles/active`, body);
    }

    /**
     * Get the current authenticated user's permissions
     */
    async getCurrentUserPermissions(): Promise<ApiResponse<PermissionDTO[]>> {
        return this.get<PermissionDTO[]>(`/api/users/me/permissions`);
    }

    /**
     * Get a user's permissions
     */
    async getUserPermissions(id: number): Promise<ApiResponse<PermissionDTO[]>> {
        return this.get<PermissionDTO[]>(`/api/users/${id}/permissions`);
    }

    /**
     * Update the current authenticated user
     */
    async updateCurrentUser(user: IGRPUserDTO): Promise<ApiResponse<IGRPUserDTO>> {
        return this.put<IGRPUserDTO>('/api/users/me', user);
    }

    /**
     * Validate invitation email and send OTP
     */
    async validateInvitationEmail(request: ValidateInvitationEmailRequest): Promise<ApiResponse<OtpResponseDTO>> {
        return this.post<OtpResponseDTO>('/api/users/invite/validate-email', request);
    }

    /**
     * Validate invitation OTP code
     */
    async validateInvitationOtp(request: ValidateInvitationOtpRequest): Promise<ApiResponse<OtpResponseDTO>> {
        return this.post<OtpResponseDTO>('/api/users/invite/validate-otp', request);
    }

    /**
     * Create a new user
     */
    async createUser(user: CreateUserRequest): Promise<ApiResponse<IGRPUserDTO>> {
        return this.post<IGRPUserDTO>('/api/users', user);
    }

}
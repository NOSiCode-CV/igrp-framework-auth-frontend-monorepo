// Main exports
export { AccessManagementClient } from './client/access-management-client.js';
export { ApplicationClient } from './client/application-client.js';
export { DepartmentClient } from './client/department-client.js';
export { RoleClient } from './client/role-client.js';
export { UserClient } from './client/user-client.js';
export { FileClient } from './client/file-client.js';
export { AuthorizeClient } from './client/authorize-client.js'
export { M2MClient } from './client/m2m-client.js';
export { SessionClient } from './client/session-client.js';
export { AdminSessionClient } from './client/admin-session-client.js';
export { AuthAuditClient } from './client/auth-audit-client.js';
export { BaseApiClient, ApiClientError } from './client/base-client.js';

// Type exports
export type {
    ApiResponse,
    ApiClientConfig,
    M2MClientConfig,
    // Menu types
    MenuEntryDTO,
    CreateMenuRequest,
    UpdateMenuRequest,
    MenuFilters,
    // Application types
    ApplicationDTO,
    CreateApplicationRequest,
    UpdateApplicationRequest,
    ApplicationFilters,
    // Resource types
    ResourceDTO,
    ResourceItemDTO,
    // Role types
    RoleDTO,
    CreateRoleRequest,
    UpdateRoleRequest,
    RoleFilters,
    // User types
    IGRPUserDTO,
    CreateUserRequest,
    UpdateUserRequest,
    UserFilters,
    RoleUserDTO,
    InviteUserDTO,
    UserInvitationResponseDTO,
    // Department types
    DepartmentDTO,
    CreateDepartmentRequest,
    UpdateDepartmentRequest,
    DepartmentFilters,
    // Global Configuration types
    GlobalConfigurationDTO,
    // File types
    UploadFileOptions,
    FileUrlDTO,
    // Authorize Types
    PermissionCheckRequestDTO,
    PermissionCheckResponseDTO,
    // M2M Types
    M2MUserQueryOptions,
    M2MRoleQueryOptions,
    M2MDepartmentQueryOptions,
    // Session types
    SessionResponseDTO,
    SessionInitRequestDTO,
    SessionRefreshRequestDTO,
    SessionKillRequestDTO,
    SessionStatisticsDTO,
    SessionFilters,
    SessionsByRoleFilters,
    PageResponse,
    // Audit types
    SecurityAuditLogDTO,
    AuditLogFilters,
    // Enums
    Status,
    MenuType,
    ApplicationType,
    DepartmentStatus,
    GlobalConfigurationType,
    ResourceType,
    SessionStatus
} from './types/index.js';
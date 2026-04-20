// API Response wrapper types
export interface ApiResponse<T> {
    data: T;
    status: number;
    statusText: string;
}

export interface ApiError {
    message: string;
    status: number;
    details?: any;
}

// Enums
export enum ResourceType {
    API = 'API',
    UI = 'UI'
}

export enum Status {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DELETED = 'DELETED'
}

export enum MenuType {
    MENU_PAGE = 'MENU_PAGE',
    EXTERNAL_PAGE = 'EXTERNAL_PAGE',
    FOLDER = 'FOLDER',
    GROUP = 'GROUP'
}

export enum ApplicationType {
    INTERNAL = 'INTERNAL',
    EXTERNAL = 'EXTERNAL'
}

export enum DepartmentStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DELETED = 'DELETED'
}

export enum GlobalConfigurationType {
    CLUSTER = 'CLUSTER',
    ORGANIZATION = 'ORGANIZATION'
}

export enum InvitationStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    CANCELED = 'CANCELED'
}

export type MenuTargetType = '_self' | '_blank'

// Resource Types
export interface ResourceItemDTO {
    id?: number;
    name: string;
    url?: string;
    permissionName?: string;
    resourceName: string;
    permissions?: string[];
    createdBy?: string;
    createdDate?: string;
    lastModifiedBy?: string;
    lastModifiedDate?: string;
}

export interface ResourceDTO {
    id?: number;
    name: string;
    description?: string;
    type: ResourceType;
    status?: Status;
    applications: string[];
    permissions?: string[];
    items?: ResourceItemDTO[];
    externalId?: string;
    createdBy?: string;
    createdDate?: string;
    lastModifiedBy?: string;
    lastModifiedDate?: string;
}

export interface CreateResourceRequest {
    name: string;
    description?: string;
    type: ResourceType;
    applications: string[];
    externalId?: string;
}

export interface UpdateResourceRequest {
    name?: string;
    description?: string;
    type?: ResourceType;
    status?: Status;
    externalId?: string;
}

export interface ResourceFilters {
    applicationCode?: string;
    name?: string;
    type?: string;
    externalID?: string;
    description?: string;
}

// Permission Types
export interface PermissionDTO {
    id: number;
    name: string;
    description?: string | null;
    status: Status;
    departmentCode: string;
}

export type CreatePermissionRequest = Omit<PermissionDTO, 'id' | 'status'>

export type UpdatePermissionRequest = Partial<Pick<PermissionDTO, 'description' | 'status'>>

export interface PermissionFilters {
    resourceName: string;
}

// Menu Types
export interface MenuEntryDTO {
    id?: number;
    name: string;
    code: string;
    type: MenuType;
    position: number;
    icon?: string;
    status: Status;
    target?: MenuTargetType;
    url?: string | null;
    parentCode?: string | null;
    pageSlug?: string | null;
    applicationCode: string;
    createdBy?: string;
    createdDate?: string;
    lastModifiedBy?: string;
    lastModifiedDate?: string;
    roles: RoleDepartmentDTO[];
}

export type CreateMenuRequest = Pick<MenuEntryDTO,
    'name' |
    'code' |
    'type' |
    'position' |
    'icon' |
    'status' |
    'target' |
    'url' |
    'parentCode' |
    'pageSlug'
>

export type UpdateMenuRequest = Partial<Pick<MenuEntryDTO,
    'name' |
    'code' |
    'type' |
    'position' |
    'icon' |
    'status' |
    'target' |
    'url' |
    'parentCode' |
    'pageSlug'
>>

export type MenuFilters = Partial<Pick<MenuEntryDTO, 
    'applicationCode' | 
    'name' | 
    'code' | 
    'status' | 
    'type'
>> & {
    departmentCode?: string;
}

// Application Types
export interface ApplicationDTO {
    id: number;
    code: string;
    name: string;
    description?: string | null;
    status: Status;
    type: ApplicationType;
    owner?: string;
    picture?: string | null;
    url?: string | null;
    slug?: string | null;
    departments: string[];
    createdBy?: string;
    createdDate?: string;
    lastModifiedBy?: string;
    lastModifiedDate?: string;
    lastAccess?: string;
}

export type CreateApplicationRequest = Omit<ApplicationDTO, 
    'id' | 
    'status' |
    'owner' |
    'createdBy' | 
    'createdDate' | 
    'lastModifiedBy' | 
    'lastModifiedDate' |
    'lastAccess'
>

export type UpdateApplicationRequest = Partial<Omit<ApplicationDTO,
    'id' |
    'owner' |
    'createdBy' |
    'createdDate' |
    'lastModifiedBy' |
    'lastModifiedDate' |
    'lastAccess'
>>

export interface ApplicationFilters {
    code?: string;
    name?: string;
    slug?: string;
    departmentCode?: string;
    type?: string;
}

// Role Types
export interface RoleDTO {
    id: number;
    code: string;
    name?: string;
    icon?: string;
    description?: string | null;
    departmentCode: string;
    parentCode?: string | null;
    status: Status;
    permissions: string[];
}

export type CreateRoleRequest = Omit<RoleDTO, 'id' | 'status' | 'permissions' | 'departmentCode'>;

export type UpdateRoleRequest = Partial<Omit<RoleDTO, 'id' | 'name' | 'departmentCode' | 'permissions'>>;

export interface RoleFilters {
    departmentCode?: string;
    name?: string;
}

export interface RoleDepartmentDTO {
    roleCode: string;
    departmentCode: string;
}

export interface RoleChildHierarchyDTO {
    roleCode: string;
    departmentCode: string;
    children?: RoleChildHierarchyDTO[];
}

export interface RoleParentHierarchyDTO {
    roleCode: string;
    departmentCode: string;
    parents?: RoleParentHierarchyDTO[];
}

// User Types
export interface IGRPUserDTO {
    id: number;
    name: string;
    username?: string;
    email: string;
    status: Status;
    picture?: string;
    signature?: string;
}

export type CreateUserRequest = Omit<IGRPUserDTO, 'id' | 'username'>

export type UpdateUserRequest = Partial<Omit<IGRPUserDTO, 'id' | 'username'>>

export interface UserFilters {
    applicationCode?: string;
    departmentCode?: string;
    name?: string;
    email?: string;
}

export interface RoleUserDTO {
    userName: string;
    roleName: string;
}

export interface InviteUserDTO {
    email: string;
    departmentCode: string;
    roles: string[];
}

export interface UserInvitationResponseDTO {
    email: string;
    accept: boolean;
    observation?: string;
}

export interface CodeDescriptionDTO {
    code: string;
    description: string;
}

export interface InvitationDTO {
    id: number,
    email: string;
    status: InvitationStatus,
    expiry?: string,
    invitationDate: string,
    invitedBy: string,
    comments?: string,
    invitationUrl?: string,
    roles: CodeDescriptionDTO[],
    department: CodeDescriptionDTO
}

// Department Types
export interface DepartmentDTO {
    id: number;
    code: string;
    name: string;
    icon?: string;
    description?: string | null;
    status?: DepartmentStatus;
    parentCode?: string;
}

export type CreateDepartmentRequest = Omit<DepartmentDTO, 'id'>

export type UpdateDepartmentRequest = Partial<Omit<DepartmentDTO, 'id'>>

export interface DepartmentFilters {
    code?: string;
    name?: string;
    parentCode?: string;
    status?: DepartmentStatus;
}

// Global Configuration Types:
export interface GlobalConfigurationDTO {
    config: string,
    type: GlobalConfigurationType
}

// File Types:
export interface FileUrlDTO {
    url: string;
    expiration: Date;
}

export interface UploadFileOptions {
    folder: string;
}

// Authorize Types:
export interface PermissionCheckRequestDTO {
    resource: string;
    action: string;
}

export interface PermissionCheckResponseDTO {
    allowed: boolean;
    via_roles: string[];
    cache_hit: boolean;
    resolution_time_ms: number;
}

// M2M Types:
export interface M2MUserQueryOptions {
    activeOnly?: boolean;
    applicationCode?: string;
    departmentCode?: string;
    roleCode?: string;
    permissionName?: string;
    includeChildrenDepartments?: boolean;
    includeChildrenRoles?: boolean;
}

export interface M2MRoleQueryOptions {
    activeOnly?: boolean;
    parentCode?: string;
    includeChildrenRoles?: boolean;
}

export interface M2MDepartmentQueryOptions {
    activeOnly?: boolean;
    parentCode?: string;
    includeChildrenDepartments?: boolean;
}

// OTP Types
export interface OtpResponseDTO {
    token: string;
    message: string;
}

export interface ValidateInvitationEmailRequest {
    token: string;
    email: string;
}

export interface ValidateInvitationOtpRequest {
    token: string;
    otpCode: string;
}

/**
 * Request body for POST /api/users/{id}/departments/{departmentCode}/roles.
 * Role codes to assign, with an optional temporary expiration timestamp.
 */
export interface AddRolesToUserRequestDTO {
    /** List of role codes to assign */
    roles: string[];
    /** When set, role assignments expire at this ISO-8601 datetime (temporary role) */
    expiresAt?: string;
}

// API Client Configuration
export interface ApiClientConfig {
    baseUrl: string;
    timeout?: number;
    headers?: Record<string, string>;
}

export interface M2MClientConfig {
    serviceId: string,
    token: string
}

// Session Enums
export enum SessionStatus {
    ACTIVE = 'ACTIVE',
    CLOSED = 'CLOSED',
    EXPIRED = 'EXPIRED',
    REVOKED = 'REVOKED'
}

// Session Types
export interface SessionResponseDTO {
    sessionId: string;
    status: SessionStatus;
    startedAt?: string;
    lastSeenAt?: string;
    expiresAt?: string;
    endedAt?: string;
    closedReason?: string;
    closedBy?: string;
    clientIp?: string;
    deviceId?: string;
    userProfile?: IGRPUserDTO;
    currentActiveRole?: RoleDepartmentDTO;
    roles?: RoleDepartmentDTO[];
    departments?: CodeDescriptionDTO[];
}

export interface SessionInitRequestDTO {
    clientIp?: string;
    deviceId?: string;
    userAgent?: string;
}

export interface SessionRefreshRequestDTO {
    extensionSeconds?: number;
}

export interface SessionKillRequestDTO {
    reason: string;
    killedBy?: string;
}

export interface SessionStatisticsDTO {
    activeSessions: number;
    expiredSessions: number;
    closedSessions: number;
    revokedSessions: number;
}

export interface SessionFilters {
    status?: SessionStatus;
    page?: number;
    size?: number;
}

export interface SessionsByRoleFilters {
    departmentCode?: string;
    status?: SessionStatus;
    page?: number;
    size?: number;
}

// Paginated Response
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// Security Audit Types
export interface SecurityAuditLogDTO {
    id: number;
    userId?: string;
    username?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    correlationId?: string;
    requestPath?: string;
    decisionReason?: string;
    eventType?: string;
    category?: string;
    contextData?: string;
    timestamp?: string;
}

export interface AuditLogFilters {
    page?: number;
    size?: number;
    sort?: string;
}
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
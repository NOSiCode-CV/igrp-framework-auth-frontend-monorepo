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

/**
 * Type of identifier an invitation / audit row carries for the invited /
 * acting principal. Mirrors the server enum
 * `cv.igrp.platform.access_management.shared.application.constants.IdentifierType`.
 *
 * Wire format is the enum name (e.g. `"EMAIL"`). New server-side values
 * surface in the JSON as a string outside this union — narrow accordingly
 * before reaching for `IdentifierType.X` access.
 */
export enum IdentifierType {
    CNI = 'CNI',
    PHONE = 'PHONE',
    EMAIL = 'EMAIL',
    UNKNOWN = 'UNKNOWN'
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
    id: string;
    name: string;
    username?: string;
    email: string;
    status: Status;
    picture?: string;
    signature?: string;
    /** Optional. Maximum 13 characters when supplied; null / omitted is allowed. */
    nic?: string | null;
    /**
     * Optional. Must follow E.164 format (e.g. `+1234567890`) when supplied.
     * Send `null` (or omit the field) to indicate "no phone" — an empty string
     * `""` will fail server-side `@Pattern` validation.
     */
    phoneNumber?: string | null;
    /**
     * Mirrors `t_user.email_verified`. True once the user's email has passed
     * the OTP / invitation-acceptance verification flow.
     */
    emailVerified?: boolean;
    /**
     * Free-form metadata mirrored from `t_user.metadata` (jsonb). Exposed
     * through OAuth user-management APIs and enriched into issued JWTs by
     * the authorization server.
     */
    metadata?: Record<string, unknown>;
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
    accept: boolean;
    observation?: string;
}

export interface CodeDescriptionDTO {
    code: string;
    description: string;
}

export interface InvitationDTO {
    id: number,
    /**
     * Phase G2 / multi-identifier — the API surfaces the invited principal
     * as a (type, value) pair so the same invitation flow handles EMAIL,
     * PHONE and CNI identifiers uniformly. The previous `email` field was
     * removed; consumers that displayed the email now branch on
     * `identifierType === 'EMAIL'`.
     */
    identifierType: IdentifierType,
    identifierValue: string,
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

/** Query options for POST /api/m2m/sync/applications/{code}/menus */
export interface SyncApplicationMenusOptions {
    /**
     * When false, role associations on each menu are NOT synchronized (existing
     * role bindings are preserved untouched). Defaults to true on the server.
     */
    syncRoles?: boolean;
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

/**
 * Configuration for the {@link M2MClient}. Authentication uses the OAuth2
 * {@code client_credentials} grant against the Access Management API's
 * authorization server — the client library fetches and caches the
 * Bearer token transparently via {@link ClientCredentialsTokenProvider}.
 *
 * - `clientId` / `clientSecret` — required for the token-fetch.
 * - `serviceId` — optional informational header (`X-Machine-Service-ID`)
 *   sent with every M2M call so the API can log which service made the
 *   call.
 * - `scope` — optional; only set when the OAuth2 client registration
 *   constrains scope.
 * - `token` — legacy static M2M token. Retained for callers that haven't
 *   migrated to client credentials. When both shapes are provided, the
 *   client_credentials path wins.
 */
export interface M2MClientConfig {
    clientId?: string;
    clientSecret?: string;
    scope?: string;
    serviceId?: string;
    /** @deprecated use clientId + clientSecret. */
    token?: string;
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

// =============================================================================
// OAuth2 Authorization Server — client management
// =============================================================================

/** Authorization grants supported by the iGRP authorization server. */
export type OAuthGrantType =
    | 'authorization_code'
    | 'refresh_token'
    | 'client_credentials'
    | 'device_code';

export interface OAuthClientDTO {
    id: string;
    clientId: string;
    /**
     * Returned only on creation so the operator can hand the secret off.
     * Subsequent reads do NOT include it.
     */
    clientSecret?: string;
    clientName?: string;
    description?: string;
    active: boolean;
    /** Owning application id (1 application → N clients). */
    applicationId?: number;
    applicationCode?: string;
    accessTokenTtl: number;
    refreshTokenTtl: number;
    authorizationCodeTtl: number;
    scopes: string[];
    redirectUris: string[];
    grantTypes: OAuthGrantType[] | string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface OAuthClientRequestDTO {
    clientId: string;
    clientName: string;
    description?: string;
    active?: boolean;
    applicationId?: number;
    accessTokenTtl?: number;
    refreshTokenTtl?: number;
    authorizationCodeTtl?: number;
    scopes: string[];
    redirectUris?: string[];
    grantTypes: OAuthGrantType[] | string[];
}

// =============================================================================
// OAuth2 Authorization Server — service-account management
// =============================================================================

/**
 * A service account is a 1:1 owner of an OAuth2 client used for machine-to-
 * machine access. It carries its own roles and (optionally) direct permission
 * grants; the effective permission set at token-issue time is the union of
 * both. Secrets are never surfaced on the service-account endpoints — they
 * live on the linked {@link OAuthClientDTO} and are only visible on that
 * client's creation response.
 */
export interface ServiceAccountDTO {
    id: string;
    name: string;
    description?: string;
    active: boolean;
    /** UUID of the linked OAuth2 client (1:1). */
    oauthClientId: string;
    /** Denormalised for convenience — same as `oauthClient.clientId`. */
    clientId: string;
    applicationId?: number;
    applicationCode?: string;
    roleIds?: number[];
    /** Denormalised role codes matching `roleIds`. */
    roleCodes?: string[];
    /** Permissions granted DIRECTLY on the service account (bypass role layer). */
    permissionIds?: number[];
    /** Denormalised permission names matching `permissionIds`. */
    permissionNames?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface ServiceAccountRequestDTO {
    name: string;
    description?: string;
    active?: boolean;
    /**
     * REQUIRED — the OAuth2 client to link. Create the client first via
     * {@code OAuthClient.createOAuthClient} (grantTypes must include
     * `client_credentials`); its `id` goes here.
     */
    oauthClientId: string;
    applicationId?: number;
    /** Full replacement set — omitted role ids are removed. */
    roleIds?: number[];
    /** Full replacement set — omitted permission ids are removed. */
    permissionIds?: number[];
}

// =============================================================================
// User metadata (free-form JSONB on t_user, surfaced via OAuth identity APIs)
// =============================================================================

export interface UserMetadataDTO {
    userId: string;
    metadata: Record<string, unknown>;
}

export interface UpdateUserMetadataRequestDTO {
    metadata: Record<string, unknown>;
}
import { BaseApiClient } from './base-client.js';
import { ClientCredentialsTokenProvider } from '../auth/client-credentials-token-provider.js';
import {
    ApiClientConfig,
    ApiResponse,
    IGRPUserDTO,
    RoleDTO,
    DepartmentDTO,
    PermissionDTO,
    ApplicationDTO,
    ResourceDTO,
    M2MClientConfig,
    M2MUserQueryOptions,
    M2MRoleQueryOptions,
    M2MDepartmentQueryOptions,
    MenuEntryDTO,
    GlobalConfigurationDTO,
    GlobalConfigurationType,
} from '@/types';

/**
 * Wrapper for the Access Management API's machine-to-machine endpoints
 * (`/api/m2m/**`).
 *
 * Authentication uses the OAuth2 `client_credentials` grant against the
 * API's authorization server (`POST {baseUrl}/oauth2/token`). Configure
 * the credentials once on the constructor and the library fetches +
 * caches the Bearer token for every M2M call:
 *
 * ```ts
 * const m2m = new M2MClient(
 *   { baseUrl: 'https://api.example.com/igrp-access-management' },
 *   { clientId: 'my-service', clientSecret: process.env.MY_SERVICE_SECRET! }
 * );
 *
 * await m2m.syncResources({ name: 'my-service', type: 'API', description: '...' });
 * await m2m.syncPermissions(permissions);
 * ```
 *
 * Legacy `M2MClientConfig.token` is honoured when no clientId/clientSecret
 * pair is set, so existing callers keep working — but new deployments
 * should migrate to client_credentials.
 */
export class M2MClient extends BaseApiClient {

    private static readonly SERVICE_HEADER = 'X-Machine-Service-ID';

    private readonly serviceId?: string;
    private readonly tokenProvider?: ClientCredentialsTokenProvider;
    /** @deprecated retained for legacy static-token callers. */
    private readonly legacyToken?: string;

    constructor(config: ApiClientConfig, m2mConfig?: M2MClientConfig) {
        super(config);
        this.serviceId = m2mConfig?.serviceId;
        if (m2mConfig?.clientId && m2mConfig?.clientSecret) {
            this.tokenProvider = new ClientCredentialsTokenProvider(
                config.baseUrl,
                m2mConfig.clientId,
                m2mConfig.clientSecret,
                m2mConfig.scope,
            );
        } else if (m2mConfig?.token) {
            this.legacyToken = m2mConfig.token;
        }
    }

    /**
     * Get users for business codes with optional filters.
     */
    async getUsersForBusiness(
        identifiers: string[],
        options: M2MUserQueryOptions
    ): Promise<ApiResponse<IGRPUserDTO[]>> {
        return this.post<IGRPUserDTO[]>(
            '/api/m2m/users',
            identifiers,
            { params: options, headers: await this.buildAuthHeaders() }
        );
    }

    /**
     * Sync resources (idempotent upsert).
     */
    async syncResources(resource: ResourceDTO): Promise<ApiResponse<string>> {
        return this.post<string>(
            '/api/m2m/sync/resources',
            resource,
            { params: undefined, headers: await this.buildAuthHeaders() }
        );
    }

    /**
     * Sync permissions (idempotent upsert).
     */
    async syncPermissions(permissions: PermissionDTO[]): Promise<ApiResponse<string>> {
        return this.post<string>(
            '/api/m2m/sync/permissions',
            permissions,
            { params: undefined, headers: await this.buildAuthHeaders() }
        );
    }

    /**
     * Sync applications (idempotent upsert).
     */
    async syncApplications(application: ApplicationDTO): Promise<ApiResponse<string>> {
        return this.post<string>(
            '/api/m2m/sync/applications',
            application,
            { params: undefined, headers: await this.buildAuthHeaders() }
        );
    }

    /**
     * Sync an application's menus.
     *
     * @param applicationCode  target application code
     * @param menus            the menu entries to sync
     * @param syncRoles        when `false`, role associations are NOT synchronized
     *                         (existing role bindings on each menu are preserved
     *                         untouched). Defaults to `true`.
     */
    async syncApplicationMenus(
        applicationCode: string,
        menus: MenuEntryDTO[],
        syncRoles?: boolean,
    ): Promise<ApiResponse<string>> {
        const params = syncRoles !== undefined ? { syncRoles } : undefined;
        return this.post<string>(
            `/api/m2m/sync/applications/${applicationCode}/menus`,
            menus,
            { params, headers: await this.buildAuthHeaders() }
        );
    }

    /**
     * Get roles for business codes with optional filters.
     */
    async getRolesForBusiness(
        identifiers: string[],
        options: M2MRoleQueryOptions
    ): Promise<ApiResponse<RoleDTO[]>> {
        return this.post<RoleDTO[]>(
            '/api/m2m/roles',
            identifiers,
            { params: options, headers: await this.buildAuthHeaders() }
        );
    }


    /**
     * Read a global configuration (branding) with the machine token.
     *
     * Returns the most recently modified row for `type`, identical to the
     * user-scoped `GET /api/global-configuration`.
     *
     * Use this wherever there is no signed-in user — login and invitation
     * pages, or a freshly started app process that has not yet served an
     * authenticated request. Those render default colours and logos if the
     * Brand can only be fetched with a session token.
     *
     * Read-only: writing a configuration still requires a user token and the
     * `igrp.applications.customize` permission.
     *
     * @throws 400 when `type` is not a known configuration type
     * @throws 404 when nothing has been saved for that type
     */
    async getGlobalConfiguration(
        type: GlobalConfigurationType | string
    ): Promise<ApiResponse<GlobalConfigurationDTO>> {
        return this.get<GlobalConfigurationDTO>(
            '/api/m2m/global-configuration',
            { params: { type }, headers: await this.buildAuthHeaders() }
        );
    }

    /**
     * Get departments for business codes with optional filters.
     */
    async getDepartmentsForBusiness(
        identifiers: string[],
        options: M2MDepartmentQueryOptions
    ): Promise<ApiResponse<DepartmentDTO[]>> {
        return this.post<DepartmentDTO[]>(
            '/api/m2m/departments',
            identifiers,
            { params: options, headers: await this.buildAuthHeaders() }
        );
    }

    /**
     * Build the per-call header map: always includes the informational
     * `X-Machine-Service-ID` (when configured), and either the
     * client-credentials-derived `Authorization: Bearer <token>` or the
     * legacy `X-Machine-Auth-Token` static header. Centralised here so
     * every M2M call shares one auth path.
     */
    private async buildAuthHeaders(): Promise<Record<string, string>> {
        const headers: Record<string, string> = {};
        if (this.serviceId) {
            headers[M2MClient.SERVICE_HEADER] = this.serviceId;
        }
        if (this.tokenProvider) {
            const token = await this.tokenProvider.getAccessToken();
            headers['Authorization'] = `Bearer ${token}`;
        } else if (this.legacyToken) {
            // Legacy static-token path — kept for backwards compatibility.
            headers['X-Machine-Auth-Token'] = this.legacyToken;
        }
        return headers;
    }
}

import {ApiClientConfig, M2MClientConfig} from '@/types';
import { ApplicationClient } from './application-client.js';
import { DepartmentClient } from './department-client.js';
import { RoleClient } from './role-client.js';
import { UserClient } from './user-client.js';
import { GlobalConfigurationClient } from "./global-configuration-client.js";
import { FileClient } from "./file-client.js";
import { AuthorizeClient } from "./authorize-client.js";
import {M2MClient} from "./m2m-client";
import { SessionClient } from "./session-client.js";
import { AdminSessionClient } from "./admin-session-client.js";
import { AuthAuditClient } from "./auth-audit-client.js";
import { OAuthClient } from "./oauth-client.js";
import { ServiceAccountClient } from "./service-account-client.js";

/**
 * Main Access Management API Client
 * Provides access to Resources, Permissions, and Menu management
 */
export class AccessManagementClient {
    public readonly applications: ApplicationClient;
    public readonly departments: DepartmentClient;
    public readonly roles: RoleClient;
    public readonly users: UserClient;
    public readonly globalConfiguration: GlobalConfigurationClient;
    public readonly files: FileClient;
    public readonly authorize: AuthorizeClient;
    public readonly m2m: M2MClient;
    public readonly sessions: SessionClient;
    public readonly adminSessions: AdminSessionClient;
    public readonly authAudit: AuthAuditClient;
    public readonly oauthClients: OAuthClient;
    public readonly serviceAccounts: ServiceAccountClient;

    constructor(config: ApiClientConfig, m2mConfig?: M2MClientConfig) {
        this.applications = new ApplicationClient(config);
        this.departments = new DepartmentClient(config);
        this.roles = new RoleClient(config);
        this.users = new UserClient(config);
        this.globalConfiguration = new GlobalConfigurationClient(config);
        this.files = new FileClient(config);
        this.authorize = new AuthorizeClient(config);
        // M2MClient handles auth internally via OAuth2 client_credentials
        // (or the legacy static token when clientId/clientSecret aren't
        // supplied) — no need to bake auth headers into the base config.
        this.m2m = new M2MClient(config, m2mConfig);
        this.sessions = new SessionClient(config);
        this.adminSessions = new AdminSessionClient(config);
        this.authAudit = new AuthAuditClient(config);
        this.oauthClients = new OAuthClient(config);
        this.serviceAccounts = new ServiceAccountClient(config);
    }

    /**
     * Create a client instance with custom configuration
     */
    static create(config: ApiClientConfig, m2mConfig?: M2MClientConfig): AccessManagementClient {
        return new AccessManagementClient(config, m2mConfig);
    }
}
import { BaseApiClient } from './base-client.js';
import {
    ApiResponse,
    ServiceAccountDTO,
    ServiceAccountRequestDTO,
} from '@/types';

/**
 * Administrative client for managing service accounts on the iGRP
 * authorization server.
 *
 * <p>A service account is a 1:1 owner of an OAuth2 client used for
 * machine-to-machine access. The linked OAuth2 client (and its secret) is
 * NOT managed here — create it first via {@link import('./oauth-client.js').OAuthClient#createOAuthClient}
 * (with {@code grantTypes: ['client_credentials']}), then pass its id as
 * {@code ServiceAccountRequestDTO.oauthClientId} on
 * {@link ServiceAccountClient#createServiceAccount}.
 *
 * <p>PUT ({@link ServiceAccountClient#updateServiceAccount}) uses
 * REPLACEMENT semantics on {@code roleIds} and {@code permissionIds} —
 * omitted ids are unassigned. Effective permissions at token-issue time are
 * the UNION of role-inherited and directly-granted permissions.
 */
export class ServiceAccountClient extends BaseApiClient {
    /**
     * List all service accounts.
     */
    async listServiceAccounts(): Promise<ApiResponse<ServiceAccountDTO[]>> {
        return this.get<ServiceAccountDTO[]>('/api/service-accounts');
    }

    /**
     * Get a single service account by id, including its assigned role codes
     * and directly-granted permission names.
     */
    async getServiceAccount(id: string): Promise<ApiResponse<ServiceAccountDTO>> {
        return this.get<ServiceAccountDTO>(`/api/service-accounts/${id}`);
    }

    /**
     * Create a new service account linked to an existing OAuth2 client.
     * The response does NOT include a secret — the secret was surfaced
     * on the OAuth2 client's creation response and is not recoverable
     * afterwards.
     */
    async createServiceAccount(
        request: ServiceAccountRequestDTO,
    ): Promise<ApiResponse<ServiceAccountDTO>> {
        return this.post<ServiceAccountDTO>('/api/service-accounts', request);
    }

    /**
     * Replace a service account's mutable fields (name, description,
     * active flag, application, roles, direct permissions).
     * {@code roleIds} and {@code permissionIds} use REPLACEMENT semantics —
     * ids omitted from the request are removed from the account.
     */
    async updateServiceAccount(
        id: string,
        request: ServiceAccountRequestDTO,
    ): Promise<ApiResponse<ServiceAccountDTO>> {
        return this.put<ServiceAccountDTO>(`/api/service-accounts/${id}`, request);
    }

    /**
     * Delete a service account. This does NOT delete the linked OAuth2
     * client — that must be removed separately via
     * {@link import('./oauth-client.js').OAuthClient#deleteOAuthClient}
     * if the client is no longer needed.
     */
    async deleteServiceAccount(id: string): Promise<ApiResponse<void>> {
        return this.delete<void>(`/api/service-accounts/${id}`);
    }
}

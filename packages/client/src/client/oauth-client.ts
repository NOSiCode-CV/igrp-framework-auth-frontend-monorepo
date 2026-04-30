import { BaseApiClient } from './base-client.js';
import {
    ApiResponse,
    OAuthClientDTO,
    OAuthClientRequestDTO,
} from '@/types';

/**
 * Administrative client for managing OAuth2 clients persisted in the
 * iGRP authorization server.
 *
 * <p>The raw client secret is returned only on {@link OAuthClient#createOAuthClient}
 * — read operations do not surface it.
 */
export class OAuthClient extends BaseApiClient {
    /**
     * List all OAuth2 clients.
     */
    async listOAuthClients(): Promise<ApiResponse<OAuthClientDTO[]>> {
        return this.get<OAuthClientDTO[]>('/api/clients');
    }

    /**
     * Get a single OAuth2 client by id.
     */
    async getOAuthClient(id: string): Promise<ApiResponse<OAuthClientDTO>> {
        return this.get<OAuthClientDTO>(`/api/clients/${id}`);
    }

    /**
     * Create a new OAuth2 client. The raw {@code clientSecret} is returned in
     * the response body and must be captured by the caller — it is not
     * recoverable afterwards.
     */
    async createOAuthClient(
        request: OAuthClientRequestDTO,
    ): Promise<ApiResponse<OAuthClientDTO>> {
        return this.post<OAuthClientDTO>('/api/clients', request);
    }

    /**
     * Update an existing OAuth2 client.
     */
    async updateOAuthClient(
        id: string,
        request: OAuthClientRequestDTO,
    ): Promise<ApiResponse<OAuthClientDTO>> {
        return this.put<OAuthClientDTO>(`/api/clients/${id}`, request);
    }

    /**
     * Delete an OAuth2 client.
     */
    async deleteOAuthClient(id: string): Promise<ApiResponse<void>> {
        return this.delete<void>(`/api/clients/${id}`);
    }
}

import { BaseApiClient } from './base-client.js';
import {ApiResponse, PermissionCheckRequestDTO, PermissionCheckResponseDTO} from '@/types';

export class AuthorizeClient extends BaseApiClient {
    /**
     * Check if a user is authorized for a specific action on a resource
     */
    async checkAuthorization(
        request: PermissionCheckRequestDTO
    ): Promise<ApiResponse<PermissionCheckResponseDTO>> {
        return this.post<PermissionCheckResponseDTO>('/api/authorize/check', request);
    }

    /**
     * Batch check multiple authorization requests
     */
    async batchCheckAuthorization(
        requests: PermissionCheckRequestDTO[]
    ): Promise<ApiResponse<PermissionCheckResponseDTO>> {
        return this.post<PermissionCheckResponseDTO>('/api/authorize/batch-check', requests);
    }
}
import { BaseApiClient } from './base-client.js';
import {
    ApiResponse,
    RoleDTO,
} from '@/types';

export class RoleClient extends BaseApiClient {

    /**
     * Get a specific role by ID
     */
    async getRoleById(id: number): Promise<ApiResponse<RoleDTO>> {
        return this.get<RoleDTO>(`/api/roles/${id}`);
    }

    /**
     * Get a specific role by code
     */
    async getRoleByCode(code: string): Promise<ApiResponse<RoleDTO>> {
        return this.get<RoleDTO>(`/api/roles/by-code/${code}`);
    }

}
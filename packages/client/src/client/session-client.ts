import { BaseApiClient } from './base-client.js';
import {
    ApiResponse,
    SessionResponseDTO,
    SessionInitRequestDTO,
    SessionRefreshRequestDTO
} from '@/types';

export class SessionClient extends BaseApiClient {
    /**
     * Get the current active session for the authenticated user
     */
    async getCurrentSession(): Promise<ApiResponse<SessionResponseDTO>> {
        return this.get<SessionResponseDTO>('/api/session');
    }

    /**
     * Initialize a new session for the authenticated user
     */
    async initializeSession(request: SessionInitRequestDTO): Promise<ApiResponse<SessionResponseDTO>> {
        return this.post<SessionResponseDTO>('/api/session/init', request);
    }

    /**
     * Refresh the current active session
     */
    async refreshSession(request?: SessionRefreshRequestDTO): Promise<ApiResponse<SessionResponseDTO>> {
        return this.post<SessionResponseDTO>('/api/session/refresh', request);
    }

    /**
     * Close the current active session
     */
    async closeSession(): Promise<ApiResponse<void>> {
        return this.post<void>('/api/session/close');
    }

    /**
     * Rotate the current session (close and create new)
     */
    async rotateSession(request: SessionInitRequestDTO): Promise<ApiResponse<SessionResponseDTO>> {
        return this.post<SessionResponseDTO>('/api/session/rotate', request);
    }
}

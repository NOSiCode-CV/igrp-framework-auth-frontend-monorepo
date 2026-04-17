import { BaseApiClient } from './base-client.js';
import {
    ApiResponse,
    SessionResponseDTO,
    SessionKillRequestDTO,
    SessionStatisticsDTO,
    SessionFilters,
    SessionsByRoleFilters,
    PageResponse
} from '@/types';

export class AdminSessionClient extends BaseApiClient {
    /**
     * List sessions with optional status filtering and pagination
     */
    async listSessions(filters?: SessionFilters): Promise<ApiResponse<PageResponse<SessionResponseDTO>>> {
        return this.get<PageResponse<SessionResponseDTO>>('/api/admin/sessions', filters);
    }

    /**
     * Get the current active session for a specific user
     */
    async getUserSession(userExternalId: string): Promise<ApiResponse<SessionResponseDTO>> {
        return this.get<SessionResponseDTO>(`/api/admin/sessions/users/${userExternalId}`);
    }

    /**
     * Kill a specific session by ID
     */
    async killSession(sessionId: string, request: SessionKillRequestDTO): Promise<ApiResponse<void>> {
        return this.post<void>(`/api/admin/sessions/${sessionId}/kill`, request);
    }

    /**
     * List sessions by role with optional department and status filtering
     */
    async listSessionsByRole(roleCode: string, filters?: SessionsByRoleFilters): Promise<ApiResponse<PageResponse<SessionResponseDTO>>> {
        return this.get<PageResponse<SessionResponseDTO>>(`/api/admin/sessions/roles/${roleCode}`, filters);
    }

    /**
     * Kill all active sessions for users with a specific role
     */
    async killSessionsByRole(roleCode: string, request: SessionKillRequestDTO, departmentCode?: string): Promise<ApiResponse<void>> {
        const params = departmentCode ? { departmentCode } : undefined;
        const url = params
            ? `/api/admin/sessions/roles/${roleCode}/kill?departmentCode=${departmentCode}`
            : `/api/admin/sessions/roles/${roleCode}/kill`;
        return this.post<void>(url, request);
    }

    /**
     * Kill all active sessions for users in a specific department
     */
    async killSessionsByDepartment(departmentCode: string, request: SessionKillRequestDTO): Promise<ApiResponse<void>> {
        return this.post<void>(`/api/admin/sessions/departments/${departmentCode}/kill`, request);
    }

    /**
     * Get session statistics
     */
    async getSessionStatistics(): Promise<ApiResponse<SessionStatisticsDTO>> {
        return this.get<SessionStatisticsDTO>('/api/admin/sessions/statistics');
    }
}

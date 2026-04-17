import { BaseApiClient } from './base-client.js';
import {
    ApiResponse,
    SecurityAuditLogDTO,
    AuditLogFilters,
    PageResponse
} from '@/types';

export class AuthAuditClient extends BaseApiClient {
    /**
     * List all audit logs with pagination
     */
    async listAuditLogs(filters?: AuditLogFilters): Promise<ApiResponse<PageResponse<SecurityAuditLogDTO>>> {
        return this.get<PageResponse<SecurityAuditLogDTO>>('/api/auth/audit', filters);
    }

    /**
     * Get a specific audit log entry by ID
     */
    async getAuditLogById(id: number): Promise<ApiResponse<SecurityAuditLogDTO>> {
        return this.get<SecurityAuditLogDTO>(`/api/auth/audit/${id}`);
    }

    /**
     * Get audit logs for a specific user
     */
    async getAuditLogsByUserId(userId: string, filters?: AuditLogFilters): Promise<ApiResponse<PageResponse<SecurityAuditLogDTO>>> {
        return this.get<PageResponse<SecurityAuditLogDTO>>(`/api/auth/audit/user/${userId}`, filters);
    }
}

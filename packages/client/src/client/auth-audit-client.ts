import { BaseApiClient } from './base-client.js';
import {
    ApiResponse,
    AuditLogDTO,
    AuditLogFilters,
    AuditChainValidationResult,
    AuditPurgeResult,
    PageResponse
} from '@/types';

/**
 * Client for the unified, tamper-evident audit log (`/api/auth/audit`).
 *
 * Replaces the legacy three-endpoint shape: the former `/`, `/{id}` and
 * `/user/{userId}` GETs collapsed into a single filtered, paginated
 * {@link listAuditLogs}. Tamper-evidence controls were added — {@link validate}
 * verifies the hash chain on demand and {@link purge} clears the trail (gated
 * separately server-side by `igrp.audit.purge`).
 */
export class AuthAuditClient extends BaseApiClient {
    /**
     * Paginated, filtered view of the unified audit log.
     */
    async listAuditLogs(filters?: AuditLogFilters): Promise<ApiResponse<PageResponse<AuditLogDTO>>> {
        return this.get<PageResponse<AuditLogDTO>>('/api/auth/audit', filters);
    }

    /**
     * Verify the tamper-evident hash chain on demand.
     */
    async validate(): Promise<ApiResponse<AuditChainValidationResult>> {
        return this.post<AuditChainValidationResult>('/api/auth/audit/validate', undefined, { params: undefined });
    }

    /**
     * Purge every audit row except the GENESIS anchor and restart the chain.
     * Gated by `igrp.audit.purge`.
     */
    async purge(): Promise<ApiResponse<AuditPurgeResult>> {
        return this.delete<AuditPurgeResult>('/api/auth/audit/purge', undefined, { params: undefined });
    }
}

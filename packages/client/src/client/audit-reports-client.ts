import { BaseApiClient } from './base-client.js';
import {
    AccessReportFilters,
    AccessReportRowDTO,
    ApiResponse,
    AuditReportFileDTO,
    AuditReportFileFilters,
    AuditReportFilters,
    AuditReportRowDTO,
    PageResponse,
    ReportFormat,
    SettingsReportFilters,
    SettingsReportRowDTO
} from '@/types';

/**
 * Client for the reporting surface over the unified audit log
 * (`/api/auth/reports`).
 *
 * Exposes the three paginated JSON reports (Audit / Access / Settings), their
 * PDF, Excel and CSV export variants, and the report archive. All endpoints are
 * gated server-side by the single `igrp.audit.view` permission. `startDate` /
 * `endDate` are required on every call; a missing bound yields a 400. Export
 * methods take the same filters as their JSON siblings, minus pagination, and
 * resolve to a `Blob`.
 *
 * Two ways to get a document:
 *
 * - **Download** (`get*Xlsx` / `get*Pdf` / `get*Csv`) — resolves to the bytes.
 * - **Archive** (`archive*`) — the server stores the document and returns an
 *   {@link AuditReportFileDTO}. Take its `filePath` and resolve it through the
 *   files client for a short-lived presigned link; the archive call downloads
 *   nothing itself.
 */
export class AuditReportsClient extends BaseApiClient {

    // ------------------------------------------------------------------ JSON

    /** Audit Report — `GET /api/auth/reports/audit`. */
    async getAuditReport(filters: AuditReportFilters): Promise<ApiResponse<PageResponse<AuditReportRowDTO>>> {
        return this.get<PageResponse<AuditReportRowDTO>>('/api/auth/reports/audit', filters);
    }

    /** Access Report — `GET /api/auth/reports/access`. */
    async getAccessReport(filters: AccessReportFilters): Promise<ApiResponse<PageResponse<AccessReportRowDTO>>> {
        return this.get<PageResponse<AccessReportRowDTO>>('/api/auth/reports/access', filters);
    }

    /** Settings Report — `GET /api/auth/reports/settings`. */
    async getSettingsReport(filters: SettingsReportFilters): Promise<ApiResponse<PageResponse<SettingsReportRowDTO>>> {
        return this.get<PageResponse<SettingsReportRowDTO>>('/api/auth/reports/settings', filters);
    }

    // --------------------------------------------------------------- Exports

    /** Audit Report as XLSX — `GET /api/auth/reports/audit.xlsx`. */
    async getAuditReportXlsx(filters: AuditReportFilters): Promise<ApiResponse<Blob>> {
        return this.getBlob('/api/auth/reports/audit.xlsx', stripPaging(filters));
    }

    /** Audit Report as PDF — `GET /api/auth/reports/audit.pdf`. */
    async getAuditReportPdf(filters: AuditReportFilters): Promise<ApiResponse<Blob>> {
        return this.getBlob('/api/auth/reports/audit.pdf', stripPaging(filters));
    }

    /** Access Report as XLSX — `GET /api/auth/reports/access.xlsx`. */
    async getAccessReportXlsx(filters: AccessReportFilters): Promise<ApiResponse<Blob>> {
        return this.getBlob('/api/auth/reports/access.xlsx', stripPaging(filters));
    }

    /** Access Report as PDF — `GET /api/auth/reports/access.pdf`. */
    async getAccessReportPdf(filters: AccessReportFilters): Promise<ApiResponse<Blob>> {
        return this.getBlob('/api/auth/reports/access.pdf', stripPaging(filters));
    }

    /** Settings Report as XLSX — `GET /api/auth/reports/settings.xlsx`. */
    async getSettingsReportXlsx(filters: SettingsReportFilters): Promise<ApiResponse<Blob>> {
        return this.getBlob('/api/auth/reports/settings.xlsx', stripPaging(filters));
    }

    /** Settings Report as PDF — `GET /api/auth/reports/settings.pdf`. */
    async getSettingsReportPdf(filters: SettingsReportFilters): Promise<ApiResponse<Blob>> {
        return this.getBlob('/api/auth/reports/settings.pdf', stripPaging(filters));
    }

    /** Audit Report as CSV — `GET /api/auth/reports/audit.csv`. */
    async getAuditReportCsv(filters: AuditReportFilters): Promise<ApiResponse<Blob>> {
        return this.getBlob('/api/auth/reports/audit.csv', stripPaging(filters));
    }

    /** Access Report as CSV — `GET /api/auth/reports/access.csv`. */
    async getAccessReportCsv(filters: AccessReportFilters): Promise<ApiResponse<Blob>> {
        return this.getBlob('/api/auth/reports/access.csv', stripPaging(filters));
    }

    /** Settings Report as CSV — `GET /api/auth/reports/settings.csv`. */
    async getSettingsReportCsv(filters: SettingsReportFilters): Promise<ApiResponse<Blob>> {
        return this.getBlob('/api/auth/reports/settings.csv', stripPaging(filters));
    }

    // --------------------------------------------------------------- Archive

    /**
     * Archive the Audit Report — `POST /api/auth/reports/audit/archive`.
     * The server generates the document in `format`, stores it, and returns the
     * record. Resolve `filePath` through the files client to download it.
     */
    async archiveAuditReport(
        format: ReportFormat | string,
        filters: AuditReportFilters
    ): Promise<ApiResponse<AuditReportFileDTO>> {
        return this.post<AuditReportFileDTO>('/api/auth/reports/audit/archive', undefined, {
            params: {...stripPaging(filters), format}
        });
    }

    /** Archive the Access Report — `POST /api/auth/reports/access/archive`. */
    async archiveAccessReport(
        format: ReportFormat | string,
        filters: AccessReportFilters
    ): Promise<ApiResponse<AuditReportFileDTO>> {
        return this.post<AuditReportFileDTO>('/api/auth/reports/access/archive', undefined, {
            params: {...stripPaging(filters), format}
        });
    }

    /** Archive the Settings Report — `POST /api/auth/reports/settings/archive`. */
    async archiveSettingsReport(
        format: ReportFormat | string,
        filters: SettingsReportFilters
    ): Promise<ApiResponse<AuditReportFileDTO>> {
        return this.post<AuditReportFileDTO>('/api/auth/reports/settings/archive', undefined, {
            params: {...stripPaging(filters), format}
        });
    }

    /**
     * List archived report exports, newest first —
     * `GET /api/auth/reports/archives`. All filters are optional.
     */
    async listArchives(filters?: AuditReportFileFilters): Promise<ApiResponse<PageResponse<AuditReportFileDTO>>> {
        return this.get<PageResponse<AuditReportFileDTO>>('/api/auth/reports/archives', filters);
    }
}

/**
 * Export endpoints stream every matching row and take no pagination, so drop
 * `page` / `size` / `sort` from the query (mirrors the Java SDK). Returns a new
 * object; the caller's filter is left untouched.
 */
function stripPaging<T extends { page?: number; size?: number; sort?: string }>(
    filters: T
): Omit<T, 'page' | 'size' | 'sort'> {
    const { page, size, sort, ...rest } = filters;
    void page; void size; void sort;
    return rest;
}

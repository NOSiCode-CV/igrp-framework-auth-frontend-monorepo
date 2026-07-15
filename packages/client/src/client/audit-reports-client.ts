import { BaseApiClient } from './base-client.js';
import {
    AccessReportFilters,
    AccessReportRowDTO,
    ApiResponse,
    AuditReportFilters,
    AuditReportRowDTO,
    PageResponse,
    SettingsReportFilters,
    SettingsReportRowDTO
} from '@/types';

/**
 * Client for the reporting surface over the unified audit log
 * (`/api/auth/reports`).
 *
 * Exposes the three paginated JSON reports (Audit / Access / Settings) plus
 * their PDF and Excel export variants. All endpoints are gated server-side by
 * the single `igrp.audit.view` permission. `startDate` / `endDate` are required
 * on every call; a missing bound yields a 400. Export methods take the same
 * filters as their JSON siblings, minus pagination, and resolve to a `Blob`.
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

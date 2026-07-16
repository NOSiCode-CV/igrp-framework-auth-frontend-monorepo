import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditReportsClient } from '../src/client/audit-reports-client';

const mockGet = vi.fn();
const mockGetBlob = vi.fn();
const mockPost = vi.fn();

vi.mock('../src/client/base-client.ts', () => {
    return {
        BaseApiClient: class {
            get = mockGet;
            getBlob = mockGetBlob;
            post = mockPost;
        }
    };
});

describe('AuditReportsClient', () => {
    let client: AuditReportsClient;
    const mockConfig = { baseUrl: 'https://api.example.com', timeout: 5000 };
    const dates = { startDate: '2026-07-01T00:00:00Z', endDate: '2026-07-15T23:59:59Z' };

    beforeEach(() => {
        client = new AuditReportsClient(mockConfig);
        vi.clearAllMocks();
    });

    // ------------------------------------------------------------------ JSON

    describe('getAuditReport', () => {
        it('should GET the audit report with the full filter object', async () => {
            const mockResponse = { content: [{ id: 'a1', username: 'alice', status: 'SUCCESS' }], totalElements: 1 };
            mockGet.mockResolvedValue(mockResponse);

            const filters = { ...dates, username: 'alice', page: 0, size: 20 };
            const result = await client.getAuditReport(filters);

            expect(mockGet).toHaveBeenCalledWith('/api/auth/reports/audit', filters);
            expect(result).toBe(mockResponse);
        });
    });

    describe('getAccessReport', () => {
        it('should GET the access report', async () => {
            const mockResponse = { content: [], totalElements: 0 };
            mockGet.mockResolvedValue(mockResponse);

            const filters = { ...dates, role: 'ADMIN' };
            const result = await client.getAccessReport(filters);

            expect(mockGet).toHaveBeenCalledWith('/api/auth/reports/access', filters);
            expect(result).toBe(mockResponse);
        });
    });

    describe('getSettingsReport', () => {
        it('should GET the settings report', async () => {
            const mockResponse = { content: [], totalElements: 0 };
            mockGet.mockResolvedValue(mockResponse);

            const filters = { ...dates, area: 'APPLICATIONS' };
            const result = await client.getSettingsReport(filters);

            expect(mockGet).toHaveBeenCalledWith('/api/auth/reports/settings', filters);
            expect(result).toBe(mockResponse);
        });
    });

    // --------------------------------------------------------------- Exports

    describe('exports', () => {
        it('should GET a Blob from the xlsx endpoint and strip pagination', async () => {
            const blob = new Blob(['xlsx']);
            mockGetBlob.mockResolvedValue({ data: blob, status: 200, statusText: 'OK' });

            const filters = { ...dates, username: 'alice', page: 3, size: 50, sort: 'timestamp,desc' };
            const result = await client.getAuditReportXlsx(filters);

            expect(result.data).toBe(blob);
            expect(mockGetBlob).toHaveBeenCalledWith('/api/auth/reports/audit.xlsx', {
                startDate: dates.startDate,
                endDate: dates.endDate,
                username: 'alice'
            });
            // pagination must not leak into export query params
            const sentParams = mockGetBlob.mock.calls[0][1];
            expect(sentParams).not.toHaveProperty('page');
            expect(sentParams).not.toHaveProperty('size');
            expect(sentParams).not.toHaveProperty('sort');
        });

        it('should GET a Blob from the pdf endpoint', async () => {
            const blob = new Blob(['%PDF']);
            mockGetBlob.mockResolvedValue({ data: blob, status: 200, statusText: 'OK' });

            const result = await client.getSettingsReportPdf({ ...dates, area: 'USERS' });

            expect(result.data).toBe(blob);
            expect(mockGetBlob).toHaveBeenCalledWith('/api/auth/reports/settings.pdf', {
                startDate: dates.startDate,
                endDate: dates.endDate,
                area: 'USERS'
            });
        });

        it('should cover access + settings xlsx and access pdf endpoints', async () => {
            mockGetBlob.mockResolvedValue({ data: new Blob(['x']), status: 200, statusText: 'OK' });

            await client.getAccessReportXlsx({ ...dates });
            await client.getAccessReportPdf({ ...dates });
            await client.getSettingsReportXlsx({ ...dates });
            await client.getAuditReportPdf({ ...dates });

            const endpoints = mockGetBlob.mock.calls.map((c) => c[0]);
            expect(endpoints).toEqual([
                '/api/auth/reports/access.xlsx',
                '/api/auth/reports/access.pdf',
                '/api/auth/reports/settings.xlsx',
                '/api/auth/reports/audit.pdf'
            ]);
        });

        it('should GET csv exports without pagination', async () => {
            mockGetBlob.mockResolvedValue({ data: new Blob(['﻿ID,Username\r\n']), status: 200, statusText: 'OK' });

            await client.getAuditReportCsv({ ...dates, username: 'alice', page: 2, size: 50, sort: 'timestamp,desc' });
            await client.getAccessReportCsv({ ...dates });
            await client.getSettingsReportCsv({ ...dates });

            const endpoints = mockGetBlob.mock.calls.map((c) => c[0]);
            expect(endpoints).toEqual([
                '/api/auth/reports/audit.csv',
                '/api/auth/reports/access.csv',
                '/api/auth/reports/settings.csv'
            ]);
            // exports stream every matching row — pagination must not leak through
            expect(mockGetBlob.mock.calls[0][1]).toEqual({
                startDate: dates.startDate,
                endDate: dates.endDate,
                username: 'alice'
            });
        });
    });

    // --------------------------------------------------------------- Archive

    describe('archive', () => {
        it('should POST the audit archive with format alongside the filters, minus pagination', async () => {
            const stored = {
                id: 'f1',
                reportType: 'AUDIT',
                format: 'XLSX',
                filePath: 'private/audit-reports/alice/uuid_audit-report-2026-07-16.xlsx',
                rowCount: 42
            };
            mockPost.mockResolvedValue({ data: stored, status: 200, statusText: 'OK' });

            const result = await client.archiveAuditReport('XLSX', { ...dates, username: 'alice', page: 1, size: 10 });

            expect(result.data).toBe(stored);
            expect(mockPost).toHaveBeenCalledWith('/api/auth/reports/audit/archive', undefined, {
                params: {
                    startDate: dates.startDate,
                    endDate: dates.endDate,
                    username: 'alice',
                    format: 'XLSX'
                }
            });
        });

        it('should POST access and settings archives to their own endpoints', async () => {
            mockPost.mockResolvedValue({ data: { id: 'f2', filePath: 'private/audit-reports/x' }, status: 200, statusText: 'OK' });

            await client.archiveAccessReport('CSV', { ...dates });
            await client.archiveSettingsReport('PDF', { ...dates });

            const endpoints = mockPost.mock.calls.map((c) => c[0]);
            expect(endpoints).toEqual([
                '/api/auth/reports/access/archive',
                '/api/auth/reports/settings/archive'
            ]);
            expect(mockPost.mock.calls[0][2].params.format).toBe('CSV');
            expect(mockPost.mock.calls[1][2].params.format).toBe('PDF');
        });

        it('should GET the archive list with filters', async () => {
            const mockResponse = {
                data: { content: [{ id: 'f1', filePath: 'private/audit-reports/alice/x.csv' }], totalElements: 1 },
                status: 200,
                statusText: 'OK'
            };
            mockGet.mockResolvedValue(mockResponse);

            const filters = { reportType: 'SETTINGS', format: 'CSV', generatedBy: 'alice', page: 0, size: 20 };
            const result = await client.listArchives(filters);

            expect(mockGet).toHaveBeenCalledWith('/api/auth/reports/archives', filters);
            expect(result).toBe(mockResponse);
        });

        it('should GET the archive list with no filters at all', async () => {
            mockGet.mockResolvedValue({ data: { content: [], totalElements: 0 }, status: 200, statusText: 'OK' });

            await client.listArchives();

            // no required date bounds here, unlike the reports
            expect(mockGet).toHaveBeenCalledWith('/api/auth/reports/archives', undefined);
        });
    });
});

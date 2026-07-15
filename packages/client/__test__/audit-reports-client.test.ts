import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditReportsClient } from '../src/client/audit-reports-client';

const mockGet = vi.fn();
const mockGetBlob = vi.fn();

vi.mock('../src/client/base-client.ts', () => {
    return {
        BaseApiClient: class {
            get = mockGet;
            getBlob = mockGetBlob;
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
    });
});

import {ApiClientConfig, ApiResponse, UploadFileOptions, UserFilters,
    M2MDepartmentQueryOptions, M2MRoleQueryOptions, M2MUserQueryOptions,
    SyncApplicationMenusOptions,
    ArchiveAuditReportParams, ArchiveAccessReportParams, ArchiveSettingsReportParams
} from '@/types';
import type { ProblemDetail, IgrpErrorCode } from '../errors/error-codes.js';

export class BaseApiClient {
    protected baseUrl: string;
    protected timeout: number;
    protected defaultHeaders: Record<string, string>;

    constructor(config: ApiClientConfig) {
        this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.timeout = config.timeout || 30000; // 30 seconds default
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...config.headers
        };
    }

    protected async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        // For FormData, exclude Content-Type from defaultHeaders
        const isFormDataBody = options.body instanceof FormData;
        const defaultHeadersToUse = isFormDataBody
            ? Object.fromEntries(
                Object.entries(this.defaultHeaders).filter(
                    ([key]) => key.toLowerCase() !== 'content-type'
                )
            )
            : this.defaultHeaders;

        const requestOptions: RequestInit = {
            ...options,
            headers: {
                ...defaultHeadersToUse,
                ...options.headers
            },
            signal: controller.signal
        };

        try {
            const response = await fetch(url, requestOptions);

            clearTimeout(timeoutId);

            if (!response.ok) {
                await this.handleErrorResponse(response);
            }

            const data = await this.parseResponse<T>(response);

            return {
                data,
                status: response.status,
                statusText: response.statusText
            };
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof ApiClientError) {
                throw error;
            }

            throw new ApiClientError({
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                status: 0,
                details: error
            });
        }
    }

    protected async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
        return this.request<T>(this.appendQueryString(endpoint, params), {method: 'GET'});
    }

    /**
     * Download a binary payload (e.g. the PDF/XLSX report exports) as a
     * {@link Blob}. Unlike {@link get}, this bypasses JSON parsing and sends
     * `Accept: * / *` so the server negotiates the binary content type. On a
     * non-2xx response the shared {@link handleErrorResponse} path runs, so
     * callers get the same {@link ApiClientError} shape as JSON endpoints.
     */
    protected async getBlob(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<Blob>> {
        const url = `${this.baseUrl}${this.appendQueryString(endpoint, params)}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        // Reuse configured auth/custom headers, but accept any content type and
        // never advertise a JSON body.
        const headers: Record<string, string> = Object.fromEntries(
            Object.entries(this.defaultHeaders).filter(
                ([key]) => key.toLowerCase() !== 'content-type' && key.toLowerCase() !== 'accept'
            )
        );
        headers['Accept'] = '*/*';

        try {
            const response = await fetch(url, {method: 'GET', headers, signal: controller.signal});
            clearTimeout(timeoutId);

            if (!response.ok) {
                await this.handleErrorResponse(response);
            }

            const data = await response.blob();
            return {data, status: response.status, statusText: response.statusText};
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof ApiClientError) {
                throw error;
            }
            throw new ApiClientError({
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                status: 0,
                details: error
            });
        }
    }

    protected async post<T>(
        endpoint: string,
        body?: any,
        params?: { params: UserFilters | UploadFileOptions | M2MDepartmentQueryOptions | M2MRoleQueryOptions | M2MUserQueryOptions | SyncApplicationMenusOptions | ArchiveAuditReportParams | ArchiveAccessReportParams | ArchiveSettingsReportParams | undefined,
            headers?: Record<string, string> }
    ): Promise<ApiResponse<T>> {
        // Build query string from params.params, not the whole params object
        const url = this.appendQueryString(endpoint, params?.params);

        const isFormData = (typeof FormData !== 'undefined') && body instanceof FormData;

        // For FormData, don't set Content-Type - let browser set it with boundary
        // Also exclude Content-Type from defaultHeaders when FormData is used
        const headers: Record<string, string> = {};
        
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }
        
        // Only add custom headers if not FormData, or if they're not Content-Type
        if (params?.headers) {
            Object.entries(params.headers).forEach(([key, value]) => {
                if (!isFormData || key.toLowerCase() !== 'content-type') {
                    headers[key] = value;
                }
            });
        }

        return this.request<T>(url, {
            method: 'POST',
            body: isFormData ? (body as FormData) : this.serialiseBody(body, headers),
            headers
        });
    }

    /**
     * Serialise a request body for the Content-Type actually being sent.
     *
     * JSON is the default and is stringified. When a caller overrides
     * Content-Type — `application/xml`, `text/plain` — a string body is sent
     * verbatim: JSON.stringify would wrap it in quotes and escape it, so the
     * server received `"<test>123</test>"` instead of `<test>123</test>`.
     */
    private serialiseBody(body: unknown, headers: Record<string, string>): string | FormData | undefined {
        if (body === undefined) {
            return undefined;
        }
        const contentType = Object.entries(headers)
            .find(([k]) => k.toLowerCase() === 'content-type')?.[1];
        const isJson = !contentType || contentType.toLowerCase().includes('application/json');
        if (!isJson && typeof body === 'string') {
            return body;
        }
        return JSON.stringify(body);
    }

    /**
     * Optional helper to convert object to FormData
     */
    private buildFormData(data: Record<string, any>): FormData {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        return formData;
    }

    /**
     * Optional helper to convert JS object to XML string
     */
    private convertToXML(obj: Record<string, any>): string {
        // Minimal example; replace with your preferred XML builder
        let xml = '<?xml version="1.0" encoding="UTF-8"?><root>';
        for (const [key, value] of Object.entries(obj)) {
            xml += `<${key}>${value}</${key}>`;
        }
        xml += '</root>';
        return xml;
    }

    protected async put<T>(
        endpoint: string,
        body?: any,
        params?: { params: UserFilters | UploadFileOptions | undefined,
            headers?: Record<string, string> }
    ): Promise<ApiResponse<T>> {
        // Build query string from params.params, not the whole params object
        const url = this.appendQueryString(endpoint, params?.params);

        const isFormData = (typeof FormData !== 'undefined') && body instanceof FormData;

        // For FormData, don't set Content-Type - let browser set it with boundary
        const headers: Record<string, string> = {};
        
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }
        
        // Only add custom headers if not FormData, or if they're not Content-Type
        if (params?.headers) {
            Object.entries(params.headers).forEach(([key, value]) => {
                if (!isFormData || key.toLowerCase() !== 'content-type') {
                    headers[key] = value;
                }
            });
        }

        return this.request<T>(url, {
            method: 'PUT',
            body: isFormData ? (body as FormData) : this.serialiseBody(body, headers),
            headers
        });
    }


    protected async delete<T>(
        endpoint: string,
        body?: any,
        params?: { params: UserFilters | UploadFileOptions | undefined,
            headers?: Record<string, string> }
    ): Promise<ApiResponse<T>> {
        // Build query string from params.params, not the whole params object
        const url = this.appendQueryString(endpoint, params?.params);

        const isFormData = (typeof FormData !== 'undefined') && body instanceof FormData;

        // For FormData, don't set Content-Type - let browser set it with boundary
        const headers: Record<string, string> = {};
        
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }
        
        // Only add custom headers if not FormData, or if they're not Content-Type
        if (params?.headers) {
            Object.entries(params.headers).forEach(([key, value]) => {
                if (!isFormData || key.toLowerCase() !== 'content-type') {
                    headers[key] = value;
                }
            });
        }

        return this.request<T>(url, {
            method: 'DELETE',
            body: isFormData ? (body as FormData) : this.serialiseBody(body, headers),
            headers
        });
    }

    private async parseResponse<T>(response: Response): Promise<T> {
        const contentType = response.headers.get('content-type');
        
        // Read the response as text first (we can only read the body once)
        const text = await response.text();
        
        // If content-type suggests JSON, try to parse as JSON
        if (contentType && contentType.includes('application/json')) {
            try {
                // Check if it looks like JSON before parsing
                const trimmedText = text.trim();
                if (trimmedText.startsWith('{') || trimmedText.startsWith('[') || trimmedText.startsWith('"')) {
                    return JSON.parse(text) as T;
                }
                // If it doesn't look like JSON, return as text (server sent wrong content-type)
                return (text as unknown) as T;
            } catch (error) {
                // If JSON parsing fails, return as text
                // This handles cases where server claims JSON but sends plain text
                return (text as unknown) as T;
            }
        }

        // For non-JSON responses, return the text content
        return (text as unknown) as T;
    }

    private async handleErrorResponse(response: Response): Promise<never> {
        let errorDetails: any;
        let problemDetail: ProblemDetail | undefined;

        try {
            const contentType = response.headers.get('content-type') ?? '';
            // The Access Management API returns RFC-7807 `application/problem+json`
            // on every error (introduced by server commit 31c471ac). Older
            // surfaces still return `application/json` for some error responses
            // — parse both as ProblemDetail.
            if (contentType.includes('json')) {
                const body = await response.json();
                errorDetails = body;
                if (body && typeof body === 'object') {
                    problemDetail = body as ProblemDetail;
                }
            } else {
                errorDetails = await response.text();
            }
        } catch {
            errorDetails = null;
        }

        // Prefer the server's formatted ProblemDetail.title in the thrown
        // message — it's the human-readable, localised text. Fall back to the
        // generic "HTTP Error: …" wording when no title was returned.
        const message = problemDetail?.title
            ? `${problemDetail.title} [${problemDetail.code ?? response.status}]`
            : `HTTP Error: ${response.status} ${response.statusText}`;

        throw new ApiClientError({
            message,
            status: response.status,
            details: errorDetails,
            problemDetail
        });
    }

    /**
     * Serialize FormData for debugging purposes
     */
    private serializeFormData(formData: FormData): Record<string, any> {
        const serialized: Record<string, any> = {};
        
        // FormData has an iterator for entries
        for (const [key, value] of formData.entries()) {
            // Check if value is a File by checking for File-specific properties
            if (value && typeof value === 'object' && 'name' in value && 'lastModified' in value) {
                const file = value as File;
                serialized[key] = {
                    type: 'File',
                    name: file.name,
                    size: file.size,
                    type_mime: file.type,
                    lastModified: file.lastModified
                };
            } 
            // Check if value is a Blob by checking for Blob-specific properties
            else if (value && typeof value === 'object' && 'size' in value && 'type' in value) {
                const blob = value as Blob;
                serialized[key] = {
                    type: 'Blob',
                    size: blob.size,
                    type_mime: blob.type
                };
            } 
            else {
                serialized[key] = String(value);
            }
        }
        
        return serialized;
    }

    private buildQueryString(params: Record<string, any>): string {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });

        return searchParams.toString();
    }

    /**
     * Append a query string to {@code endpoint} only when at least one
     * defined param is present. Avoids producing degenerate URLs with a
     * trailing {@code ?} (which Node's WHATWG fetch refuses to parse) when
     * the caller passes an object whose values are all undefined/null.
     */
    private appendQueryString(endpoint: string, params?: Record<string, any>): string {
        if (!params) return endpoint;
        const qs = this.buildQueryString(params);
        return qs ? `${endpoint}?${qs}` : endpoint;
    }

}

export class ApiClientError extends Error {
    /** HTTP status code returned by the API. */
    public status: number;
    /** Raw response body (parsed JSON when content-type was JSON, plain text otherwise). */
    public details?: any;
    /**
     * The parsed RFC-7807 ProblemDetail body when the server returned one
     * (every error response from the Access Management API since server
     * commit 31c471ac). `undefined` for non-JSON / non-RFC-7807 errors.
     */
    public problemDetail?: ProblemDetail;
    /**
     * The IGRP error code from `problemDetail.code` — match against
     * the `IgrpErrorCode` constants (re-exported from `./errors/error-codes`).
     * `undefined` for responses that didn't carry one.
     */
    public errorCode?: IgrpErrorCode | string;
    /**
     * The formatted human-readable message from `problemDetail.title`.
     * `undefined` for responses that didn't carry one.
     */
    public title?: string;
    /** Endpoint-specific extension context from `problemDetail.details`. */
    public errorDetails?: unknown;

    constructor(params: {
        message: string;
        status: number;
        details?: any;
        problemDetail?: ProblemDetail;
    }) {
        super(params.message);
        this.name = 'ApiClientError';
        this.status = params.status;
        this.details = params.details;
        this.problemDetail = params.problemDetail;
        this.errorCode = params.problemDetail?.code;
        this.title = params.problemDetail?.title;
        this.errorDetails = params.problemDetail?.details;

        // Required to fix prototype chain issues when extending built-ins
        Object.setPrototypeOf(this, ApiClientError.prototype);
    }

    /**
     * Convenience matcher: returns `true` when this error was raised with the
     * given IGRP error code.
     */
    is(code: IgrpErrorCode | string): boolean {
        return this.errorCode === code;
    }
}
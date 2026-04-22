import {ApiClientConfig, ApiResponse, UploadFileOptions, UserFilters,
    M2MDepartmentQueryOptions, M2MRoleQueryOptions, M2MUserQueryOptions,
    SyncApplicationMenusOptions
} from '@/types';

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
        const url = params ? `${endpoint}?${this.buildQueryString(params)}` : endpoint;
        return this.request<T>(url, {method: 'GET'});
    }

    protected async post<T>(
        endpoint: string,
        body?: any,
        params?: { params: UserFilters | UploadFileOptions | M2MDepartmentQueryOptions | M2MRoleQueryOptions | M2MUserQueryOptions | SyncApplicationMenusOptions | undefined,
            headers?: Record<string, string> }
    ): Promise<ApiResponse<T>> {
        // Build query string from params.params, not the whole params object
        const url = params?.params 
            ? `${endpoint}?${this.buildQueryString(params.params)}` 
            : endpoint;

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
            body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
            headers
        });
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
        const url = params?.params 
            ? `${endpoint}?${this.buildQueryString(params.params)}` 
            : endpoint;

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
            body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
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
        const url = params?.params 
            ? `${endpoint}?${this.buildQueryString(params.params)}` 
            : endpoint;

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
            body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
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

        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                errorDetails = await response.json();
            } else {
                errorDetails = await response.text();
            }
        } catch {
            errorDetails = null;
        }

        throw new ApiClientError({
            message: `HTTP Error: ${response.status} ${response.statusText}`,
            status: response.status,
            details: errorDetails
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

}

export class ApiClientError extends Error {
    public status: number;
    public details?: any;

    constructor(params: { message: string; status: number; details?: any }) {
        super(params.message);
        this.name = 'ApiClientError';
        this.status = params.status;
        this.details = params.details;

        // Required to fix prototype chain issues when extending built-ins
        Object.setPrototypeOf(this, ApiClientError.prototype);
    }
}
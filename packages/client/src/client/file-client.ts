import { BaseApiClient } from './base-client.js';
import { ApiResponse, FileUrlDTO, UploadFileOptions } from '@/types';

export class FileClient extends BaseApiClient {
    /**
     * Upload a public file
     * @param file The file to upload
     * @param options Upload options including folder
     * @param contentType Deprecated - Content-Type is now set automatically by the browser
     */
    async uploadPublicFile(
        file: File | Blob,
        options: UploadFileOptions,
        contentType?: string | undefined
    ): Promise<ApiResponse<string>> {
        const formData = new FormData();
        formData.append('file', file, file instanceof File ? file.name : undefined);

        console.log("[DEBUG] file: " + file)
        console.log("[DEBUG] folder: " + options.folder)

        // Don't pass contentType - let browser set Content-Type automatically with boundary
        return this.post<string>('/api/files/public', formData, {
            params: { folder: options.folder }
        });
    }

    /**
     * Upload a private file
     * @param file The file to upload
     * @param options Upload options including folder
     * @param contentType Deprecated - Content-Type is now set automatically by the browser
     */
    async uploadPrivateFile(
        file: File | Blob,
        options: UploadFileOptions,
        contentType?: string | undefined
    ): Promise<ApiResponse<string>> {
        const formData = new FormData();
        formData.append('file', file, file instanceof File ? file.name : undefined);

        console.log("[DEBUG] file: " + file)
        console.log("[DEBUG] folder: " + options.folder)

        // Don't pass contentType - let browser set Content-Type automatically with boundary
        return this.post<string>('/api/files/private', formData, {
            params: { folder: options.folder }
        });
    }

    /**
     * Get a file URL
     * @param filePath The path to the private file
     */
    async getFileUrl(filePath: string): Promise<ApiResponse<FileUrlDTO>> {
        return this.get<FileUrlDTO>('/api/files/url', { filePath });
    }
}
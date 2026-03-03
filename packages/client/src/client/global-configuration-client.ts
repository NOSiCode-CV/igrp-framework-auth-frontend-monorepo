import { BaseApiClient } from './base-client.js';
import {
    ApiResponse, GlobalConfigurationDTO, GlobalConfigurationType
} from '@/types';

export class GlobalConfigurationClient extends BaseApiClient {

    /**
     * Get a global configuration
     */
    async getGlobalConfiguration(type: GlobalConfigurationType): Promise<ApiResponse<GlobalConfigurationDTO>> {
        return this.get<GlobalConfigurationDTO>('/api/global-configuration', { type });
    }

    /**
     * Set a global configuration
     */
    async setGlobalConfiguration(globalConfiguration: GlobalConfigurationDTO): Promise<ApiResponse<GlobalConfigurationDTO>> {
        return this.post<GlobalConfigurationDTO>('/api/global-configuration', globalConfiguration);
    }

}
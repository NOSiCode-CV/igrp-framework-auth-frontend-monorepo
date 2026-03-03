import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GlobalConfigurationType} from '../src/types';
import {GlobalConfigurationClient} from "../src/client/global-configuration-client";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock('../src/client/base-client.ts', () => {
    return {
        BaseApiClient: class {
            get = mockGet;
            post = mockPost;
            put = mockPut;
            delete = mockDelete;
        },
        ApiClientError: class extends Error {
            public status: number;
            public details?: any;

            constructor(params: { message: string; status: number; details?: any }) {
                super(params.message);
                this.name = 'ApiClientError';
                this.status = params.status;
                this.details = params.details;
                Object.setPrototypeOf(this, new.target.prototype); // Fix prototype chain
            }
        }
    };
});

describe('GlobalConfigurationClient', () => {
    let client: GlobalConfigurationClient;
    const mockConfig = { baseUrl: 'https://api.example.com', timeout: 5000 };

    beforeEach(() => {
        client = new GlobalConfigurationClient(mockConfig);
        vi.clearAllMocks();
    });

    it('should get global configuration based on type', async () => {
        const type = GlobalConfigurationType.CLUSTER
        const mockResponse = { type, config: `{ 'foo': 'bar' }` };
        mockGet.mockResolvedValue(mockResponse);

        const result = await client.getGlobalConfiguration(type);

        expect(mockGet).toHaveBeenCalledWith('/api/global-configuration', { type });
        expect(result).toBe(mockResponse);
    });

    it('should set a new global configuration', async () => {
        const type = GlobalConfigurationType.CLUSTER
        const mockResponse = { type, config: `{ 'foo': 'bar' }` };

        mockPost.mockResolvedValue(mockResponse);

        const newConfig = { type, config: `{ 'foo': 'bar' }` };
        const result = await client.setGlobalConfiguration(newConfig);

        expect(mockPost).toHaveBeenCalledWith('/api/global-configuration', newConfig);
        expect(result).toBe(mockResponse);
    });

});

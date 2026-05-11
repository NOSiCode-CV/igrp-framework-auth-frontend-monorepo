import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseApiClient, ApiClientError } from '../src';

describe('BaseApiClient', () => {
  let client: BaseApiClient;
  const mockConfig = {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    headers: {
      'X-Custom-Header': 'custom-value'
    }
  };

  beforeEach(() => {
    // Mock the global fetch
    global.fetch = vi.fn() as any;
    client = new BaseApiClient(mockConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('request method', () => {
    it('should make a successful request', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: vi.fn().mockResolvedValue({ data: 'test data' }),
        headers: {
          get: vi.fn().mockReturnValue('application/json')
        }
      };

      // @ts-ignore
      (global.fetch as vi.Mock).mockResolvedValue(mockResponse);

      const response = await (client as any).request('/test-endpoint', { method: 'GET' });

      expect(global.fetch).toHaveBeenCalledWith(
          'https://api.example.com/test-endpoint',
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Custom-Header': 'custom-value'
            })
          })
      );

      expect(response).toEqual({
        data: { data: 'test data' },
        status: 200,
        statusText: 'OK'
      });
    });

    it('should handle non-JSON responses', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: vi.fn().mockResolvedValue('plain text response'),
        headers: {
          get: vi.fn().mockReturnValue('text/plain')
        }
      };

      // @ts-ignore
      (global.fetch as vi.Mock).mockResolvedValue(mockResponse);

      const response = await (client as any).request('/test-endpoint', { method: 'GET' });

      expect(response).toEqual({
        data: 'plain text response',
        status: 200,
        statusText: 'OK'
      });
    });

    it('should handle error responses', async () => {
      const errorDetails = { message: 'Not found' };
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: vi.fn().mockResolvedValue(errorDetails),
        headers: {
          get: vi.fn().mockReturnValue('application/json')
        }
      };

      // @ts-ignore
      (global.fetch as vi.Mock).mockResolvedValue(mockResponse);

      await expect((client as any).request('/test-endpoint', { method: 'GET' }))
          .rejects.toThrow(ApiClientError);

      try {
        await (client as any).request('/test-endpoint', { method: 'GET' });
      } catch (error) {
        expect(error).toBeInstanceOf(ApiClientError);
        expect((error as ApiClientError).status).toBe(404);
        expect((error as ApiClientError).details).toEqual(errorDetails);
      }
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      // @ts-ignore
      (global.fetch as vi.Mock).mockRejectedValue(networkError);

      await expect((client as any).request('/test-endpoint', { method: 'GET' }))
          .rejects.toThrow(ApiClientError);

      try {
        await (client as any).request('/test-endpoint', { method: 'GET' });
      } catch (error) {
        expect(error).toBeInstanceOf(ApiClientError);
        expect((error as ApiClientError).status).toBe(0);
        expect((error as ApiClientError).message).toBe('Network error');
      }
    });
  });

  describe('HTTP methods', () => {
    it('should make GET requests', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: vi.fn().mockResolvedValue({ data: 'test' }),
        headers: {
          get: vi.fn().mockReturnValue('application/json')
        }
      };
      // @ts-ignore
      (global.fetch as vi.Mock).mockResolvedValue(mockResponse);

      await (client as any).get('/test', { param: 'value' });

      expect(global.fetch).toHaveBeenCalledWith(
          'https://api.example.com/test?param=value',
          expect.objectContaining({ method: 'GET' })
      );
    });

    it('should not append a trailing "?" when all params are undefined', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: vi.fn().mockResolvedValue('{"data":"ok"}'),
        json: vi.fn().mockResolvedValue({ data: 'ok' }),
        headers: { get: vi.fn().mockReturnValue('application/json') }
      };
      // @ts-ignore
      (global.fetch as vi.Mock).mockResolvedValue(mockResponse);

      await (client as any).get('/api/users/me/applications', { applicationName: undefined });

      expect(global.fetch).toHaveBeenCalledWith(
          'https://api.example.com/api/users/me/applications',
          expect.objectContaining({ method: 'GET' })
      );
    });

    it('should drop only the undefined params and keep defined ones', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: vi.fn().mockResolvedValue('{"data":"ok"}'),
        json: vi.fn().mockResolvedValue({ data: 'ok' }),
        headers: { get: vi.fn().mockReturnValue('application/json') }
      };
      // @ts-ignore
      (global.fetch as vi.Mock).mockResolvedValue(mockResponse);

      await (client as any).get('/api/users/me/applications/recent', { applicationName: undefined, max: '5' });

      expect(global.fetch).toHaveBeenCalledWith(
          'https://api.example.com/api/users/me/applications/recent?max=5',
          expect.objectContaining({ method: 'GET' })
      );
    });

    it('should not append "?" when params object is empty', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: vi.fn().mockResolvedValue('{"data":"ok"}'),
        json: vi.fn().mockResolvedValue({ data: 'ok' }),
        headers: { get: vi.fn().mockReturnValue('application/json') }
      };
      // @ts-ignore
      (global.fetch as vi.Mock).mockResolvedValue(mockResponse);

      await (client as any).get('/test', {});

      expect(global.fetch).toHaveBeenCalledWith(
          'https://api.example.com/test',
          expect.objectContaining({ method: 'GET' })
      );
    });

    it('should make POST requests with JSON body', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: vi.fn().mockResolvedValue({ data: 'test' }),
        headers: { get: vi.fn().mockReturnValue('application/json') },
      };
      // @ts-ignore
      (global.fetch as vi.Mock).mockResolvedValue(mockResponse);

      const body = { key: 'value' };

      await (client as any).post('/test', body, {
        headers: { 'Content-Type': 'application/json' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
          'https://api.example.com/test',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(body),
            headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          }),
      );
    });

    it('should make PUT requests with JSON body', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: vi.fn().mockResolvedValue({ data: 'test' }),
        headers: { get: vi.fn().mockReturnValue('application/json') },
      };
      // @ts-ignore
      (global.fetch as vi.Mock).mockResolvedValue(mockResponse);

      const body = { key: 'value' };

      await (client as any).put('/test', body, {
        headers: { 'Content-Type': 'application/json' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
          'https://api.example.com/test',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(body),
            headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
          }),
      );
    });

    it('should send FormData when Content-Type is multipart/form-data', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ success: true }),
        headers: { get: vi.fn().mockReturnValue('application/json') },
      };
      // @ts-ignore
      (global.fetch as vi.Mock).mockResolvedValue(mockResponse);

      const body = { file: new Blob(['test'], { type: 'text/plain' }) };

      await (client as any).post('/upload', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
          'https://api.example.com/upload',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({ 'Content-Type': 'multipart/form-data' }),
          }),
      );
    });

    it('should send XML when Content-Type is application/xml', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ success: true }),
        headers: { get: vi.fn().mockReturnValue('application/json') },
      };
      // @ts-ignore
      (global.fetch as vi.Mock).mockResolvedValue(mockResponse);

      const xmlString = '<test>123</test>';

      await (client as any).post('/xml', xmlString, {
        headers: { 'Content-Type': 'application/xml' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
          'https://api.example.com/xml',
          expect.objectContaining({
            method: 'POST',
            body: xmlString,
            headers: expect.objectContaining({ 'Content-Type': 'application/xml' }),
          }),
      );
    });

    it('should make DELETE requests', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: vi.fn().mockResolvedValue({ data: 'test' }),
        headers: {
          get: vi.fn().mockReturnValue('application/json')
        }
      };
      // @ts-ignore
      (global.fetch as vi.Mock).mockResolvedValue(mockResponse);

      await (client as any).delete('/test');

      expect(global.fetch).toHaveBeenCalledWith(
          'https://api.example.com/test',
          expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});
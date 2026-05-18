import type { ProblemDetail } from '../errors/error-codes.js';

/**
 * Fetches and caches an OAuth2 `client_credentials` access token from the
 * Access Management API's authorization server endpoint (`POST {baseUrl}/oauth2/token`).
 *
 * One instance per (baseUrl, clientId) is enough — it memoises the token
 * until it's within `refreshLeewayMs` of expiration and refreshes it
 * transparently on the next `getAccessToken()` call. Concurrent callers
 * share a single in-flight fetch.
 *
 * Centralises what used to be a per-call static M2M header — callers
 * configure their `(clientId, clientSecret)` on `M2MClient` once and the
 * library handles the rest.
 */
export class ClientCredentialsTokenProvider {
    private readonly tokenEndpoint: string;
    private readonly basicAuthHeader: string;

    private cachedToken?: string;
    /** ms epoch when the cached token expires. */
    private cachedExpiresAt?: number;
    /** Promise of the currently in-flight token fetch (for dedup). */
    private inflight?: Promise<string>;

    constructor(
        private readonly baseUrl: string,
        private readonly clientId: string,
        clientSecret: string,
        private readonly scope?: string,
        private readonly refreshLeewayMs: number = 30_000,
    ) {
        if (!baseUrl) throw new Error('ClientCredentialsTokenProvider: baseUrl is required');
        if (!clientId) throw new Error('ClientCredentialsTokenProvider: clientId is required');
        if (clientSecret === undefined || clientSecret === null) {
            throw new Error('ClientCredentialsTokenProvider: clientSecret is required');
        }
        this.tokenEndpoint = `${baseUrl.replace(/\/$/, '')}/oauth2/token`;
        // Build Basic auth header once; works in both browser and Node 18+
        // via globalThis.btoa, falling back to Buffer when btoa is absent.
        const raw = `${clientId}:${clientSecret}`;
        this.basicAuthHeader =
            typeof globalThis !== 'undefined' && typeof (globalThis as any).btoa === 'function'
                ? `Basic ${(globalThis as any).btoa(raw)}`
                : `Basic ${Buffer.from(raw, 'utf8').toString('base64')}`;
    }

    /**
     * Return a valid, non-expired bearer token. Refreshes synchronously
     * when the cached one is missing or within the configured expiry
     * leeway. Concurrent callers share the same in-flight fetch.
     */
    async getAccessToken(): Promise<string> {
        const now = Date.now();
        if (this.cachedToken && this.cachedExpiresAt &&
            now < this.cachedExpiresAt - this.refreshLeewayMs) {
            return this.cachedToken;
        }
        if (this.inflight) {
            return this.inflight;
        }
        this.inflight = this.fetchNewToken().finally(() => {
            this.inflight = undefined;
        });
        return this.inflight;
    }

    /**
     * Drop the cached token so the next `getAccessToken()` performs a
     * fresh fetch. Useful when the server rejected a previously-cached
     * token (e.g. after a client-secret rotation).
     */
    invalidate(): void {
        this.cachedToken = undefined;
        this.cachedExpiresAt = undefined;
    }

    getClientId(): string {
        return this.clientId;
    }

    private async fetchNewToken(): Promise<string> {
        const body = new URLSearchParams({ grant_type: 'client_credentials' });
        if (this.scope) {
            body.set('scope', this.scope);
        }
        const response = await fetch(this.tokenEndpoint, {
            method: 'POST',
            headers: {
                Authorization: this.basicAuthHeader,
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: body.toString(),
        });
        if (!response.ok) {
            // Try to surface a ProblemDetail-ish reason; fall back to status text.
            let detail: unknown;
            try {
                const ct = response.headers.get('content-type') ?? '';
                detail = ct.includes('json') ? await response.json() : await response.text();
            } catch {
                detail = undefined;
            }
            let reason: string;
            if (typeof detail === 'object' && detail !== null && 'title' in detail) {
                reason = String((detail as ProblemDetail).title ?? response.statusText);
            } else if (typeof detail === 'string') {
                reason = detail;
            } else {
                reason = response.statusText;
            }
            throw new Error(`Failed to obtain client_credentials access token (status ${response.status}): ${reason}`);
        }
        const payload = await response.json() as {
            access_token: string;
            token_type?: string;
            expires_in?: number;
            scope?: string;
        };
        this.cachedToken = payload.access_token;
        // Server returns expires_in as seconds; convert to ms epoch.
        const expiresInMs = (payload.expires_in ?? 3600) * 1000;
        this.cachedExpiresAt = Date.now() + expiresInMs;
        return this.cachedToken;
    }
}

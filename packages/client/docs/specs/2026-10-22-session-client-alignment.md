# Session Client Alignment: Spec

**Status:** draft, not planned · **Package:** `@igrp/platform-access-management-client-ts` (currently `0.2.0-beta.20`) · **Companion specs:** AM API `backend/access-management-api/plans/sso-session-logout-cascade/requirements.md`, framework `igrp-framework-nextjs/docs/superpowers/specs/2026-10-22-multi-app-auth-sessions-spec.md`

## Problem Statement

`SessionClient` (`src/client/session-client.ts`) no longer matches the server's `SessionController` (`/api/session`):

- **`initializeSession()` always fails.** It calls `POST /api/session/init`, which the server does not have. Every call gets a 404.
- **`rotateSession()` always fails.** The server answers `POST /api/session/rotate` with `501 Not Implemented` on purpose: only the token endpoint can hand the caller a token with the new `sid`, so a REST rotation would sign the calling app out. The framework already wraps this method with a runtime warning (`SESSION_CLIENT_TRAPS` in `framework-next/src/lib/api-client.ts`).
- **The one endpoint apps need is missing.** `GET /api/session/check` is exempt from `SessionEnforcementFilter`. A token whose session was revoked gets back `valid=false` with a reason instead of an opaque 401. The framework needs it so an idle tab can notice a revoked session, including the logout cascade in the AM API spec.
- **`closeSession()` is described as if it were a logout.** Its doc says "Close the current active session". The server documents it as *not* a logout: it clears no cookie, keeps the SSO session and revokes no token.

## Solution

One beta release:
- **Add** `checkSession()`.
- **Remove** `initializeSession()` and `rotateSession()`.
- **Correct** `closeSession()`'s documentation.

## User Stories

1. As an app developer, I want to ask AM whether my session is still valid without triggering a 401, so that I can decide what to show.
2. As an app developer, I want the reason a session is invalid, so that I can tell an administrator's revocation from an idle timeout in logs.
3. As an app developer, I want the client to expose only endpoints that work, so that I cannot ship a call that always fails.
4. As an app developer, I want `closeSession()` documented as what it is, so that I don't use it as a logout.

## Implementation Decisions

- **`checkSession()`:**
  - `SessionClient.checkSession(): Promise<ApiResponse<SessionCheckResponseDTO>>` calls `this.get('/api/session/check')`.
  - It needs the same bearer token as every other call: the endpoint is `@PreAuthorize("isAuthenticated()")`. Only the session-state filter is skipped.
- **`SessionCheckResponseDTO`** (`src/types/index.ts`), mirroring the server DTO. The server's `Instant` fields serialize as ISO-8601 strings and `UUID` as a string:

  ```ts
  export interface SessionCheckResponseDTO {
      valid: boolean;
      sid?: string | null;
      sub?: string | null;
      expiresAt?: string | null;
      lastSeenAt?: string | null;
      idleTimeoutAt?: string | null;
      absoluteExpiryAt?: string | null;
      /** Why `valid` is false. Known values below; others may appear. */
      reason?: string | null;
  }
  ```

  - `reason` stays `string`, not a closed union. When the row is not `ACTIVE` the server passes its stored `closed_reason` through, and that set grows with the server. The JSDoc lists the known values:
    - `MISSING_SID`, `SESSION_NOT_FOUND`, `ABSOLUTE_TIMEOUT`, `IDLE_TIMEOUT` (from the check itself);
    - `USER_LOGOUT`, `USER_CLOSED`, `SESSION_LIMIT_EXCEEDED`, `SESSION_TIMEOUT` (from the row's `closed_reason`).
- **Removals:**
  - Delete `initializeSession()` and `rotateSession()`.
  - Delete `SessionInitRequestDTO`; after the removals nothing in `src/` uses it.
  - This is a breaking change in a pre-release line. Nothing can depend on either method working: one always returns 404, the other 501.
- **`closeSession()`:** keep it, with JSDoc stating what the server's OpenAPI says:
  - it closes the caller's own session server-side;
  - it is **not** a logout: no cookie is cleared, the SSO session survives and no token is revoked;
  - sign out through `/connect/logout` with an `id_token_hint`.
- **Release:** `0.2.0-beta.21` through the package's `release` script.
- **Downstream (framework spec, Phase 2, not part of this package):**
  - bump the dependency in `framework-next` and `framework-next-types`;
  - delete the `rotateSession` trap entry and its test. `guardSessionClient` already skips missing methods, so nothing breaks before that.

## Testing Decisions

- **What a good test is:** the method calls the right endpoint with the right verb and returns the server's payload, through the existing `BaseApiClient` mock in `__test__/session-client.test.ts`.
- **Cases:**
  - `checkSession()` issues `GET /api/session/check` and returns the payload unchanged for both `valid: true` and `valid: false` with a `reason`.
  - `initializeSession` and `rotateSession` are no longer properties of `SessionClient`. Remove their tests rather than leave them asserting removed behaviour.
  - `closeSession()` is unchanged.
- **Type check:** `tsc` must pass with `SessionInitRequestDTO` gone. That proves nothing else in `src/` referenced it.

## Out of Scope

- **`refreshSession()`.** It works and is scoped by `sid` on the server.
- **An `X-Device-Id` header.** AM no longer closes a session when another app signs in on the same derived device (server commits `0444154d` and `6674a9d6`; the first alone makes the second sign-in fail), so the client has nothing to send.
- **Typing other error bodies.** `ApiClientError.details` already carries AM's 401 body `{"error":"invalid_token","error_description":"session_revoked"}`.
- **Admin session endpoints** (`AdminSessionClient`).

## Further Notes

Verified against the AM API `development` branch on 2026-10-22:
- `SessionController` exposes `GET /`, `GET /check`, `POST /refresh`, `POST /rotate` (501) and `POST /close`, with no `/init`.
- `GetSessionCheckQueryHandler` sets the reasons listed above.

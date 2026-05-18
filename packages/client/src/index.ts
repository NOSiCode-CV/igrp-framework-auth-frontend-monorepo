// Main exports
export { AccessManagementClient } from './client/access-management-client.js';
export { ApplicationClient } from './client/application-client.js';
export { DepartmentClient } from './client/department-client.js';
export { RoleClient } from './client/role-client.js';
export { UserClient } from './client/user-client.js';
export { FileClient } from './client/file-client.js';
export { AuthorizeClient } from './client/authorize-client.js'
export { M2MClient } from './client/m2m-client.js';
export { SessionClient } from './client/session-client.js';
export { AdminSessionClient } from './client/admin-session-client.js';
export { AuthAuditClient } from './client/auth-audit-client.js';
export { OAuthClient } from './client/oauth-client.js';
export { BaseApiClient, ApiClientError } from './client/base-client.js';

// Error handling — IgrpErrorCode catalogue + ProblemDetail shape mirroring
// the server's RFC-7807 error contract.
export { IgrpErrorCode } from './errors/error-codes.js';
export type { ProblemDetail } from './errors/error-codes.js';

// Type / enum exports — re-export everything declared in types/index.ts so
// new DTOs, request shapes and enums are automatically available to
// consumers without touching this barrel.
export * from './types/index.js';
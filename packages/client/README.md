# iGRP Platform Access Management Client

A TypeScript client library for interacting with the iGRP Access Management API. This client provides a simple and type-safe way to manage applications, departments, roles, users and other elements in the iGRP platform.

## Requirements

- Node.js 22.11.0 or higher
- TypeScript 5.2.2 or higher

## Installation

```bash
npm install @igrp/platform-access-management-client-ts
```

## Configuration

This project is built with:
- Node.js 22.11.0
- Vite 6.5.0
- TypeScript (Vanilla TS template)

## Project Structure

```
igrp-platform-access-management-client-ts/
├── src/
│   ├── client/         # Client implementations for fetch calls
│   ├── types/          # Type interfaces definitions
├── public/             # Public assets
├── __test__/           # Test files
└── package.json        # Project dependencies and scripts
```

## Usage

### Basic Usage

```typescript
import { AccessManagementClient } from '@igrp/platform-access-management-client-ts';

// Create a client instance
const client = AccessManagementClient.create({
  baseUrl: 'https://your-api-endpoint.com',
  timeout: 30000, // optional, defaults to 30000 (30 seconds)
  headers: {      // optional
    'Authorization': 'Bearer your-token-here'
  }
});

// Use the client to interact with the API
async function getResources() {
  try {
    const response = await client.resources.getResources();
    console.log('Resources:', response.data);
  } catch (error) {
    console.error('Error fetching resources:', error);
  }
}
```

### Managing Applications, Departments, Roles, Users

```typescript
// Example usage for updated clients
const applications = await client.applications.getApplications();
const departments = await client.departments.getDepartments();
const roles = await client.roles.getRoles();
const users = await client.users.getUsers();
```

### Managing Resources

```typescript
import { ResourceType } from '@igrp/platform-access-management-client-ts';

// Get all resources
const resources = await client.resources.getResources();

// Get a specific resource
const resource = await client.resources.getResourceById(123);

// Create a new resource
const newResource = await client.resources.createResource({
  name: 'my-resource',
  description: 'My Resource',
  type: ResourceType.API,
  applicationCode: "APP"
});

// Update a resource
await client.resources.updateResource("resource123", {
  description: 'Updated Resource Name'
});

// Delete a resource
await client.resources.deleteResource("resource123");

// Add items to a resource
await client.resources.addResourceItems("resource123", [
  { name: 'item1', description: 'Item 1', resourceName: "resource123" },
  { name: 'item2', description: 'Item 2', resourceName: "resource123" }
]);

// Remove items from a resource
await client.resources.removeResourceItems("resource123", ["item456", "item789"]);
```

### Managing Permissions

```typescript
// Get all permissions for an application
const permissions = await client.permissions.getPermissions({ applicationCode: "APP_456" });

// Create a new permission
const newPermission = await client.permissions.createPermission({
  name: 'READ_RESOURCE',
  description: 'Permission to read resources',
  applicationCode: "APP_456"
});

// Update a permission
await client.permissions.updatePermission("permission123", {
  description: 'Updated permission description'
});

// Delete a permission
await client.permissions.deletePermission("permission123");
```

### Managing Menus

```typescript
import { MenuType } from '@igrp/platform-access-management-client-ts';

// Get all menus for an application
const menus = await client.menus.getMenus({ applicationCode: "APP_456" });

// Create a new menu entry
const newMenu = await client.menus.createMenu({
  name: 'Dashboard',
  type: MenuType.MENU_PAGE,
  position: 1,
  icon: 'dashboard',
  applicationCode: "APP_456",
  resourceName: "resource123"
});

// Update a menu entry
await client.menus.updateMenu("menu123", {
  position: 2
});

// Delete a menu entry
await client.menus.deleteMenu("menu123");
```

## API Reference

### AccessManagementClient

The main client that provides access to all API resources except resources, permissions, and menus, which are no longer available.

```typescript
const client = AccessManagementClient.create({
  baseUrl: 'https://your-api-endpoint.com',
  timeout: 30000,
  headers: { 'Authorization': 'Bearer token' }
});
```

### ResourceClient

Methods for managing resources:

- `getResources(filters?)`: Get all resources with optional filters
- `getResourceById(id)`: Get a specific resource by ID
- `getResourceByName(name)`: Get a specific resource by name
- `createResource(resource)`: Create a new resource
- `updateResource(name, resource)`: Update an existing resource
- `deleteResource(name)`: Delete a resource
- `addResourceItems(name, items)`: Add items to a resource
- `removeResourceItems(name, items)`: Remove items from a resource
- `getResourceCustomFields(name)`: Get custom fields for a resource
- `addResourceCustomFields(name, customFields)`: Add custom fields to a resource
- `removeResourceCustomFields(name, fieldNames)`: Remove custom fields from a resource

### PermissionClient

Methods for managing permissions:

- `getPermissions(filters)`: Get all permissions with filters
- `getPermissionById(id)`: Get a specific permission by ID
- `getPermissionByName(name)`: Get a specific permission by name
- `createPermission(permission)`: Create a new permission
- `updatePermission(name, permission)`: Update an existing permission
- `deletePermission(name)`: Delete a permission

### MenuClient

Methods for managing menu entries:

- `getMenus(filters?)`: Get all menu entries with optional filters
- `getMenuByCode(code)`: Get a specific menu entry by code
- `createMenu(menu)`: Create a new menu entry
- `updateMenu(code, menu)`: Update an existing menu entry
- `deleteMenu(code)`: Delete a menu entry

## Error Handling

The client provides a standardized error handling mechanism:

```typescript
import { ApiClientError } from '@igrp/platform-access-management-client-ts';

try {
  const resources = await client.resources.getResources();
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error(`API Error (${error.status}): ${error.message}`);
    console.error('Details:', error.details);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Development

### Building the project

```bash
npm run build
```

### Publishing the package

```bash
npm run release
```

## Testing

Unit tests are written using [Vitest](https://vitest.dev/), and test coverage includes all major client functionalities: resources, permissions, and menus.

### Running Tests

To run the test suite:

```bash
npm run test
```

To check the test coverage:

```bash
npm run test:coverage
```

This will execute all test files under the `__test__/` directory.

### Example Tests

* **Applications**: Tests cover retrieval, creation, update, and deletion.
* **Departments**: Tests cover retrieval, creation, update, and deletion.
* **Roles**: Tests cover retrieval, creation, update, and deletion.
* **Users**: Tests cover retrieval, creation, update, and deletion.

### Test Structure

Each client test follows a consistent mock-based structure to isolate API logic:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Mock BaseApiClient and inject into ApplicationClient, DepartmentClient, RoleClient, UserClient
```

Mocks are created for:

* `get`
* `post`
* `put`
* `delete`

This ensures no real HTTP calls are made during test execution.

### Linting and Type Safety

Before submitting changes, ensure code and tests pass linting and type checks:

```bash
npm run lint
npm run typecheck
```

## Contributing

Contributions to the iGRP Access Management client are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Write tests for your changes
5. Run the tests to ensure they pass
6. Submit a pull/merge request
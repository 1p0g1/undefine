# Package Management Guide

## Package Structure

This project uses a monorepo structure with npm workspaces. The following packages are included:

1. **Root Package** (`package.json`)
   - Manages the overall project
   - Contains shared dependencies used across packages
   - Provides scripts for building, testing, and development
   - Configures workspaces for client, server, and shared packages

2. **Client Package** (`client/package.json`)
   - Contains React-specific dependencies
   - Manages client-side build and development
   - Includes client-specific scripts

3. **Shared Types Package** (`packages/shared-types/package.json`)
   - Contains TypeScript type definitions shared between client and server
   - Provides validation utilities for data structures
   - Exports interfaces and types used throughout the application

## Dependency Management Strategy

### Root Dependencies

The root `package.json` contains:

- **Shared Dependencies**: Libraries used by multiple packages (React, TypeScript, etc.)
- **Development Dependencies**: Testing, linting, and build tools
- **Type Definitions**: Most `@types/*` packages are in the root

### Package-Specific Dependencies

Each package should only include dependencies that are:
- Specific to that package's functionality
- Not shared with other packages
- Required for that package's build process

### Version Management

- Use consistent version numbers across packages
- Use caret (`^`) for version ranges to allow minor updates
- Use exact versions for critical dependencies
- Use overrides to force specific versions when needed

## Adding New Dependencies

1. **For Shared Dependencies**:
   ```bash
   npm install <package> --save
   ```

2. **For Package-Specific Dependencies**:
   ```bash
   cd <package-directory>
   npm install <package> --save
   ```

3. **For Development Dependencies**:
   ```bash
   npm install <package> --save-dev
   ```

## Scripts

### Root Scripts

- `npm run build`: Build all packages
- `npm run dev`: Start development servers
- `npm run test`: Run tests
- `npm run lint`: Lint all packages
- `npm run typecheck`: Type check all packages

### Package-Specific Scripts

Each package has its own scripts for:
- Building
- Testing
- Linting
- Type checking

## Best Practices

1. **Keep Dependencies Lean**:
   - Only install what you need
   - Remove unused dependencies regularly
   - Use `npm audit` to check for vulnerabilities

2. **Maintain Consistent Structure**:
   - Follow the established package structure
   - Keep scripts consistent across packages
   - Use the same configuration patterns

3. **Version Control**:
   - Only commit the root package-lock.json
   - Remove package-lock.json files from individual packages

4. **Documentation**:
   - Document significant dependency changes
   - Explain the purpose of each package
   - Keep this guide updated as the project evolves 
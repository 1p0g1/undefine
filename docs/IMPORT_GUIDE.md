# Import Guide

## Import Structure

### Core Services
- `GameService`: Core game logic, word retrieval, and streak handling
- `LeaderboardService`: Leaderboard management and user statistics
- `StatsService`: Daily metrics and platform statistics
- `WordService`: Word management and validation

### Database
- `snowflake.js`: Database connection management
  - Use `connectionManager.getConnection()` to get a connection
  - Always wrap in try/finally with `connectionManager.releaseConnection()`
  - Pass connection to all `executeQuery` calls

### Types
- Import shared types from `@undefine/shared-types`
- All services export their own interfaces
- Database query results are typed using generics with `executeQuery<T>`

## Import Patterns

### Service Imports
```typescript
import { ServiceName } from '../services/ServiceName';
```

### Database Imports
```typescript
import { connectionManager } from '../config/snowflake';
```

### Type Imports
```typescript
import type { InterfaceName } from '../services/ServiceName';
```

### Shared Types Imports
```typescript
import { type Word, type GuessResult } from '@undefine/shared-types';
```

## Best Practices

1. **NEVER use `.js` extension in imports** - this will cause build failures
2. Use relative paths from the importing file
3. Import types using `type` keyword when possible
4. Group imports by category (core, database, types)
5. Use named exports for better tree-shaking
6. Always handle database connections in try/finally blocks
7. Type all database query results
8. Import shared types from `@undefine/shared-types` package
9. Follow the import path standardization in Clean_Up.md 
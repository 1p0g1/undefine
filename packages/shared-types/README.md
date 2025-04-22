# Un-Define Shared Types

This package contains all shared TypeScript type definitions used across the Un-Define application. It serves as the single source of truth for data structures and interfaces used in both the frontend and backend.

## Structure

The types are organized into several categories:

### Core Game Types
- `Word`: Represents a word in the game with its properties
- `GameSession`: Represents an active game session
- `GameState`: Game state ('active', 'completed', 'expired')
- `ClueType`: Different types of hints ('D', 'E', 'F', 'I', 'N', 'E2')
- `ClueStatus`: Status of each clue type

### User & Stats Types
- `User`: Basic user information
- `UserStats`: User's game statistics
- `Score`: Individual game score record
- `LeaderboardEntry`: Entry in the leaderboard

### API Types
- `GuessResult`: Result of a guess attempt
- `GameResponse`: Response when starting a new game
- `WordClues`: Different types of clues available for a word
- `GameWord`: Word information formatted for game display
- `ApiWord`: Word information as stored in the API

### Form & Validation Types
- `FormState`: State for word entry forms
- `WordEntry`: Complete word entry with metadata
- `ValidationError`: Form validation error format

### Leaderboard & Stats Types
- `DailyMetrics`: Daily game statistics
- `StreakLeader`: User with streak information

## Usage

### Frontend

```typescript
import type { Word, GameSession, GuessResult } from 'shared-types';
```

### Backend

```typescript
import type { DatabaseClient, Word, UserStats } from 'shared-types';
```

## Type Consistency

All types in this package should:
1. Be properly documented with JSDoc comments
2. Follow consistent naming conventions
3. Use explicit, descriptive names
4. Avoid duplicating types that serve the same purpose
5. Be kept in sync with the database schema where applicable

## Contributing

When adding or modifying types:
1. Ensure the type is truly needed across multiple parts of the application
2. Add appropriate JSDoc documentation
3. Update this README if adding new categories
4. Consider the impact on existing code that uses these types 
# Un-Define Architecture

_Last updated: April 2025_

## Project Structure

```
reversedefine/
├── client/                   # Frontend (Next.js, React, TypeScript)
│   ├── pages/               # Game UI
│   ├── components/          # DEFINE box, timer, etc.
│   ├── services/           # API calls
│   └── utils/              # Game helpers
│
├── server/                  # Backend (Node.js + Express + TypeScript)
│   ├── routes/             # /api/word, /api/guess, /api/streak-status
│   ├── services/           # GameService, SupabaseClient
│   ├── types/             # Shared types
│   └── server.ts          # Entry point (uses ts-node/esm)
│
└── supabase/              # Supabase schema & seed scripts
```

## Game Flow

### API Endpoints

1. **GET /api/word**
   - Returns a random word
   - Definition is always shown first
   - Response: `{ gameId: string, word: { definition: string } }`

2. **POST /api/guess**
   - Checks the guess and returns updated game state
   - Request: `{ gameId: string, guess: string }`
   - Response: `{ correct: boolean, gameState: GameState }`

3. **GET /api/hint/:gameId**
   - Reveals the next clue in "DEFINE" order
   - Response: `{ hint: string, type: ClueType }`

### DEFINE Hint Progression

The game follows a strict DEFINE order for revealing hints:

- **D**: Definition — shown immediately
- **E**: Etymology
- **F**: First Letter
- **I**: In a Sentence
- **N**: Number of Letters
- **E**: Equivalents (synonyms)

Each stage updates the matching DEFINE box with one of three states:
- ❌ Red = Wrong guess unlock
- ✅ Green = Correct guess on that clue
- ⚪ Grey = Unused

## Database Architecture

### Supabase Tables

#### words
```sql
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT NOT NULL,
  definition TEXT NOT NULL,
  etymology TEXT,
  first_letter TEXT,
  in_a_sentence TEXT,
  number_of_letters INTEGER,
  equivalents TEXT,
  difficulty TEXT
);
```

#### game_sessions
```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_id UUID REFERENCES words(id),
  word TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  guesses TEXT[],
  guesses_used INTEGER DEFAULT 0,
  revealed_clues TEXT[],
  clue_status JSONB,
  is_complete BOOLEAN DEFAULT FALSE,
  is_won BOOLEAN DEFAULT FALSE
);
```

### Database Access

All database operations are handled through the `SupabaseClient` singleton:

```typescript
class SupabaseClient implements DatabaseClient {
  private static instance: SupabaseClient;
  
  public static getInstance(): SupabaseClient {
    if (!SupabaseClient.instance) {
      SupabaseClient.instance = new SupabaseClient();
    }
    return SupabaseClient.instance;
  }
  
  // Database operations...
}
```

## Authentication

The game uses a simplified authentication approach:

- No email/password authentication
- No JWT tokens or sessions
- Identity based on `localStorage.nickname`
- Anonymous users supported
- No protected routes

## Frontend Architecture

### Technology Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **UI Library**: React
- **State Management**: React Context
- **API Communication**: Fetch API

### Key Features

- Mobile-first responsive design
- Game state resets on page refresh (no persistence)
- All API calls routed to Express backend via Next.js API routes
- Progressive hint system with visual feedback

### Game State Management

```typescript
interface GameState {
  gameId: string;
  word: string;
  guesses: string[];
  revealedClues: ClueType[];
  clueStatus: Record<ClueType, ClueStatus>;
  isComplete: boolean;
  isWon: boolean;
}
```

## Development Setup

### Prerequisites

- Node.js v18+
- npm v8+
- Supabase account and project

### Environment Variables

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
PORT=3002
NODE_ENV=development
```

### Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start simple server (no client)
npm run simple:dev
``` 
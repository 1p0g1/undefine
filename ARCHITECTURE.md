# Un-Define Architecture

_Last updated: April 2025_

## Overview

Un-Define is a mobile-first word game where users guess a daily hidden word using progressive hints tied to the acronym DEFINE. Each incorrect guess reveals the next hint. The app is built with a lightweight, anonymous-first philosophy—streaks and identity are managed locally, while performance data is submitted to Supabase.

## Project Structure

```
undefine/
├── client/                   # Frontend (Vite + React + TS)
│   ├── pages/               # Game UI and layout
│   ├── components/          # DEFINE visual logic
│   ├── services/            # API calls
│   └── utils/               # Helpers and game logic
│
├── server/                  # Backend (Express + TS)
│   ├── routes/              # API routes: /word, /guess, /hint, /streak, /submit-score
│   ├── services/            # SupabaseClient, GameService, etc.
│   ├── types/               # Shared TS types
│   └── server.ts            # Main entry point
│
├── supabase/                # SQL schema + seed scripts
├── .env                     # Secrets (ignored)
└── ARCHITECTURE.md          # You're here
```

## Tech Stack

| Layer     | Technology                  |
|-----------|----------------------------|
| Frontend  | React + TypeScript (Vite)  |
| Backend   | Node.js + Express + TypeScript |
| Database  | Supabase (PostgreSQL)      |
| Hosting   | Vercel (frontend) + TBD (backend) |

## API Endpoints

1. **GET /api/word**
   - Returns today's word (definition only)
   - Response: `{ gameId, definition }`

2. **POST /api/guess**
   - Submits a guess and updates progress
   - Body: `{ gameId, guess }`
   - Response: `{ correct, gameState }`

3. **GET /api/hint/:gameId**
   - Returns next hint in DEFINE order
   - Response: `{ hint, type }`

4. **GET /api/streak-status**
   - Returns user's current and longest streaks

5. **POST /api/submit-score**
   - Submits leaderboard data
   - Body: `{ playerId, word, guessesUsed, usedHints, completionTime, nickname? }`
   - Response: `{ status: 'success' }`

## DEFINE Hint System

The game follows a strict DEFINE order for revealing hints:

| Letter | Meaning | Visual Feedback |
|--------|---------|----------------|
| D | Definition | ✅ Green: Correct guess |
| E | Etymology | ❌ Red: Wrong guess revealed hint |
| F | First letter | ⚪ Grey: Unused |
| I | In a sentence | |
| N | Number of letters | |
| E | Equivalents (synonyms) | |

## Local Identity System

- No traditional login required
- Unique `playerId` stored in localStorage
- Optional nickname for leaderboard submissions
- Local storage of streak and game history (Wordle-style)

## Database Architecture

### Supabase Tables

1. **words**
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

2. **game_sessions**
```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_id UUID REFERENCES words(id),
  guesses TEXT[],
  revealed_clues TEXT[],
  clue_status JSONB,
  is_complete BOOLEAN,
  is_won BOOLEAN,
  start_time TIMESTAMP,
  end_time TIMESTAMP
);
```

3. **scores**
```sql
CREATE TABLE scores (
  id UUID PRIMARY KEY,
  player_id TEXT NOT NULL,
  nickname TEXT,
  word TEXT NOT NULL,
  guesses_used INTEGER,
  used_hint BOOLEAN,
  completion_time_seconds INTEGER,
  submitted_at TIMESTAMP DEFAULT now()
);
```

4. **leaderboard_summary**
```sql
CREATE TABLE leaderboard_summary (
  id UUID PRIMARY KEY,
  player_id TEXT NOT NULL,
  word TEXT NOT NULL,
  rank INTEGER,
  was_top_10 BOOLEAN,
  best_time INTEGER,
  guesses_used INTEGER,
  date DATE DEFAULT current_date
);
```

5. **user_stats**
```sql
CREATE TABLE user_stats (
  player_id TEXT PRIMARY KEY,
  top_10_count INTEGER DEFAULT 0,
  best_rank INTEGER,
  longest_streak INTEGER,
  current_streak INTEGER,
  average_completion_time FLOAT,
  last_played_word TEXT
);
```

## Environment Variables

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
PORT=3001
NODE_ENV=development
```

## File Protection Rules

The following files are protected from automated edits:
- `ARCHITECTURE.md`
- `README.md`
- `.env*` (including `.env.production`, `.env.example`)

These files are human-maintained and serve as the canonical source of truth. All automated refactoring must be explicitly approved. 
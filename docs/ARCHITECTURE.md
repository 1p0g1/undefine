🧠 Un-Define: Architecture Overview

Overview

Un-Define is a daily word-guessing game where users try to identify a target word based on progressive hints revealed across six clues: D, E, F, I, N, E. Each hint aligns with a linguistic property:

D: Definition

E: Etymology

F: First Letter

I: In a Sentence (Usage)

N: Number of Letters

E2: Equivalents (Synonyms)

## Project Structure

The project follows a monorepo structure with npm workspaces:

- **client**: React frontend application
- **server**: Express backend API
- **packages/shared-types**: Shared TypeScript type definitions
- **packages/***: Other shared packages

## Type System

The project uses a centralized type system in the `packages/shared-types` package:

- All shared types are defined in this package
- Types are exported and imported by both client and server
- Type definitions must be built before the rest of the application
- Import paths should use `@undefine/shared-types` without `/index.js`

🔧 Backend Architecture

Tech Stack

Node.js + Express (API)

Supabase (Database)

TypeScript (Full-stack)

Endpoints

GET /api/word

Returns a new word and starts a game session.

Creates entry in game_sessions with UUID and links to words.id

// Response
{
  gameId: string,
  word: string, // hidden on client
  clues: {
    D: string,
    E: string,
    F: string,
    I: string,
    N: number,
    E2: string[]
  }
}

POST /api/guess

Accepts a guess and compares it against the session word.

Normalises guess (trims, lowercases, removes unicode).

If guess is correct or guesses >= 6, game is marked complete.

// Request
{
  gameId: string,
  guess: string
}

// GuessResult Response
{
  isCorrect: boolean,
  guess: string,
  isFuzzy: boolean,
  fuzzyPositions: number[],
  gameOver: boolean
}

Backend Logic (processGuess)

const normalize = (text: string) => text.trim().toLowerCase().replace(/[\u200B\u200C\u200D]/g, '');

const normalizedGuess = normalize(guess);
const normalizedWord = normalize(session.word);
const isCorrect = normalizedGuess === normalizedWord;

const updatedGuesses = [...session.guesses, guess];
const isGameOver = isCorrect || updatedGuesses.length >= 6;

session.guesses = updatedGuesses;
session.isComplete = isGameOver;
session.isWinner = isCorrect;

Tables & Relationships

words

id UUID (PK)

word VARCHAR (UNIQUE)

definition, etymology, first_letter, in_a_sentence, number_of_letters, equivalents, difficulty

game_sessions

id UUID (PK)

word_id UUID (FK → words.id)

guesses TEXT[]

revealed_clues TEXT[]

clue_status JSONB

is_complete BOOL

is_won BOOL

start_time, end_time

user_stats

player_id TEXT (PK)

total_games, streak, longest_streak, etc.

scores

player_id (FK → user_stats)

word (FK → words.word)

guesses_used: INT

was_correct: BOOL

date_played

leaderboard_summary

Daily stats table for top scorers.

## 📦 TypeScript Import Rules

- Do **not** use `.js` extensions in imports inside `.ts` files.
- All imports should omit extensions entirely:
  ✅ `import { GameService } from './services/GameService'`
- This project uses `ts-node/esm` or `tsx`, which resolves `.ts` files natively.
- Import shared types from `@undefine/shared-types` without `/index.js`:
  ✅ `import { type Word } from '@undefine/shared-types'`
  ❌ `import { type Word } from '@undefine/shared-types/index.js'`

Why? Using `.js` will crash runtime unless you're compiling to `.js` files.


Relationships (SQL Constraints)

ALTER TABLE game_sessions
ADD CONSTRAINT fk_game_sessions_word FOREIGN KEY (word_id) REFERENCES words(id);

ALTER TABLE scores
ADD CONSTRAINT fk_scores_player FOREIGN KEY (player_id) REFERENCES user_stats(player_id);

ALTER TABLE scores
ADD CONSTRAINT fk_scores_word_text FOREIGN KEY (word) REFERENCES words(word);

ALTER TABLE leaderboard_summary
ADD CONSTRAINT fk_leaderboard_player FOREIGN KEY (player_id) REFERENCES user_stats(player_id);

🔐 Security

Supabase RLS enabled per table.

Anonymous users still tracked via player_id.

🧪 Testing

npm run test-backend: Runs integration tests for /api/word and /api/guess.

check-db.ts: Script to validate foreign key integrity + required word fields.

🧠 Future Ideas

Support user-auth (email or magic link)

Implement Word Pools & Zeitgeist modes

Add hint toggles & player streak rewards

❌ DO NOT

Let Cursor overwrite types.ts or words schema

Modify .env, ARCHITECTURE.md, or /src/config/supabase.ts without confirmation

🟢 Cursor Setup

To ensure Cursor is aligned:

Protect types.ts and schema.sql

Add top-of-file comments to freeze structure

Keep this architecture doc as source of truth

## 🗄️ Supabase Schema

### words
- id: UUID (PK)
- word: TEXT (UNIQUE)
- definition: TEXT
- etymology: TEXT
- first_letter: TEXT
- in_a_sentence: TEXT
- number_of_letters: INTEGER
- equivalents: TEXT (comma-separated synonyms)
- difficulty: TEXT

### game_sessions
- id: UUID (PK)
- word_id: UUID (FK → words.id)
- word: TEXT
- guesses: TEXT[]
- guesses_used: INTEGER
- revealed_clues: TEXT[]
- clue_status: JSONB
- is_complete: BOOLEAN
- is_won: BOOLEAN
- start_time: TIMESTAMP
- end_time: TIMESTAMP

### user_stats
- player_id: TEXT (PK)
- games_played: INTEGER
- games_won: INTEGER
- average_guesses: FLOAT
- average_time: FLOAT
- current_streak: INTEGER
- longest_streak: INTEGER
- last_played_at: TIMESTAMP

### scores
- id: UUID (PK)
- player_id: TEXT (FK → user_stats.player_id)
- word: TEXT
- guesses_used: INTEGER
- was_correct: BOOLEAN
- completion_time_seconds: INTEGER
- used_hint: BOOLEAN
- nickname: TEXT
- created_at: TIMESTAMP

### users
- id: UUID (PK)
- username: TEXT (UNIQUE)
- created_at: TIMESTAMP
# Undefine Game Implementation Tracker

## 📋 Project Rules
- **Always check this tracker file** before starting any new task
- **Update this file** after completing any task or making significant changes
- **Reference this file** when discussing project status or planning next steps
- **Keep task statuses current** by marking completed items with ✅ and in-progress items with 🚧
- **Add new tasks** under appropriate sections as they are identified

As you complete tasks and reference relevant files, update this file as our memory to help with future tasks.

---

## ✅ Completed Tasks
- [x] Established rule to always check, use, and update this tracker file
- [x] Fixed broken imports in `App.tsx` by replacing `@/components/` with relative paths
- [x] Cleaned up unused aliases in `vite.config.ts` and `tsconfig.json`
- [x] Verified `Confetti.tsx` and `Leaderboard.tsx` exist under `client/src/components`
- [x] Confirmed frontend (`App.tsx`) and backend (`app.ts`) are separate entry points
- [x] Installed `react-confetti` correctly via `npm install`
- [x] Moved away from broken `@/components/` Vite alias imports in `App.tsx`
- [x] Confirmed Supabase `words` table and FK constraints are present
- [x] Audited `SupabaseClient.ts` to check word fetch method
- [x] Enhanced `Leaderboard.tsx` with error handling, retry logic, and performance optimizations
- [x] Added accessibility improvements to `Leaderboard.tsx`
- [x] Implemented memory leak prevention in `Leaderboard.tsx`
- [x] Fixed UI/UX layout for clean, mobile-first design in `App.tsx` and `App.css`
- [x] Fixed clue section flickering by conditionally rendering only when `wordData` is loaded
- [x] Improved visual hierarchy with timer at top, DEFINE boxes, input, and hints
- [x] Enhanced button and input styling for better user experience
- [x] Fixed guess submission functionality by properly parsing API responses
- [x] Added Enter key support for submitting guesses
- [x] Corrected mobile layout issues with improved spacing and alignment
- [x] Fixed critical bug with word comparison in `SupabaseClient.ts` (isCorrect always false)
- [x] Enhanced normalization for word comparison with more robust string handling
- [x] Added extensive debug logging for word comparison and win conditions
- [x] Fixed frontend handling of win conditions with explicit boolean checks
- [x] Fixed word synchronization between game session and words table
- [x] Added word recovery mechanism in case of missing session data
- [x] Enhanced logging for word comparison and game state tracking
- [x] Made words.word the source of truth for word validation
- [x] Added proper word data recovery from words table
- [x] Improved word comparison logging and validation
- [x] Deprecated legacy word field in favor of words.word
- [x] Added warnings for legacy word field mismatches
- [x] Fixed game session word mismatch bug:
  - Updated getDailyWord() to return consistent word based on date
  - Modified startGame() to use word from getDailyWord()
  - Added debug logging to confirm word consistency
  - Ensured all word comparisons use session.words.word
  - Added date-based word assignment in Supabase
- [x] Cleaned up WordService.ts for production:
  - Removed all legacy provider support and mock client code
  - Removed unused fields (isPlural, numSyllables, timesUsed, etc.)
  - Aligned with Supabase DatabaseClient interface
  - Added proper type safety and error handling
  - Removed obsolete data transformations
  - Added validation for DEFINE clue structure
  - Updated to use GameWord and WordClues types
- [x] Identified unused components for removal:
  - KeyboardShortcutsHelp.tsx (unused)
  - Modal.tsx (replaced by GameOverModal)
  - Pagination.tsx (admin feature only)
  - SearchBar.tsx (admin feature only)
  - SwipeableRow.tsx (admin feature only)
  - TableRow.tsx (admin feature only)
  - WordForm.tsx (admin word management only)

---

## 🚧 In Progress Tasks
- [ ] Fix `DefineHints.tsx` "unique key" warning in React
- [ ] Remove ghost/dangling files (e.g. `api-test.cjs`, unused test stubs)

---

## 📥 Upcoming Tasks

### Phase 1: Stabilise Core Gameplay
- [ ] Verify `/api/word` returns a word and valid gameId from Supabase `words`
- [ ] Verify `/api/guess` checks the guess, returns `isCorrect`, `fuzzyPositions`, `rank`
- [ ] Add graceful error handling in both endpoints if Supabase fails
- [ ] Finish `/api/hint/:gameId` to fetch clue progression (D → E2)
- [ ] Enable fallback to `words.ts` locally if Supabase is down or returns null
- [ ] Remove all mock logic, ensure real game sessions are created via Supabase
- [ ] Ensure frontend game state and backend data stay in sync via `gameId`

### Phase 2: Leaderboards & Stats
- [x] Implement robust error handling and retry logic in `Leaderboard.tsx`
- [x] Add performance optimizations to leaderboard rendering
- [ ] Confirm Supabase `leaderboard_summary` table is being written to on game complete
- [ ] Add ranking logic on server-side after correct guess (within `/api/guess`)
- [ ] Fetch top 10 scores in `Leaderboard.tsx` via `GET /api/leaderboard`
- [ ] Populate user profile data into `user_stats` table after each session
- [ ] Implement streak logic with fields `current_streak`, `longest_streak`
- [ ] Display player rank, streak stats, and best time in post-game view

### Phase 3: Architecture, Dev Experience & Scalability
- [ ] Final cleanup of unused code and legacy files: Postgres, Redis, `.cjs`, test stubs
- [ ] Wrap all Supabase interactions in `SupabaseClient` with fallback logging
- [ ] Add type-safe fallbacks when Supabase returns null or error (logging + recovery)
- [ ] Add try/catch around all DB operations
- [ ] Validate `.env` variables on boot; exit if any required keys are missing
- [ ] Configure aliasing in `vite.config.ts` (`@/components`, etc) and document usage
- [ ] Configure Vite to support mobile builds; test output with `vite build`
- [ ] Optional: Add basic monitoring/logging (e.g. console or third-party like Sentry)

---

## 🗂️ Relevant Files
- `src/App.tsx` → Main game component, handles word state, hint progression, confetti, and leaderboard trigger ✅
- `src/components/Leaderboard.tsx` → Shows top 10 players with retry logic, error handling, and performance optimizations ✅
- `src/components/Confetti.tsx` → Displays celebratory animation when a user wins ✅
- `src/config/SupabaseClient.ts` → Singleton Supabase client used across game API
- `src/api/word.ts`, `guess.ts` → Backend route handlers for game logic (validate usage)
- `src/hooks/useLocalGameState.ts` → Custom hook tracking streaks and nickname

---

## 🧠 Implementation Details

### Architecture Decisions
- Use React + Vite frontend with Supabase as single source of truth
- Use Node.js Express backend for `/api` routes
- All state management lives inside `App.tsx` or custom hooks
- Leaderboard component uses memoization and cleanup for optimal performance

### Data Flow Descriptions
- `/api/word` → fetches random word (and gameId) from Supabase `words`
- `/api/guess` → posts guess, returns correctness, hint progress, rank
- WordData structure uses clues mapped to DEFINE: `D`, `E`, `F`, `I`, `N`, `E2`
- Leaderboard fetches with retry logic and graceful error handling

### Technical Components
- `SupabaseClient.ts` handles all DB interactions
- All game session state is tied to `gameId`
- Frontend is mobile-first; tailwind-style responsive classes recommended
- Components use React.memo and useCallback for performance optimization
- Error boundaries and cleanup functions prevent memory leaks

### Environment Config
- `.env` must include `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DB_PROVIDER=supabase`
- Only `supabase` should be active; other DB options (Postgres/Redis) have been deprecated and removed

---

## 🧹 Cleanup Tasks

### Legacy Code Removal
- [x] Identified legacy files for removal:
  - `test-api-word.cjs`
  - `test-words-table.cjs`
  - `check-tables.cjs`
  - `demo/` directory with legacy test files
- [x] Found Redis references in `src/config/database.ts` to be removed
- [x] Remove all `.cjs` files from root directory
- [x] Clean up legacy database references in `.env.example`
- [x] Remove Redis/Postgres types from `src/types/index.ts`

### Core Components (Keep)
1. **Initial Word Fetch** ✅
   - `initializeGame()` in App.tsx
   - `/api/word` endpoint
   - `GameLoader.tsx`
   - `WordData` type

2. **Guess Submission** ✅
   - `handleGuess()`
   - `/api/guess` endpoint
   - `handleGameState()`
   - `GameState` type

3. **Hint System** ✅
   - `DefineBoxes.tsx`
   - `HintContent.tsx`
   - `HINT_INDICES`

4. **Game State Management** ✅
   - Core App.tsx hooks
   - Game state logic

5. **Win/Loss Logic** ✅
   - Win/loss detection in App.tsx

6. **UI Guards** ✅
   - `GameLoader.tsx`

### Auxiliary Components (Keep but Secondary)
- `Confetti.tsx` ✅
- `Leaderboard.tsx` ✅
- `Timer.tsx` ✅
- `GameOverModal.tsx` ✅
- `GameSummary.tsx` ✅
- Toast system ✅

### Migration Steps
1. [x] Remove all legacy database files
2. [x] Update environment templates
3. [x] Clean up type definitions
4. [x] Verify Supabase connections
5. [x] Test core components
6. [x] Test auxiliary components
7. [ ] Update documentation

### Next Steps
1. [ ] Remove `demo/` directory
2. [ ] Clean up any remaining legacy scripts in `scripts/` directory
3. [ ] Update README.md with current Supabase-only architecture
4. [ ] Add deployment instructions for Render

---

> ✅ Update the task list as you progress  
> 🔄 Keep "Relevant Files" updated with changes  
> 🧠 Maintain clean documentation of data flow, architecture, and error handling  

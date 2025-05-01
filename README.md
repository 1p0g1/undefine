# Un- Define

A word-guessing game where players try to guess a word based on its definition and progressive hints.

## 📚 Documentation

- [Project Architecture](docs/ARCHITECTURE.md) - Technical overview and design decisions
- [Project Tracker](docs/Undefine_Project_Tracker.md) - Development progress and task tracking
- [Release Notes](docs/RELEASE_NOTES.md) - Version history and changes
- [Testing Guide](docs/TESTING.md) - Testing procedures and guidelines
- [Testing Checklist](docs/TESTING_CHECKLIST.md) - Pre-release testing checklist
- [Smoke Test Checklist](docs/SMOKE_TEST_CHECKLIST.md) - Quick validation tests
- [Import Guide](docs/IMPORT_GUIDE.md) - Guide for importing new words
- [Deployment Guide](docs/DEPLOYMENT.md) - Guide for deploying the application
- [Clean Up Checklist](docs/Clean_Up.md) - Server and build cleanup checklist

## 🧪 Testing Features

### Random Word Testing

During development or testing, the application provides a way to test with random words:

1. **Frontend**: When in development mode, a "Test with Random Word" button appears on the loading screen
2. **API**: Access the `/api/random` endpoint directly: `GET http://localhost:3001/api/random`
3. **Purpose**: This feature is specifically for testing and allows bypassing the daily word logic

> ⚠️ **Note**: The random word feature is only available in development mode and is intended for testing purposes only.

## 🛠️ Utility Scripts

The project includes several utility scripts in the `scripts/` directory:

- `scripts/apply-migrations.sh` - Applies Supabase database migrations
- `scripts/test-db-client.ts` - Tests the Supabase client connection and tables
- `scripts/manage_words.sh` - Script for managing the word database
- `scripts/setup-testing-mode.sh` - Sets up the testing environment
- `scripts/dev.sh` - Development server startup script

## 📊 Data Files

Word data and templates are stored in the `data/` directory:

- `data/un_define_all_unique_word_clues_v2.csv` - Main words database
- `data/new_words_template.csv` - Template for adding new words

## Project Structure

This is a TypeScript monorepo with:

- **Frontend**: Next.js + React application in `client/`
- **Backend**: Express server in `server/`
- **Database**: Supabase schema in `supabase/`
- **Scripts**: Utility scripts in `scripts/`
- **Data**: CSV files and templates in `data/`
- **Documentation**: Markdown documentation in `docs/`

## 🗄️ Supabase Schema

### Tables

#### words
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| word | text | The word to guess |
| definition | text | Word definition |
| etymology | text | Word etymology |
| first_letter | char(1) | First letter hint |
| in_a_sentence | text | Example sentence |
| number_of_letters | integer | Word length |
| equivalents | text[] | Array of synonyms |
| difficulty | text | 'Easy', 'Medium', or 'Hard' |
| times_used | integer | Number of times used |
| last_used_at | timestamp | Last usage timestamp |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### game_sessions
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| word_id | uuid | Foreign key to words.id |
| word | text | The word being guessed |
| guesses | text[] | Array of guesses made |
| guesses_used | integer | Number of guesses used |
| revealed_clues | text[] | Array of revealed clue types |
| clue_status | jsonb | Status of each clue |
| is_complete | boolean | Whether game is finished |
| is_won | boolean | Whether game was won |
| start_time | timestamp | Game start time |
| end_time | timestamp | Game end time |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### scores
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| player_id | uuid | Player identifier |
| word | text | Word that was guessed |
| guesses_used | integer | Number of guesses used |
| used_hint | boolean | Whether hints were used |
| completion_time_seconds | integer | Time taken to complete |
| nickname | text | Optional player nickname |
| created_at | timestamp | Score timestamp |

#### user_stats
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| player_id | uuid | Player identifier |
| games_played | integer | Total games played |
| games_won | integer | Total games won |
| current_streak | integer | Current win streak |
| longest_streak | integer | Longest win streak |
| average_guesses | float | Average guesses per game |
| average_time | float | Average completion time |
| last_played_at | timestamp | Last game timestamp |
| created_at | timestamp | Stats creation time |
| updated_at | timestamp | Last update time |

### Relationships
- `game_sessions.word_id` → `words.id`
- `scores.player_id` → `user_stats.player_id`

## Getting Started

### Required Dependencies

The project requires the following key dependencies:

- [x] `@vitejs/plugin-react` (used in `vite.config.js` for React support)
- [x] `eslint` (used for code linting in build scripts)
- [x] TypeScript (for type checking and compilation)
- [x] Vite (for bundling client code)

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/1p0g1/undefine.git
cd undefine
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Required environment variables:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
NODE_ENV=development
```

### Environment Variables Guide

This application uses a robust environment variable management system:

#### Server Environment Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Application environment (`development`, `production`, `test`) |
| `PORT` | No | `3001` | Port for the API server |
| `DB_PROVIDER` | Yes | - | Database provider (`supabase`, `mock`) |
| `SUPABASE_URL` | Yes | - | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | - | Supabase anonymous key |
| `JWT_SECRET` | Yes (prod) | - | Secret key for JWT token signing |
| `JWT_EXPIRY` | No | `24h` | JWT token expiry time |
| `ENABLE_METRICS` | No | `false` | Enable/disable metrics collection |

#### Client Environment Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `http://localhost:5179` | API server URL for client requests |

#### Environment Files
- `.env.development` - Development environment settings
- `.env.production` - Production environment settings
- `.env` - Fallback environment settings
- `client/.env` - Client-specific environment settings
- `client/.env.production` - Client production environment settings

#### Utilities
- `src/utils/validateEnv.ts` - Validates environment variables at startup
- `scripts/sync-render-env.js` - Tool to sync environment variables to Render

### 🧪 Common Build Error on Render

If you see: `Cannot find package '@vitejs/plugin-react'` in your Render build logs:

✅ Ensure `@vitejs/plugin-react` is in **dependencies** not devDependencies  
✅ Or set `NODE_ENV=development` in your Render environment settings  

This happens because Render skips installing devDependencies in production builds by default, but Vite needs this plugin at build time.

4. Start the development server:
```bash
npm run dev
```

This will start both the backend server and the frontend development server.

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run simple:dev` - Start only the backend server
- `npm run build` - Build the application for production

## Game Rules

1. You get a word's definition
2. Each wrong guess reveals a new hint in DEFINE order:
   - **D**: Definition (shown first)
   - **E**: Etymology
   - **F**: First Letter
   - **I**: In a Sentence
   - **N**: Number of Letters
   - **E**: Equivalents (synonyms)

3. The game ends when you:
   - Guess the word correctly, OR
   - Use all 6 guesses

## Styling

The game uses a carefully selected typography and visual design system:

### Typography
- Primary Font: **Libre Baskerville** (Google Fonts)
  - A classic serif font with excellent readability
  - Used for all main text, headings, and UI elements
  - Weights: 400, 700 (normal and italic variants)
  - CSS Variable: `--font-primary`

- Monospace Font: **Special Elite** (Google Fonts)
  - Used for special text elements
  - CSS Variable: `--font-monospace`

### Color Palette
- Primary Colors:
  - Primary Blue: `#1a237e` - Used for main UI elements and headings
  - Game Over Red: `#dc2626` - Used for game over states and revealed letters
  - Paper Background: `#faf7f2` - Subtle off-white for the main container

### Visual Elements
- Letter Boxes:
  - Size: 3.5rem × 3.5rem
  - Red border and light red background for revealed state
  - Large serif letters (Libre Baskerville) for an elegant look

- Input Field:
  - Clean, borderless design with only bottom border
  - Centered text with italic placeholder
  - Larger font size (1.4rem) for better visibility

- Timer:
  - Large, elegant display (2rem)
  - Uses tabular numbers for stable display
  - Minimal styling without decorative elements

To modify the design:
1. Update the Google Fonts import in `client/src/App.css`
2. Modify the CSS variables in `:root`:
```css
:root {
  --font-primary: 'Libre Baskerville', serif;
  --font-monospace: 'Special Elite', monospace;
  --primary-blue: #1a237e;
  --game-over-red: #dc2626;
  /* ... other variables ... */
}
```

## License

[MIT](LICENSE)

# Un- Define

A word-guessing game where players try to guess a word based on its definition and progressive hints.

## Project Structure

This is a TypeScript monorepo with:

- **Frontend**: Next.js + React application in `client/`
- **Backend**: Express server in `server/`
- **Database**: Supabase schema in `supabase/`

## Getting Started

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
cp .env.example .env.development
```

Required environment variables:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
PORT=3001
NODE_ENV=development
```

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

## License

[MIT](LICENSE)

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

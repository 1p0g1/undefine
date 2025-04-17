# Un-Define Frontend

The React frontend for the Un-Define word-guessing game.

## 🛠️ Tech Stack

- React 18
- TypeScript
- Vite
- ESLint + TypeScript ESLint

## 🚀 Development

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Required environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:3001
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📦 Building

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 🎨 Styling

The game uses a carefully selected typography and visual design system:

### Typography
- Primary Font: **Libre Baskerville** (Google Fonts)
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
1. Update the Google Fonts import in `src/App.css`
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

## 🔧 Development Tools

### ESLint Configuration

The project uses a strict TypeScript-aware ESLint configuration. To enable additional rules:

```js
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

### React-specific Lint Rules

We use [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific linting:

```js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

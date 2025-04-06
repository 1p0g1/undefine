# Un-Define

A word-guessing game where players try to guess a word based on its definition.

## Project Structure

This is a TypeScript monorepo with:

- **Frontend**: Vite + React application in `client/`
- **Backend**: Express server in `src/`
- **Shared Types**: Common TypeScript types in `packages/shared-types/`

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

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

4. Start the development server:
```bash
npm run simple:dev
```

This will start both the backend server and the frontend development server.

## Available Scripts

- `npm run simple:dev` - Start the development server with the simple Express setup
- `npm run debug:dev` - Start the development server with debugging enabled
- `npm run build` - Build the application for production
- `npm run test:api` - Run API tests

## Testing

For a comprehensive testing guide, see [TESTING.md](./TESTING.md).

## License

[MIT](LICENSE)

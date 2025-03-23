# ReverseDefine

A word-guessing game where players try to guess words based on their definitions. Built with modern web technologies and real-time feedback.

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- TailwindCSS

### Backend
- Node.js
- Express
- TypeScript
- JWT Authentication
- Prometheus Metrics

### Database
- Snowflake (Primary)
- MongoDB (Backup)

## Prerequisites

- Node.js 18+
- npm or yarn
- Snowflake account
- MongoDB account (optional, for backup)

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/reversedefine.git
cd reversedefine
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_PROVIDER=snowflake  # or 'mongodb' for backup
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_USERNAME=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_DATABASE=your_database
SNOWFLAKE_WAREHOUSE=your_warehouse
SNOWFLAKE_POOL_SIZE=10
SNOWFLAKE_CONNECTION_TIMEOUT=10000

# Authentication
JWT_SECRET=your_jwt_secret

# Redis (for session management)
REDIS_URI=your_redis_uri
```

4. Set up the database:
```bash
# Initialize Snowflake tables
npm run db:init
```

## Running Locally

1. Start the backend server:
```bash
# From the root directory
npm run dev
```

2. Start the frontend development server:
```bash
# From the client directory
cd client
npm run dev
```

3. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Database Setup

1. Create a Snowflake account if you haven't already
2. Set up a new database and warehouse
3. Run the initialization scripts:
```bash
npm run db:init
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/validate` - Validate JWT token

### Game
- `GET /api/word` - Get a random word (protected)
- `POST /api/guess` - Submit a guess (protected)

### Statistics
- `GET /api/stats/daily` - Get daily game statistics

### Health
- `GET /health` - Health check endpoint

## Authentication Flow

1. **User Login**
   - User submits credentials
   - Server validates against Snowflake
   - JWT token generated and returned

2. **Token Validation**
   - Client includes token in Authorization header
   - Server verifies token signature
   - Server checks user existence in Snowflake

3. **Protected Routes**
   - All game-related endpoints require valid JWT
   - User context available in request object

## Database Schema

### Users Table
```sql
CREATE TABLE USERS (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
  last_login_at TIMESTAMP_NTZ
);
```

### Words Table
```sql
CREATE TABLE WORDS (
  id VARCHAR(36) PRIMARY KEY,
  word VARCHAR(255) NOT NULL,
  definition TEXT NOT NULL,
  part_of_speech VARCHAR(50) NOT NULL,
  created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);
```

### Leaderboard Table
```sql
CREATE TABLE LEADERBOARD (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  word VARCHAR(255) NOT NULL,
  guesses INT NOT NULL,
  completion_time_seconds INT NOT NULL,
  used_hint BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);
```

### User Stats Table
```sql
CREATE TABLE USER_STATS (
  username VARCHAR(255) PRIMARY KEY,
  games_played INT DEFAULT 0,
  average_guesses FLOAT DEFAULT 0,
  average_time FLOAT DEFAULT 0,
  best_time INT DEFAULT NULL,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  top_ten_count INT DEFAULT 0,
  last_result VARCHAR(10) DEFAULT NULL,
  last_updated TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Snowflake for providing the database infrastructure
- The React team for the amazing frontend framework
- All contributors who have helped shape this project

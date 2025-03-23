# Architecture Overview

_Last updated: March 2025 – Version 1.0 Release_

## Project Structure

```
reversedefine/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # Frontend services
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utility functions
│   │   └── App.tsx        # Main application component
│   └── package.json
│
└── src/                   # Backend Node.js application
    ├── config/           # Configuration files
    │   ├── database/     # Database configurations
    │   └── auth/         # Authentication settings
    ├── services/         # Business logic services
    ├── routes/           # API route handlers
    ├── middleware/       # Express middleware
    ├── types/           # TypeScript type definitions
    └── index.ts         # Application entry point
```

## Service Layer Architecture

### Core Services

#### GameService
- Handles game logic and state management
- Manages word selection and validation
- Tracks game progress and completion
- Interfaces with StatsService for score updates

```typescript
class GameService {
  async getRandomWord(): Promise<WordEntry>
  async submitGuess(word: string, guess: string): Promise<GuessResult>
  async getGameState(): Promise<GameState>
  async resetGame(): Promise<void>
}
```

#### StatsService
- Manages user statistics and leaderboard
- Tracks game completion metrics
- Handles streak calculations
- Updates user rankings

```typescript
class StatsService {
  async updateUserStats(userId: string, gameResult: GameResult): Promise<void>
  async getLeaderboard(): Promise<LeaderboardEntry[]>
  async getUserStats(userId: string): Promise<UserStats>
  async getDailyStats(): Promise<DailyStats>
}
```

### Database Abstraction Layer

#### DatabaseClient Interface
```typescript
interface DatabaseClient {
  // Word operations
  getWords(page: number, limit: number): Promise<WordEntry[]>
  getWordById(id: string): Promise<WordEntry | null>
  searchWords(query: string): Promise<WordEntry[]>
  
  // User operations
  getUserByEmail(email: string): Promise<User | null>
  createUser(user: User): Promise<User>
  updateUser(user: User): Promise<User>
  
  // Stats operations
  getDailyStats(): Promise<DailyStats>
  updateUserStats(stats: UserStats): Promise<void>
  getLeaderboard(): Promise<LeaderboardEntry[]>
}
```

#### Implementations
1. **SnowflakeClient**
   - Primary database implementation
   - Optimized for analytics and reporting
   - Handles complex queries efficiently

2. **MongoDBClient**
   - Backup database implementation
   - Provides fallback functionality
   - Maintains data consistency

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

## Authentication Flow

### Session Management
1. **Login Process**
   ```mermaid
   sequenceDiagram
      Client->>Server: POST /api/auth/login
      Server->>Snowflake: Validate credentials
      Snowflake-->>Server: User data
      Server->>Server: Generate JWT
      Server-->>Client: JWT token
   ```

2. **Token Validation**
   - JWT tokens contain user ID and email
   - Tokens expire after 24 hours
   - Refresh token rotation implemented
   - Redis used for session storage

### Protected Routes
- All game-related endpoints require valid JWT
- Token validation middleware checks:
  1. Token presence
  2. Token validity
  3. User existence in database
  4. Rate limiting

## Game Flow

### Typical Game Round
1. **Game Initialization**
   ```mermaid
   sequenceDiagram
      Client->>Server: GET /api/word
      Server->>Database: Get random word
      Database-->>Server: Word data
      Server-->>Client: Word definition
   ```

2. **Guess Submission**
   ```mermaid
   sequenceDiagram
      Client->>Server: POST /api/guess
      Server->>GameService: Validate guess
      GameService->>StatsService: Update stats
      StatsService->>Database: Save results
      Server-->>Client: Guess result
   ```

3. **Game Completion**
   ```mermaid
   sequenceDiagram
      Client->>Server: POST /api/guess (correct)
      Server->>StatsService: Record completion
      StatsService->>Database: Update leaderboard
      Server-->>Client: Game summary
   ```

## Abstraction Layers

### Database Abstraction
- **DatabaseClient Interface**
  - Standardizes database operations
  - Enables easy provider switching
  - Maintains consistent API

### Service Abstraction
- **GameService**
  - Abstracts game logic
  - Manages state transitions
  - Handles validation

- **StatsService**
  - Manages statistics
  - Handles leaderboard
  - Tracks user progress

### API Abstraction
- **RESTful Endpoints**
  - Standard HTTP methods
  - Consistent response format
  - Clear error handling

## Error Handling

### Error Types
1. **Validation Errors**
   - Input validation
   - Business rule violations
   - Format errors

2. **Authentication Errors**
   - Invalid credentials
   - Expired tokens
   - Missing permissions

3. **Database Errors**
   - Connection issues
   - Query failures
   - Constraint violations

### Error Response Format
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  status: number;
}
```

## Performance Considerations

### Caching Strategy
- Redis for session storage
- Client-side caching for static assets
- Database query caching

### Database Optimization
- Indexed columns for frequent queries
- Connection pooling
- Query optimization

### Frontend Optimization
- Code splitting
- Lazy loading
- Asset compression

## Monitoring and Metrics

### Prometheus Integration
- Request latency
- Error rates
- Database performance
- User activity metrics

### Logging Strategy
- Structured logging
- Error tracking
- Performance monitoring
- User activity logging

## API Endpoints

### Authentication
- `POST /api/auth/login` – Login with email & password
  - Request: `{ email: string, password: string }`
  - Response: `{ token: string, user: User }`
  - Purpose: Authenticate user and return JWT token

- `GET /api/auth/validate` – Validate JWT token
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ valid: boolean, user: User }`
  - Purpose: Verify token validity and get user context

### Game
- `GET /api/word` – Fetch today's word
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ word: string, definition: string, partOfSpeech: string }`
  - Purpose: Get current game word and definition

- `POST /api/guess` – Submit a word guess
  - Headers: `Authorization: Bearer <token>`
  - Request: `{ guess: string }`
  - Response: `{ correct: boolean, feedback: string, gameState: GameState }`
  - Purpose: Process user guess and return feedback

- `GET /api/hint` – Get a hint for current word
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ hint: string, hintType: string }`
  - Purpose: Provide additional help for current word

### Statistics
- `GET /api/stats/daily` – Daily platform metrics
  - Response: `{ totalPlayers: number, averageGuesses: number, averageTime: number, completionRate: number }`
  - Purpose: Get aggregate daily statistics

- `GET /api/leaderboard` – Top streaks and players
  - Response: `{ entries: LeaderboardEntry[], timeRange: string }`
  - Purpose: Display global leaderboard

- `GET /api/stats/user` – User statistics
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ gamesPlayed: number, averageGuesses: number, bestTime: number, currentStreak: number }`
  - Purpose: Show user's personal statistics

### Health & Monitoring
- `GET /health` – Health check endpoint
  - Response: `{ status: string, timestamp: string, services: ServiceStatus[] }`
  - Purpose: Monitor system health

- `GET /metrics` – Prometheus metrics endpoint
  - Response: Prometheus-formatted metrics
  - Purpose: Collect system metrics

## Platform Metrics

### Metrics Collection
The system collects comprehensive platform metrics to track usage patterns and system performance.

### Platform Metrics Table
```sql
CREATE TABLE PLATFORM_METRICS (
  id VARCHAR(36) PRIMARY KEY,
  date DATE NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  total_plays INT DEFAULT 0,
  unique_users INT DEFAULT 0,
  avg_guesses FLOAT DEFAULT 0,
  avg_completion_time FLOAT DEFAULT 0,
  completion_rate FLOAT DEFAULT 0,
  error_rate FLOAT DEFAULT 0,
  api_latency FLOAT DEFAULT 0,
  created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);
```

### Metrics Fields

| Field               | Type         | Description                        |
|--------------------|--------------|------------------------------------|
| date               | DATE         | Date of the metric                 |
| timezone           | STRING       | User timezone                      |
| total_plays        | INT          | Total games played                 |
| unique_users       | INT          | Distinct users who played          |
| avg_guesses        | FLOAT        | Avg. number of guesses per game    |
| avg_completion_time| FLOAT        | Avg. time to complete a word (sec) |
| completion_rate    | FLOAT        | % of games completed successfully  |
| error_rate         | FLOAT        | % of failed API requests           |
| api_latency        | FLOAT        | Average API response time (ms)     |

### Metrics Collection Process
1. **Real-time Collection**
   - Game completion events
   - API request/response times
   - Error occurrences
   - User sessions

2. **Aggregation**
   - Daily rollup of metrics
   - Timezone-aware grouping
   - Statistical calculations

3. **Usage**
   - Performance monitoring
   - User behavior analysis
   - System health tracking
   - Capacity planning

## Deployment Overview

### Infrastructure Components

#### Frontend
- **Platform**: Vercel
- **Framework**: React + Vite
- **Features**:
  - Automatic HTTPS
  - Global CDN
  - Edge Functions
  - Preview Deployments

#### Backend
- **Platform**: Node.js Express API
- **Deployment**: Separate from frontend
- **Features**:
  - Horizontal scaling
  - Load balancing
  - Health monitoring
  - Auto-recovery

#### Database
- **Primary**: Snowflake
  - Data warehousing
  - Analytics capabilities
  - Scalable storage
- **Backup**: MongoDB (Coming Soon)
  - Data redundancy
  - Failover support
  - Migration path

#### Caching
- **Platform**: Redis
- **Usage**:
  - Session storage
  - Rate limiting
  - Response caching
  - Real-time features

### CI/CD Pipeline

#### Development
1. **Code Review**
   - GitHub Pull Requests
   - Automated testing
   - Code quality checks

2. **Staging**
   - Preview deployments
   - Integration testing
   - Performance validation

3. **Production**
   - Automated deployment
   - Canary releases
   - Rollback capability

#### Monitoring
- **Application**: Prometheus + Grafana
- **Logging**: Structured logging
- **Alerts**: Automated notifications
- **Analytics**: Custom dashboards

### Security Measures
- SSL/TLS encryption
- JWT authentication
- Rate limiting
- Input validation
- XSS protection
- CSRF protection

### Scaling Strategy
- **Horizontal Scaling**: Multiple API instances
- **Database Scaling**: Snowflake auto-scaling
- **Caching**: Redis cluster
- **CDN**: Global edge network 
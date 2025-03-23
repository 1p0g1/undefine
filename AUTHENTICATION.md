# Authentication Documentation

## Environment Variables

Required environment variables for authentication:

```env
# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production

# Database Configuration
DB_PROVIDER=snowflake
SNOWFLAKE_ACCOUNT=your-account.region
SNOWFLAKE_USERNAME=your-username
SNOWFLAKE_PASSWORD=your-password
SNOWFLAKE_DATABASE=UNDEFINE
SNOWFLAKE_SCHEMA=PUBLIC
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_ROLE=your-role
```

## Authentication Flow

1. **Login Request**
   - Client sends POST request to `/api/auth/login` with email and password
   - Server validates email format and password length
   - Server queries Snowflake for user record
   - Server verifies password hash using bcrypt
   - If valid, server generates JWT token and updates last login timestamp
   - Server returns token and user info (excluding password)

2. **Token Refresh**
   - Client sends POST request to `/api/auth/refresh` with Bearer token
   - Server verifies token signature and expiry
   - Server checks if user still exists
   - If valid, server generates new token with fresh expiry
   - Server returns new token and user info

## API Endpoints

### Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "createdAt": "2024-03-20T12:00:00Z",
    "lastLoginAt": "2024-03-20T12:00:00Z"
  }
}
```

**Error Responses:**
```json
// 400 Bad Request - Invalid Input
{
  "error": "Invalid email format",
  "message": "Please enter a valid email address (e.g., user@example.com)"
}

// 401 Unauthorized - Invalid Credentials
{
  "error": "Invalid credentials"
}

// 500 Internal Server Error
{
  "error": "Authentication failed"
}
```

### Token Refresh

**Endpoint:** `POST /api/auth/refresh`

**Headers:**
```
Authorization: Bearer your-jwt-token
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "createdAt": "2024-03-20T12:00:00Z",
    "lastLoginAt": "2024-03-20T12:00:00Z"
  }
}
```

**Error Responses:**
```json
// 401 Unauthorized - Invalid Token
{
  "error": "Invalid token",
  "message": "Please provide a valid token"
}

// 401 Unauthorized - Expired Token
{
  "error": "Token expired",
  "message": "Please log in again"
}
```

## Testing

### Example cURL Commands

1. **Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your-password"
  }'
```

2. **Token Refresh:**
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Authorization: Bearer your-jwt-token"
```

### Creating Test Users

To create a test user with a hashed password:

1. Install bcrypt:
```bash
npm install bcrypt
```

2. Use Node.js REPL to generate a hash:
```javascript
const bcrypt = require('bcrypt');

// Generate a hash with 10 salt rounds
bcrypt.hash('your-password', 10).then(hash => {
  console.log(hash);
});
```

3. Insert the user into Snowflake:
```sql
INSERT INTO USERS (ID, EMAIL, PASSWORD_HASH, CREATED_AT)
VALUES (
  'user-uuid',
  'user@example.com',
  'generated-hash',
  CURRENT_TIMESTAMP()
);
```

## Security Notes

1. **Password Requirements:**
   - Minimum 8 characters
   - Stored as bcrypt hash with 10 salt rounds
   - Never stored or transmitted in plain text

2. **Token Security:**
   - JWT tokens expire after 8 hours
   - Tokens are signed with JWT_SECRET
   - Tokens contain only non-sensitive user data

3. **Error Handling:**
   - Generic error messages for security
   - Detailed logging for debugging
   - Rate limiting recommended for production 
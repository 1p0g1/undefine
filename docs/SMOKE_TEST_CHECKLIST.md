# Smoke Test Checklist

This document outlines the essential checks to perform after deploying ReverseDefine to ensure all core functionality is working correctly.

## Authentication Tests

### User Login
- [ ] Navigate to login page
- [ ] Enter valid credentials
- [ ] Verify successful login
- [ ] Check JWT token is received and stored
- [ ] Verify redirect to game page

### Token Validation
- [ ] Check token is included in Authorization header
- [ ] Verify token format (Bearer <token>)
- [ ] Test token expiration handling
- [ ] Verify invalid token rejection

## API Endpoint Tests

### Word Endpoint
- [ ] GET /api/word
  - [ ] Verify 200 status code
  - [ ] Check response structure:
    ```json
    {
      "word": "string",
      "definition": "string",
      "partOfSpeech": "string",
      "letterCount": number
    }
    ```
  - [ ] Confirm word and definition are not empty
  - [ ] Verify letterCount matches word length

### Guess Endpoint
- [ ] POST /api/guess
  - [ ] Submit correct guess
    - [ ] Verify 200 status code
    - [ ] Check correct response structure
    - [ ] Confirm stats update
  - [ ] Submit incorrect guess
    - [ ] Verify 200 status code
    - [ ] Check feedback structure
    - [ ] Confirm guess count increment

### Stats Endpoint
- [ ] GET /api/stats/daily
  - [ ] Verify 200 status code
  - [ ] Check response structure:
    ```json
    {
      "totalPlayers": number,
      "averageGuesses": number,
      "averageTime": number,
      "completionRate": number
    }
    ```
  - [ ] Confirm all numeric values are valid

## User Stats Tracking

### Game Completion
- [ ] Complete a game successfully
- [ ] Verify stats update:
  - [ ] Games played increment
  - [ ] Average guesses update
  - [ ] Average time update
  - [ ] Best time update (if applicable)
  - [ ] Streak counter update

### Streak Tracking
- [ ] Win multiple games in a row
- [ ] Verify current streak increment
- [ ] Check longest streak update
- [ ] Lose a game
- [ ] Confirm streak reset

## Leaderboard Functionality

### Score Submission
- [ ] Complete a game
- [ ] Verify entry appears in leaderboard
- [ ] Check correct sorting by:
  - [ ] Completion time
  - [ ] Number of guesses
  - [ ] Hint usage

### Leaderboard Display
- [ ] Load leaderboard page
- [ ] Verify top 10 entries display
- [ ] Check correct formatting of:
  - [ ] Username
  - [ ] Score
  - [ ] Time
  - [ ] Date

## Frontend Flow

### Game Interface
- [ ] Load game page
- [ ] Verify all UI elements present:
  - [ ] Word display
  - [ ] Guess input
  - [ ] Submit button
  - [ ] Hint button
  - [ ] Stats display
- [ ] Check responsive design on:
  - [ ] Desktop
  - [ ] Mobile
  - [ ] Tablet

### Gameplay Flow
- [ ] Enter valid guess
- [ ] Verify immediate feedback
- [ ] Check guess history update
- [ ] Test hint functionality
- [ ] Verify game completion screen

## Error Handling

### Network Errors
- [ ] Test offline behavior
- [ ] Verify error messages display
- [ ] Check retry functionality
- [ ] Confirm graceful degradation

### Invalid Input
- [ ] Submit empty guess
- [ ] Enter invalid characters
- [ ] Test maximum length limits
- [ ] Verify appropriate error messages

## Performance Checks

### Load Times
- [ ] Measure initial page load
- [ ] Check API response times
- [ ] Verify smooth transitions
- [ ] Test under simulated load

### Resource Usage
- [ ] Monitor memory usage
- [ ] Check CPU utilization
- [ ] Verify no memory leaks
- [ ] Test long session stability

## Failure Response Plan

If any test fails, follow these steps:

1. **Document the Failure**
   - Record exact steps to reproduce
   - Capture error messages
   - Note environment details
   - Take screenshots if applicable

2. **Check Logs**
   - Review application logs
   - Check error tracking service
   - Verify database logs
   - Check network requests

3. **Common Issues**
   - Database connection problems
   - JWT token validation failures
   - API endpoint timeouts
   - Frontend build issues

4. **Resolution Steps**
   - Verify environment variables
   - Check database connectivity
   - Validate API endpoints
   - Test in staging environment

5. **Communication**
   - Update deployment status
   - Notify relevant team members
   - Document resolution steps
   - Update test checklist

## Post-Test Verification

After completing all tests:

1. **Documentation**
   - Update test results
   - Note any issues found
   - Document resolution steps
   - Update test procedures

2. **Monitoring**
   - Set up alerts for critical paths
   - Monitor error rates
   - Track performance metrics
   - Watch user feedback

3. **Follow-up**
   - Schedule retest if needed
   - Update deployment procedures
   - Review test coverage
   - Plan improvements 
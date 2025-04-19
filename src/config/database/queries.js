export const QUERIES = {
    // Word queries
    GET_WORDS: `
    SELECT 
      ID,
      WORD,
      PART_OF_SPEECH,
      DEFINITION,
      ALTERNATE_DEFINITION,
      DATE_ADDED
    FROM WORDS 
    ORDER BY DATE_ADDED DESC 
    LIMIT ? OFFSET ?
  `,
    GET_WORD_BY_ID: `
    SELECT 
      ID,
      WORD,
      PART_OF_SPEECH,
      DEFINITION,
      ALTERNATE_DEFINITION,
      DATE_ADDED
    FROM WORDS 
    WHERE ID = ?
  `,
    INSERT_WORD: `
    INSERT INTO WORDS (
      ID, 
      WORD, 
      PART_OF_SPEECH, 
      DEFINITION, 
      ALTERNATE_DEFINITION, 
      DATE_ADDED
    ) VALUES (?, ?, ?, ?, ?, ?)
  `,
    UPDATE_WORD: `
    UPDATE WORDS 
    SET 
      WORD = ?,
      PART_OF_SPEECH = ?,
      DEFINITION = ?,
      ALTERNATE_DEFINITION = ?,
      UPDATED_AT = CURRENT_TIMESTAMP()
    WHERE ID = ?
  `,
    DELETE_WORD: 'DELETE FROM WORDS WHERE ID = ?',
    SEARCH_WORDS: `
    SELECT 
      ID,
      WORD,
      PART_OF_SPEECH,
      DEFINITION,
      ALTERNATE_DEFINITION,
      DATE_ADDED
    FROM WORDS 
    WHERE 
      LOWER(WORD) LIKE ? 
      OR LOWER(DEFINITION) LIKE ?
    ORDER BY DATE_ADDED DESC
  `,
    // User queries
    GET_USER_BY_EMAIL: `
    SELECT 
      ID,
      EMAIL,
      PASSWORD_HASH,
      CREATED_AT,
      LAST_LOGIN_AT
    FROM USERS 
    WHERE EMAIL = ?
  `,
    UPDATE_LAST_LOGIN: `
    UPDATE USERS 
    SET LAST_LOGIN_AT = CURRENT_TIMESTAMP() 
    WHERE ID = ?
  `,
    // Stats queries
    GET_DAILY_STATS: `
    SELECT 
      COUNT(*) as total_games,
      ROUND(AVG(TIME), 2) as average_time,
      ROUND(AVG(GUESS_COUNT), 2) as average_guesses,
      COUNT(DISTINCT PLAYER_ID) as unique_players
    FROM GAME_STATS
    WHERE DATE = ?
  `,
    INSERT_GAME_STATS: `
    INSERT INTO GAME_STATS (
      ID,
      PLAYER_ID,
      WORD,
      TIME,
      GUESS_COUNT,
      FUZZY_COUNT,
      HINT_COUNT,
      DATE
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
    // Health check query
    HEALTH_CHECK: 'SELECT CURRENT_TIMESTAMP()'
};
// Table names
export const TABLES = {
    WORDS: 'WORDS',
    USERS: 'USERS',
    GAME_STATS: 'GAME_STATS',
    PLATFORM_METRICS: 'PLATFORM_METRICS'
};
// Column names
export const COLUMNS = {
    WORDS: {
        ID: 'ID',
        WORD: 'WORD',
        PART_OF_SPEECH: 'PART_OF_SPEECH',
        DEFINITION: 'DEFINITION',
        ALTERNATE_DEFINITION: 'ALTERNATE_DEFINITION',
        DATE_ADDED: 'DATE_ADDED',
        UPDATED_AT: 'UPDATED_AT'
    },
    USERS: {
        ID: 'ID',
        EMAIL: 'EMAIL',
        PASSWORD_HASH: 'PASSWORD_HASH',
        CREATED_AT: 'CREATED_AT',
        LAST_LOGIN_AT: 'LAST_LOGIN_AT'
    },
    GAME_STATS: {
        ID: 'ID',
        PLAYER_ID: 'PLAYER_ID',
        WORD: 'WORD',
        TIME: 'TIME',
        GUESS_COUNT: 'GUESS_COUNT',
        FUZZY_COUNT: 'FUZZY_COUNT',
        HINT_COUNT: 'HINT_COUNT',
        DATE: 'DATE'
    }
};
// Indexes for better query performance
export const INDEXES = {
    WORDS: {
        ID: 'WORDS_ID_IDX',
        WORD: 'WORDS_WORD_IDX',
        DATE_ADDED: 'WORDS_DATE_ADDED_IDX'
    },
    USERS: {
        ID: 'USERS_ID_IDX',
        EMAIL: 'USERS_EMAIL_IDX'
    },
    GAME_STATS: {
        ID: 'GAME_STATS_ID_IDX',
        PLAYER_ID: 'GAME_STATS_PLAYER_ID_IDX',
        DATE: 'GAME_STATS_DATE_IDX'
    }
};

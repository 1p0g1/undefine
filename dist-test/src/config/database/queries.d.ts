export declare const QUERIES: {
    readonly GET_WORDS: "\n    SELECT \n      ID,\n      WORD,\n      PART_OF_SPEECH,\n      DEFINITION,\n      ALTERNATE_DEFINITION,\n      DATE_ADDED\n    FROM WORDS \n    ORDER BY DATE_ADDED DESC \n    LIMIT ? OFFSET ?\n  ";
    readonly GET_WORD_BY_ID: "\n    SELECT \n      ID,\n      WORD,\n      PART_OF_SPEECH,\n      DEFINITION,\n      ALTERNATE_DEFINITION,\n      DATE_ADDED\n    FROM WORDS \n    WHERE ID = ?\n  ";
    readonly INSERT_WORD: "\n    INSERT INTO WORDS (\n      ID, \n      WORD, \n      PART_OF_SPEECH, \n      DEFINITION, \n      ALTERNATE_DEFINITION, \n      DATE_ADDED\n    ) VALUES (?, ?, ?, ?, ?, ?)\n  ";
    readonly UPDATE_WORD: "\n    UPDATE WORDS \n    SET \n      WORD = ?,\n      PART_OF_SPEECH = ?,\n      DEFINITION = ?,\n      ALTERNATE_DEFINITION = ?,\n      UPDATED_AT = CURRENT_TIMESTAMP()\n    WHERE ID = ?\n  ";
    readonly DELETE_WORD: "DELETE FROM WORDS WHERE ID = ?";
    readonly SEARCH_WORDS: "\n    SELECT \n      ID,\n      WORD,\n      PART_OF_SPEECH,\n      DEFINITION,\n      ALTERNATE_DEFINITION,\n      DATE_ADDED\n    FROM WORDS \n    WHERE \n      LOWER(WORD) LIKE ? \n      OR LOWER(DEFINITION) LIKE ?\n    ORDER BY DATE_ADDED DESC\n  ";
    readonly GET_USER_BY_EMAIL: "\n    SELECT \n      ID,\n      EMAIL,\n      PASSWORD_HASH,\n      CREATED_AT,\n      LAST_LOGIN_AT\n    FROM USERS \n    WHERE EMAIL = ?\n  ";
    readonly UPDATE_LAST_LOGIN: "\n    UPDATE USERS \n    SET LAST_LOGIN_AT = CURRENT_TIMESTAMP() \n    WHERE ID = ?\n  ";
    readonly GET_DAILY_STATS: "\n    SELECT \n      COUNT(*) as total_games,\n      ROUND(AVG(TIME), 2) as average_time,\n      ROUND(AVG(GUESS_COUNT), 2) as average_guesses,\n      COUNT(DISTINCT PLAYER_ID) as unique_players\n    FROM GAME_STATS\n    WHERE DATE = ?\n  ";
    readonly INSERT_GAME_STATS: "\n    INSERT INTO GAME_STATS (\n      ID,\n      PLAYER_ID,\n      WORD,\n      TIME,\n      GUESS_COUNT,\n      FUZZY_COUNT,\n      HINT_COUNT,\n      DATE\n    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)\n  ";
    readonly HEALTH_CHECK: "SELECT CURRENT_TIMESTAMP()";
};
export declare const TABLES: {
    readonly WORDS: "WORDS";
    readonly USERS: "USERS";
    readonly GAME_STATS: "GAME_STATS";
    readonly PLATFORM_METRICS: "PLATFORM_METRICS";
};
export declare const COLUMNS: {
    readonly WORDS: {
        readonly ID: "ID";
        readonly WORD: "WORD";
        readonly PART_OF_SPEECH: "PART_OF_SPEECH";
        readonly DEFINITION: "DEFINITION";
        readonly ALTERNATE_DEFINITION: "ALTERNATE_DEFINITION";
        readonly DATE_ADDED: "DATE_ADDED";
        readonly UPDATED_AT: "UPDATED_AT";
    };
    readonly USERS: {
        readonly ID: "ID";
        readonly EMAIL: "EMAIL";
        readonly PASSWORD_HASH: "PASSWORD_HASH";
        readonly CREATED_AT: "CREATED_AT";
        readonly LAST_LOGIN_AT: "LAST_LOGIN_AT";
    };
    readonly GAME_STATS: {
        readonly ID: "ID";
        readonly PLAYER_ID: "PLAYER_ID";
        readonly WORD: "WORD";
        readonly TIME: "TIME";
        readonly GUESS_COUNT: "GUESS_COUNT";
        readonly FUZZY_COUNT: "FUZZY_COUNT";
        readonly HINT_COUNT: "HINT_COUNT";
        readonly DATE: "DATE";
    };
};
export declare const INDEXES: {
    readonly WORDS: {
        readonly ID: "WORDS_ID_IDX";
        readonly WORD: "WORDS_WORD_IDX";
        readonly DATE_ADDED: "WORDS_DATE_ADDED_IDX";
    };
    readonly USERS: {
        readonly ID: "USERS_ID_IDX";
        readonly EMAIL: "USERS_EMAIL_IDX";
    };
    readonly GAME_STATS: {
        readonly ID: "GAME_STATS_ID_IDX";
        readonly PLAYER_ID: "GAME_STATS_PLAYER_ID_IDX";
        readonly DATE: "GAME_STATS_DATE_IDX";
    };
};
//# sourceMappingURL=queries.d.ts.map
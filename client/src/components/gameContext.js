export var GameActionTypes;
(function (GameActionTypes) {
    GameActionTypes["FETCH_WORD_START"] = "FETCH_WORD_START";
    GameActionTypes["FETCH_WORD_SUCCESS"] = "FETCH_WORD_SUCCESS";
    GameActionTypes["FETCH_WORD_FAILURE"] = "FETCH_WORD_FAILURE";
    GameActionTypes["SUBMIT_GUESS"] = "SUBMIT_GUESS";
    GameActionTypes["CHECK_GUESS"] = "CHECK_GUESS";
    GameActionTypes["RESET_GAME"] = "RESET_GAME";
    GameActionTypes["UPDATE_TIMER"] = "UPDATE_TIMER";
    GameActionTypes["INCREASE_HINT_LEVEL"] = "INCREASE_HINT_LEVEL";
    GameActionTypes["GAME_OVER"] = "GAME_OVER";
})(GameActionTypes || (GameActionTypes = {}));

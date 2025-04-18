/**
 * Action types for reducers
 */
export var ActionType;
(function (ActionType) {
    ActionType["FETCH_WORDS_START"] = "FETCH_WORDS_START";
    ActionType["FETCH_WORDS_SUCCESS"] = "FETCH_WORDS_SUCCESS";
    ActionType["FETCH_WORDS_FAILURE"] = "FETCH_WORDS_FAILURE";
    ActionType["SET_SEARCH_TERM"] = "SET_SEARCH_TERM";
    ActionType["SET_SORT"] = "SET_SORT";
    ActionType["SELECT_WORD"] = "SELECT_WORD";
    ActionType["DESELECT_WORD"] = "DESELECT_WORD";
    ActionType["TOGGLE_SELECT_WORD"] = "TOGGLE_SELECT_WORD";
    ActionType["SELECT_ALL_WORDS"] = "SELECT_ALL_WORDS";
    ActionType["DESELECT_ALL_WORDS"] = "DESELECT_ALL_WORDS";
    ActionType["SHOW_DELETE_CONFIRMATION"] = "SHOW_DELETE_CONFIRMATION";
    ActionType["HIDE_DELETE_CONFIRMATION"] = "HIDE_DELETE_CONFIRMATION";
    ActionType["OPEN_FORM"] = "OPEN_FORM";
    ActionType["CLOSE_FORM"] = "CLOSE_FORM";
    ActionType["SET_CURRENT_WORD"] = "SET_CURRENT_WORD";
    ActionType["SET_LAST_ADDED_WORD"] = "SET_LAST_ADDED_WORD";
    ActionType["CLEAR_LAST_ADDED_WORD"] = "CLEAR_LAST_ADDED_WORD";
})(ActionType || (ActionType = {}));

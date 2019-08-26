import { Actions } from "../actions/conversationActions";

export const conversationReducer = function (state, action) {
    let newState = state;
    const {type} = action;
    switch (type) {
        case Actions.START_CONVERSATION:
            break;
        default:
            break;
    }
    return newState;
};
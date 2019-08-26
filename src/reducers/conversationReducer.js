import { Actions } from "../actions/conversationActions";
import { getLocalUser } from "../helpers/localStorage";

export const conversationReducer = function (state, action) {
    let newState = state;
    const {type} = action;
    switch (type) {
        case Actions.START_CONVERSATION:
            const {contact} = action;
            const channel = `${getLocalUser().email}_${contact.email}_${Math.floor(Math.random() * 10000)}`;
            newState = {
                channel,
                contacts:[contact],
                loading:true
            };
            break;
        case Actions.CONVERSATION_STARTED:
            newState = {
                ...state,
                loading: false,
                started: true
            };
            break;
        case Actions.CONVERSATION_ERROR:
            const {error} = action;
            newState = {
                error
            };
            break;
        default:
            break;
    }
    return newState;
};
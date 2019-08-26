import { Actions } from "../actions/conversationActions";
import { getLocalUser } from "../helpers/localStorage";

export const conversationReducer = function (state, action) {
    let newState = state;
    const {type} = action;
    switch (type) {
        case Actions.START_CONVERSATION:
            newState = {
                startingConversation: true
            };
             break;
        case Actions.JOIN_CONVERSATION:
            newState = {
                joiningConversation: true,
                channel: action.channel
            };
            break;
        case Actions.JOIN_AUDIO_CHANNEL:
            newState = {
                ...state,
                joiningAudioChannel: true,
                channel: action.channel
            };
            break;
        case Actions.AUDIO_CHANNEL_JOINED:
            newState = {
                ...state,
                joiningAudioChannel: false,
                joinedAudioChannel: true,
                channel: action.channel
            };
            break;
        case Actions.LOCAL_STREAM_READY_FOR_CONVERSATION:
            newState = {
                ...state,
                readyForConversation: true
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
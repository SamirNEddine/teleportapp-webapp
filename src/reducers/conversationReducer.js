import { Actions } from "../actions/conversationActions";

export const conversationReducer = function (state, action) {
    console.debug('Action: ', action, ' STATE ', state);
    let newState = state;
    const {type} = action;
    switch (type) {
        case Actions.START_CONVERSATION:
            newState = {
                ...state,
                startingConversation: true
            };
             break;
        case Actions.JOIN_CONVERSATION:
            newState = {
                ...state,
                joiningConversation: true,
                channel: action.conversation.channel,
                contacts: action.conversation.contacts
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
                joinedAudioChannel: true
            };
            break;
        case Actions.LOCAL_STREAM_READY_FOR_CONVERSATION:
            newState = {
                ...state,
                readyForConversation: true
            };
            break;
        case Actions.ADD_CONTACT_TO_CONVERSATION:
            const currentContacts = state.contacts ? state.contacts : [];
            newState = {
                ...state,
                addingContactToConversation: true,
                contacts: [...currentContacts, action.contact]
            };
            break;
        case Actions.WAITING_FOR_ADDED_CONTACT_REMOTE_STREAM:
            newState = {
                ...state,
                addingContactToConversation: false,
                waitingForAddedContactRemoteStream: true
            };
            break;
        case Actions.CONTACT_REMOTE_STREAM_RECEIVED:
            const {receivedRemoteStream} = action;
            const streamId = receivedRemoteStream.getId();
            const contacts = state.contacts.map( contact => {
                if(contact.id === streamId){
                    contact.remoteStream = receivedRemoteStream;
                }
                return contact;
            });
            newState = {
                ...state,
                waitingForAddedContactRemoteStream: false,
                contactRemoteStreamReceived: true,
                contacts
            };
            break;
        case Actions.PLAY_CONTACT_REMOTE_STREAM:
            newState = {
                ...state,
                contactRemoteStreamReceived: false,
                playingContactRemoteStream: true,
                receivedRemoteStream: null
            };
            break;
        case Actions.CONTACT_REMOTE_STREAM_PLAYED:
            newState = {
                ...state,
                playingContactRemoteStream: false
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
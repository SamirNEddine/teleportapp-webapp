const Actions = {
    START_CONVERSATION: 'START_CONVERSATION',
    JOIN_CONVERSATION: 'JOIN_CONVERSATION',
    LEAVE_CONVERSATION: 'LEAVE_CONVERSATION',
    REMOTE_STREAM_RECEIVED: 'REMOTE_STREAM_RECEIVED',
    REMOTE_STREAM_REMOVED: 'REMOTE_STREAM_REMOVED',
    ADD_CONTACT: 'ADD_CONTACT',
    CONTACT_ADDED:'CONTACT_ADDED',
    CONTACT_FETCHED: 'CONTACT_FETCHED',
    MUTE_AUDIO: 'MUTE_AUDIO',
    UNMUTE_AUDIO: 'UNMUTE_AUDIO'
};

/** Helpers **/
export function startConversation(channel) {
    return {
        type: Actions.START_CONVERSATION,
        channel
    }
}
export function joinConversation(channel) {
    return {
        type: Actions.JOIN_CONVERSATION,
        channel
    }
}
export function leaveConversation() {
    return {
        type: Actions.LEAVE_CONVERSATION,
    }
}
export function remoteStreamReceived(receivedStream) {
    return {
        type: Actions.REMOTE_STREAM_RECEIVED,
        receivedStream
    }
}
export function remoteStreamRemoved(removedStream) {
    return {
        type: Actions.REMOTE_STREAM_REMOVED,
        removedStream
    }
}
export function addContact(contactId) {
    return {
        type: Actions.ADD_CONTACT,
        contactId
    }
}
export function contactAdded(contactId) {
    return {
        type: Actions.CONTACT_ADDED,
        contactId
    }
}
export function contactFetched(contact) {
    return {
        type: Actions.CONTACT_FETCHED,
        contact
    }
}
export function muteAudio() {
    return {
        type: Actions.MUTE_AUDIO
    }
}
export function unmuteAudio() {
    return {
        type: Actions.UNMUTE_AUDIO
    }
}

export const conversationReducer = function (state, action) {
    console.debug('Conversation Reducer:\nAction: ', action, '\nSTATE ', state);
    let newState = state;
    const {type} = action;
    switch (type) {
        case Actions.START_CONVERSATION:
            newState = {
                channel: action.channel,
                isCreator: true,
                contacts: [],
                remoteStreams: {},
                muteAudio: false
            };
            break;
        case Actions.JOIN_CONVERSATION:
            newState = {
                channel: action.channel,
                isCreator: false,
                contacts: [],
                remoteStreams: {},
                muteAudio: true,
                conversationAnswered: false
            };
             break;
        case Actions.LEAVE_CONVERSATION:
            newState = {
                ...state,
                channel: null,
                conversationAnswered: false,
                contacts: []
            };
            break;
        case Actions.REMOTE_STREAM_RECEIVED:
            const {receivedStream} = action;
            const updatedRemoteStreams = state.remoteStreams;
            updatedRemoteStreams[receivedStream.contactId] = receivedStream;
            newState = {
                ...state,
                remoteStreams: updatedRemoteStreams
            };
            break;
        case Actions.REMOTE_STREAM_REMOVED:
            let {contacts, remoteStreams} = state;
            const {removedStream} = action;
            const contactId = removedStream.contactId;
            delete remoteStreams[contactId];
            const updatedContacts = contacts.filter( contact => {return contact.id !== contactId});
            newState = {
                ...state,
                channel: updatedContacts.length ? state.channel : null,
                remoteStreams,
                contacts: updatedContacts
            };
            console.log(newState);
            break;
        case Actions.ADD_CONTACT:
            newState = {
                ...state,
                contactIdToAdd: action.contactId
            };
            break;
        case Actions.CONTACT_ADDED:
            newState = {
                ...state,
                contactIdToAdd: null
            };
            break;
        case Actions.CONTACT_FETCHED:
            const {contact} = action;
            newState = {
                ...state,
                contacts: [...state.contacts, contact]
            };
            break;
        case Actions.MUTE_AUDIO:
            newState = {
              ...state,
              muteAudio: true,
            };
            break;
        case Actions.UNMUTE_AUDIO:
            newState = {
                ...state,
                conversationAnswered: !state.isCreator,
                muteAudio: false
            };
            break;
        default:
            break;
    }
    return newState;
};
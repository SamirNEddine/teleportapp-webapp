const Actions = {
    START_CONVERSATION: 'START_CONVERSATION',
    JOIN_CONVERSATION: 'JOIN_CONVERSATION',
    LEAVE_CONVERSATION: 'LEAVE_CONVERSATION',
    REMOTE_STREAM_RECEIVED: 'REMOTE_STREAM_RECEIVED',
    REMOTE_STREAM_REMOVED: 'REMOTE_STREAM_REMOVED',
    ADD_CONTACT: 'ADD_CONTACT',
    CONTACT_ADDED:'CONTACT_ADDED',
    CONTACT_FETCHED: 'CONTACT_FETCHED'
};

function randomString() {
    return  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/** Helpers **/
export function startConversation() {
    //Generate channel name.
    //Todo: Check if you need to move this code somewhere else.
    const channel = randomString();
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


export const conversationReducer = function (state, action) {
    console.debug('Conversation Reducer:\nAction: ', action, '\nSTATE ', state);
    let newState = state;
    const {type} = action;
    switch (type) {
        case Actions.START_CONVERSATION:
        case Actions.JOIN_CONVERSATION:
            const {channel} = action;
            newState = {
                channel,
                contacts: null,
                remoteStreams: null
            };
             break;
        case Actions.LEAVE_CONVERSATION:
            newState = {
                channel: null,
                contacts: null,
                remoteStreams: null
            };
            break;
        case Actions.REMOTE_STREAM_RECEIVED:
            const {receivedStream} = action;
            const updatedRemoteStreams = state.remoteStreams ? state.remoteStreams : {};
            updatedRemoteStreams[receivedStream.getId] = receivedStream;
            newState = {
                ...state,
                remoteStreams: updatedRemoteStreams
            };
            break;
        case Actions.REMOTE_STREAM_REMOVED:
            let {contacts, remoteStreams} = state;
            const {removedStream} = action;
            const contactId = removedStream.getId();
            delete remoteStreams[contactId];
            const updatedContacts = contacts.filter( contact => {return contact !== contactId})
            newState = {
                ...newState,
                channel: updatedContacts.length ? state.channel : null,
                remoteStreams,
                contacts: updatedContacts
            };
            break;
        case Actions.ADD_CONTACT:
            newState = {
                ...newState,
                contactIdToAdd: action.contactId
            };
            break;
        case Actions.CONTACT_ADDED:
            newState = {
                ...newState,
                contactIdToAdd: null
            };
            break;
        case Actions.CONTACT_FETCHED:
            const {contact} = action;
            newState = {
                ...newState,
                contacts: [...state.contacts, contact]
            };
            break;
        default:
            break;
    }
    return newState;
};
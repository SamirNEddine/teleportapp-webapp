const Actions = {
    START_CONVERSATION: 'START_CONVERSATION',
    LEAVE_CONVERSATION: 'LEAVE_CONVERSATION',
    REMOTE_STREAM_RECEIVED: 'REMOTE_STREAM_RECEIVED',
    REMOTE_STREAM_REMOVED: 'REMOTE_STREAM_REMOVED',
    CONTACT_FETCHED: 'CONTACT_FETCHED'
};

/** Helpers **/
export function startConversation(userId, contactId) {
    //Generate channel name.
    //Todo: Check if you need to move this code somewhere else.
    const channel = `${userId}_${contactId}_${Math.floor(Math.random() * 1000000)}`;
    return {
        type: Actions.START_CONVERSATION,
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
            const contactId = stream.getId();
            delete remoteStreams[contactId];
            newState = {
                ...newState,
                remoteStreams,
                contacts: contacts.filter( contact => {return contact !== contactId})
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
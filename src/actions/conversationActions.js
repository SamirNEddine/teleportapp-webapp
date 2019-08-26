export const Actions = {
    START_CONVERSATION: 'START_CONVERSATION',
    JOIN_CONVERSATION: 'JOIN_CONVERSATION',
    JOIN_AUDIO_CHANNEL: 'JOIN_AUDIO_CHANNEL',
    AUDIO_CHANNEL_JOINED: 'AUDIO_CHANNEL_JOINED',
    LOCAL_STREAM_READY_FOR_CONVERSATION: 'LOCAL_STREAM_READY_FOR_CONVERSATION',
    ADD_CONTACT_TO_CONVERSATION: 'ADD_CONTACT_TO_CONVERSATION',
    WAITING_FOR_ADDED_CONTACT_REMOTE_STREAM: 'WAITING_FOR_ADDED_CONTACT_REMOTE_STREAM',
    CONVERSATION_ERROR: 'CONVERSATION_ERROR'
};

/** Helpers **/
export function startConversation() {
    return {
        type: Actions.START_CONVERSATION,
    }
}
export function conversationError(error) {
    return {
        type: Actions.CONVERSATION_ERROR,
        error
    }
}
export function joinConversation(channel) {
    return {
        type: Actions.JOIN_CONVERSATION,
        channel
    }
}
export function joinAudioChannel(channel) {
    return {
        type: Actions.JOIN_AUDIO_CHANNEL,
        channel
    }
}
export function audioChannelJoined() {
    return {
        type: Actions.AUDIO_CHANNEL_JOINED
    }
}
export function  localStreamReadyForConversation() {
    return {
        type: Actions.LOCAL_STREAM_READY_FOR_CONVERSATION
    }
}
export function  addContactToConversation(contact) {
    return {
        type: Actions.ADD_CONTACT_TO_CONVERSATION,
        contact
    }
}
export function waitingForAddedContactRemoteStream() {
    return {
        type: Actions.WAITING_FOR_ADDED_CONTACT_REMOTE_STREAM
    }
}


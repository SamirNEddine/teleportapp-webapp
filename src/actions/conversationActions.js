export const Actions = {
    START_CONVERSATION: 'START_CONVERSATION',
    CONVERSATION_STARTED: 'CONVERSATION_STARTED',
    WAITING_FOR_CONTACT: 'WAITING_FOR_CONTACT',
    CONVERSATION_ERROR: 'CONVERSATION_ERROR'
};

/** Helpers **/
export function startConversationWithContact(contact) {
    return {
        type: Actions.START_CONVERSATION,
        contact
    }
}
export function conversationError(error) {
    return {
        type: Actions.CONVERSATION_ERROR,
        error
    }
}
export function conversationStarted() {
    return {
        type: Actions.CONVERSATION_STARTED
    }
}
export function waitingForContact() {
    return {
        type: Actions.WAITING_FOR_CONTACT
    }
}
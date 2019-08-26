export const Actions = {
    START_CONVERSATION: 'START_CONVERSATION'
};

/** Helpers **/
export function startConversationWithContact(contact) {
    return {
        type: Actions.START_CONVERSATION,
        contact
    }
}
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
    UNMUTE_AUDIO: 'UNMUTE_AUDIO',
    ANSWER_CONVERSATION: 'ANSWER_CONVERSATION',
    CONVERSATION_ABORTED_AFTER_TIMEOUT: 'CONVERSATION_ABORTED_AFTER_TIMEOUT',
    ANALYTICS_SENT: 'ANALYTICS_SENT'
};

const AnalyticsEvents = {
    START_CONVERSATION: 'START_CONVERSATION',
    ADD_CONTACT: 'ADD_CONTACT',
    ANSWER_CONVERSATION_REQUEST: 'ANSWER_CONVERSATION_REQUEST',
    LEAVE_CONVERSATION: 'LEAVE_CONVERSATION',
    ADDED_TO_CONVERSATION: 'ADDED_TO_CONVERSATION',
    CONTACT_JOINED: 'CONTACT_JOINED',
    CONTACT_LEFT: 'CONTACT_LEFT',
    CONVERSATION_CLOSED: 'CONVERSATION_CLOSED',
    CONVERSATION_ABORTED_AFTER_TIMEOUT: 'CONVERSATION_ABORTED_AFTER_TIMEOUT'
};

export const voicePlatform = process.env.REACT_APP_VOICE_PLATFORM;
if(!voicePlatform) throw(new Error('Voice platform missing.'));
console.debug(`Voice platform: ${voicePlatform}`);

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
export function answerConversation() {
    return {
        type: Actions.ANSWER_CONVERSATION
    }
}
export function analyticsSent(sentAnalytics) {
    return {
        type: Actions.ANALYTICS_SENT,
        sentAnalytics
    }
}
export function abortConversationAfterTimeout(){
    return {
        type: Actions.CONVERSATION_ABORTED_AFTER_TIMEOUT
    }
}

export const conversationReducer = function (state, action) {
    console.debug('Conversation Reducer:\nAction: ', action, '\nState:', state);
    let newState = state;
    const {type} = action;
    switch (type) {
        case Actions.START_CONVERSATION:
            newState = {
                channel: action.channel,
                isCreator: true,
                contacts: [],
                remoteStreams: {},
                muteAudio: (voicePlatform === 'voxeet'),
                aborted: false,
                addingContact: false,
                analytics:  [...state.analytics, {eventName: AnalyticsEvents.START_CONVERSATION, eventProperties: {conversationId: action.channel}}]
            };
            break;
        case Actions.JOIN_CONVERSATION:
            newState = {
                channel: action.channel,
                isCreator: false,
                contacts: [],
                remoteStreams: {},
                muteAudio: true,
                aborted: false,
                addingContact: false,
                analytics:  [...state.analytics, {eventName: AnalyticsEvents.ADDED_TO_CONVERSATION, eventProperties: {conversationId: action.channel}}]
            };
            break;
        case Actions.LEAVE_CONVERSATION:
            newState = {
                ...state,
                channel: null,
                contacts: [],
                analytics: [...state.analytics, {eventName: AnalyticsEvents.LEAVE_CONVERSATION, eventProperties: {conversationId: state.channel}}],
                muteAudio: true,
                addingContact: false
            };
            break;
        case Actions.REMOTE_STREAM_RECEIVED:
            const {receivedStream} = action;
            const updatedRemoteStreams = state.remoteStreams;
            updatedRemoteStreams[receivedStream.contactId] = receivedStream;
            newState = {
                ...state,
                remoteStreams: updatedRemoteStreams,
                analytics: (!state.isCreator && state.contacts.length === 0) ? (
                    state.analytics.concat({eventName: AnalyticsEvents.CONTACT_JOINED, eventProperties: {contactId: receivedStream.contactId, conversationId: state.channel}})
                ) : (state.analytics)
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
                contacts: updatedContacts,
                analytics: [...state.analytics,
                    {eventName: AnalyticsEvents.CONTACT_LEFT, eventProperties: {contactId, conversationId: state.channel}},
                    updatedContacts.length ? null : {eventName: AnalyticsEvents.CONVERSATION_CLOSED, eventProperties: {conversationId: state.channel}}
                ]
            };
            break;
        case Actions.ADD_CONTACT:
            newState = {
                ...state,
                contactIdToAdd: action.contactId,
                analytics: [...state.analytics, {eventName: AnalyticsEvents.ADD_CONTACT, eventProperties: {contactId: action.contactId, conversationId: state.channel}}]
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
                contacts: [...state.contacts, contact],
                addingContact: false
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
                muteAudio: false
            };
            break;
        case Actions.ANSWER_CONVERSATION:
            newState = {
                ...state,
                muteAudio: false,
                analytics: [...state.analytics, {eventName: AnalyticsEvents.ANSWER_CONVERSATION_REQUEST, eventProperties: {conversationId: state.channel}}]
            };
            break;
        case Actions.ANALYTICS_SENT:
            const {sentAnalytics} = action;
            const pendingAnalytics = state.analytics.filter(function(item) {
                return sentAnalytics.indexOf(item) < 0;
            });
            newState = {
                ...state,
                analytics: pendingAnalytics
            };
            break;
        case Actions.CONVERSATION_ABORTED_AFTER_TIMEOUT:
            newState = {
                channel: null,
                isCreator: state.isCreator,
                contacts: [],
                remoteStreams: {},
                muteAudio: true,
                aborted: true,
                addingContact: false,
                analytics:  [...state.analytics, {eventName: AnalyticsEvents.CONVERSATION_ABORTED_AFTER_TIMEOUT, eventProperties: {conversationId: state.channel, isCreator: state.isCreator}}]
            };
            break;
        default:
            break;
    }
    return newState;
};
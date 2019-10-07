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
    ADD_CONTACT_ABORTED_AFTER_TIMEOUT: 'ADD_CONTACT_ABORTED_AFTER_TIMEOUT',
    SELECTING_CONTACT: 'SELECTING_CONTACT',
    CONTACT_IS_SPEAKING: 'CONTACT_IS_SPEAKING',
    CONTACT_STOPPED_SPEAKING: 'CONTACT_STOPPED_SPEAKING',
    CANCEL_SELECTING_CONTACT: 'CANCEL_SELECTING_CONTACT',
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
    CONVERSATION_ABORTED_AFTER_TIMEOUT: 'CONVERSATION_ABORTED_AFTER_TIMEOUT',
    ADD_CONTACT_ABORTED_AFTER_TIMEOUT: 'ADD_CONTACT_ABORTED_AFTER_TIMEOUT'
};

export const voicePlatform = process.env.REACT_APP_VOICE_PLATFORM;
if(!voicePlatform) throw(new Error('Voice platform missing.'));
console.debug(`Voice platform: ${voicePlatform}`);

const MIN_SPEAKING_AUDIO_LEVEL = 0.3;

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
export function abortAddingContactAfterTimeout(){
    return {
        type: Actions.ADD_CONTACT_ABORTED_AFTER_TIMEOUT
    }
}
export function selectContactToAddToConversation(){
    return {
        type: Actions.SELECTING_CONTACT
    }
}
export function cancelSelectingContact(){
    return {
        type: Actions.CANCEL_SELECTING_CONTACT
    }
}
export function contactIsSpeaking(contactId, audioLevel) {
    return {
        type: Actions.CONTACT_IS_SPEAKING,
        contactId, audioLevel
    }
}
export function contactStoppedSpeaking(contactId) {
    return {
        type: Actions.CONTACT_STOPPED_SPEAKING,
        contactId
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
                connectingWithContact: null,
                muteAudio: (voicePlatform === 'voxeet'),
                aborted: false,
                selectingContact: false,
                loudestContactId: null,
                analytics:  [...state.analytics, {eventName: AnalyticsEvents.START_CONVERSATION, eventProperties: {conversationId: action.channel}}]
            };
            break;
        case Actions.JOIN_CONVERSATION:
            newState = {
                channel: action.channel,
                isCreator: false,
                contacts: [],
                connectingWithContact: null,
                remoteStreams: {},
                muteAudio: true,
                aborted: false,
                selectingContact: false,
                loudestContactId: null,
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
                loudestContactId: null,
                selectingContact: false
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
                loudestContactId: updatedContacts.length ? updatedContacts[updatedContacts.length -1].id : null,
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
                contactIdToAdd: null,
                connectingWithContact: action.contactId
            };
            break;
        case Actions.CONTACT_FETCHED:
            const {contact} = action;
            contact.audioLevel = 0;
            newState = {
                ...state,
                contacts: [...state.contacts, contact],
                connectingWithContact: null,
                selectingContact: false,
                loudestContactId: contact.id
            };
            break;
        case Actions.SELECTING_CONTACT:
            newState = {
                ...state,
                selectingContact: true
            };
            break;
        case Actions.CANCEL_SELECTING_CONTACT:
            newState = {
                ...state,
                selectingContact: false
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
        case Actions.CONTACT_IS_SPEAKING:
            const currentContacts = state.contacts;
            let loudestContactId = state.loudestContactId;
            let loudestLevel = MIN_SPEAKING_AUDIO_LEVEL;
            currentContacts.find(c => {
                if(c.id === action.contactId){
                    c.audioLevel = action.audioLevel;
                    return true
                }
                if(c.audioLevel > loudestLevel){
                    loudestLevel = c.audioLevel;
                    loudestContactId = c.id;
                }
                return false;
            });
            newState = {
                ...state,
                contacts: currentContacts,
                loudestContactId
            };
            break;
        case Actions.CONTACT_STOPPED_SPEAKING:
            const currentContacts2 = state.contacts;
            let loudestContactId2 = state.loudestContactId;
            let loudestLevel2 = MIN_SPEAKING_AUDIO_LEVEL;
            currentContacts2.find(c => {
                if(c.id === action.contactId){
                    c.audioLevel = 0;
                    return true
                }
                if(c.audioLevel > loudestLevel2){
                    loudestLevel2 = c.audioLevel;
                    loudestContactId2 = c.id;
                }
                return false;
            });
            newState = {
                ...state,
                contacts: currentContacts2,
                loudestContactId: loudestContactId2
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
                selectingContact: false,
                connectingWithContact: null,
                analytics:  [...state.analytics, {eventName: AnalyticsEvents.CONVERSATION_ABORTED_AFTER_TIMEOUT, eventProperties: {conversationId: state.channel, isCreator: state.isCreator}}]
            };
            break;
        case Actions.ADD_CONTACT_ABORTED_AFTER_TIMEOUT:
            newState = {
                ...state,
                selectingContact: false,
                connectingWithContact: null,
                analytics:  [...state.analytics, {eventName: AnalyticsEvents.ADD_CONTACT_ABORTED_AFTER_TIMEOUT, eventProperties: {conversationId: state.channel, contactId: state.connectingWithContact}}]
            };
            break;
        default:
            break;
    }
    return newState;
};
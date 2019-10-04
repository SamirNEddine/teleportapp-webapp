import React, { createContext, useReducer, useContext, useEffect, useCallback, useState } from 'react';
import { AuthenticationContext } from './AuthenticationContext';
import { useAgora, AgoraEvents, AgoraActions } from '../hooks/agora';
import { useOpenTok, OpenTokEvents, OpenTokActions } from '../hooks/openTok';
import { useVoxeet, VoxeetEvents, VoxeetActions } from '../hooks/voxeet';
import { useApolloClient } from '@apollo/react-hooks';
import { GET_OPENTOK_SESSION, GET_USER } from '../graphql/queries';
import {
    CONVERSATION_SOCKET,
    CONVERSATION_SOCKET_INCOMING_MESSAGES,
    CONVERSATION_SOCKET_OUTGOING_MESSAGES,
    useSocket
} from '../hooks/socket';
import {
    voicePlatform,
    analyticsSent,
    contactAdded,
    contactFetched,
    conversationReducer, joinConversation,
    remoteStreamReceived,
    remoteStreamRemoved, unmuteAudio, abortConversationAfterTimeout
} from '../reducers/conversationReducer';
import { randomString } from '../utils/utils';

export const ConversationContext = createContext();

export const ConversationContextProvider = function ({children}) {
    const apolloClient = useApolloClient();
    const {authState} = useContext(AuthenticationContext);

    const [state, dispatch] = useReducer(conversationReducer, {
        channel: null,
        contacts: [],
        isCreator: false,
        remoteStreams: {},
        contactIdToAdd:null,
        muteAudio: true,
        aborted: false,
        addingContact: false,
        analytics:[]
    });

    const [, message, socketData, sendMessage] = useSocket(authState, CONVERSATION_SOCKET);
    useEffect( () => {
        if(message === CONVERSATION_SOCKET_INCOMING_MESSAGES.JOIN_CONVERSATION && socketData){
            const {channel} = socketData;
            console.debug(`Incoming conversation: ${channel}`);
            dispatch(joinConversation(channel));
        }
    }, [message, socketData]);

    useEffect( () => {
        if(state.contactIdToAdd){
            console.debug(`Inviting contact ${state.contactIdToAdd} to the conversation`);
            sendMessage(CONVERSATION_SOCKET_OUTGOING_MESSAGES.ADD_CONTACT, {contactId: state.contactIdToAdd, channel: state.channel});
            dispatch(contactAdded(state.contactIdToAdd));
        }
    }, [state.contactIdToAdd, state.channel, sendMessage]);

    const fetchContact = useCallback(async function (contactId) {
        console.debug(`Fetching contact ${contactId}`);
        const {error, data} = await apolloClient.query({query: GET_USER, variables:{id: contactId}});
        if(error) throw(new Error('Failed to fetch contact info'));
        dispatch(contactFetched(data.user));
    }, [apolloClient]);

    const [agoraError, agoraEvent, agoraEventData, performAgoraAction] = useAgora (
        voicePlatform === 'agora' ? authState : {},
        voicePlatform === 'agora' ? state.channel : null
    );
    useEffect(  () => {
        if (!agoraError && agoraEventData){
            switch(agoraEvent){
                case AgoraEvents.REMOTE_STREAM_RECEIVED:
                    const {receivedStream} = agoraEventData;
                    receivedStream.contactId = receivedStream.getId();
                    //Update remote streams
                    dispatch(remoteStreamReceived(receivedStream));
                    //Fetch the contact info
                    const contactId = receivedStream.getId();
                    fetchContact(contactId);
                    break;
                case AgoraEvents.REMOTE_STREAM_REMOVED:
                    const {removedStream} = agoraEventData;
                    removedStream.contactId = removedStream.getId();
                    //Update contacts and remote streams
                    dispatch(remoteStreamRemoved(removedStream));
                    break;
                default:
                    break;
            }
        }else{
            //Todo: Error handling strategy
        }
    }, [agoraError, agoraEvent, agoraEventData, fetchContact]);

    const [openTokError, openTokEvent, openTokEventData, performOpenTokAction] = useOpenTok(
        voicePlatform === 'tokbox' ? authState : {},
        voicePlatform === 'tokbox' ? state.channel : null
    );
    useEffect(  () => {
        if (!openTokError && openTokEventData){
            console.debug('OpenTok event:', openTokEvent, openTokEventData);
            switch(openTokEvent){
                case OpenTokEvents.REMOTE_STREAM_RECEIVED:
                    const {receivedStream} = openTokEventData;
                    const contactId = parseInt(receivedStream.name);
                    receivedStream.contactId = contactId;
                    //Update remote streams
                    dispatch(remoteStreamReceived(receivedStream));
                    //Fetch the contact info
                    fetchContact(contactId);
                    break;
                case OpenTokEvents.REMOTE_STREAM_REMOVED:
                    const {removedStream} = openTokEventData;
                    removedStream.contactId = parseInt(removedStream.name);
                    //Update contacts and remote streams
                    dispatch(remoteStreamRemoved(removedStream));
                    break;
                default:
                    break;
            }
        }else{
            //Todo: Error handling strategy
        }
    }, [openTokError, openTokEvent, openTokEventData, fetchContact]);

    const [voxeetError, voxeetEvent, performVoxeetAction] = useVoxeet(
        voicePlatform === 'voxeet' ? authState : {},
        voicePlatform === 'voxeet' ? state.channel : null
    );
    useEffect( () => {
        if (!voxeetError && voxeetEvent) {
            console.debug('Voxeet event:', voxeetEvent);
            const {event, eventData} = voxeetEvent;
            switch (event) {
                case VoxeetEvents.CONFERENCE_JOINED:
                    if(state.isCreator){
                        dispatch(unmuteAudio());
                    }
                    break;
                case VoxeetEvents.CONTACT_JOINED:
                    const {stream} = eventData;
                    //Update remote streams
                    dispatch(remoteStreamReceived(stream));
                    //Fetch the contact info
                    fetchContact(stream.contactId);
                    break;
                case VoxeetEvents.CONTACT_LEFT:
                    dispatch(remoteStreamRemoved(eventData.stream));
                    break;
                default:
                    break;
            }
        }else{
            //Todo: Error handling strategy
        }
    },[voxeetError, voxeetEvent, fetchContact, dispatch, state.isCreator]);

    useEffect( () => {
        switch (voicePlatform) {
            case 'agora':
                performAgoraAction(state.muteAudio ? AgoraActions.MUTE_AUDIO : AgoraActions.UNMUTE_AUDIO);
                break;
            case 'tokbox':
                performOpenTokAction(state.muteAudio ? OpenTokActions.MUTE_AUDIO : OpenTokActions.UNMUTE_AUDIO);
                break;
            case 'voxeet':
                performVoxeetAction(state.muteAudio ? VoxeetActions.MUTE_AUDIO : VoxeetActions.UNMUTE_AUDIO);
                break;
            default:
                throw(new Error('Unsupported platform'))
        }
    }, [state.muteAudio, performAgoraAction, performOpenTokAction, performVoxeetAction]);

    useEffect( () => {
        if(state.analytics.length){
            console.debug('Sending Analytics:', state.analytics);
            sendMessage(CONVERSATION_SOCKET_OUTGOING_MESSAGES.ANALYTICS, state.analytics);
            dispatch(analyticsSent(state.analytics));
        }
    }, [state.analytics, sendMessage]);

    const [abortTimout, setAbortTimout] = useState(null);
    useEffect( () => {
        if(state.channel && !state.contacts.length && !abortTimout){
            //Abort on timeout
            setAbortTimout(setTimeout( function () {
                if(!state.contacts.length){
                    //Abort if no contact joined after the timeout
                    dispatch(abortConversationAfterTimeout());
                    setAbortTimout(null);
                }
            }, 5000));
        }else if (state.channel && state.contacts.length && abortTimout){
            clearTimeout(abortTimout);
            setAbortTimout(null);
        }
    }, [state.channel, state.contacts, abortTimout]);

    const generateNewConversationChannel = async function () {
        let channel = null;
        switch(voicePlatform) {
            case 'agora':
            case 'voxeet':
                channel = randomString();
                break;
            case 'tokbox':
                const {error, data } = await apolloClient.query({query: GET_OPENTOK_SESSION, fetchPolicy: 'no-cache'});
                if(error) throw(error);
                channel = data.openTokSession;
                break;
            default:
                throw(new Error('Unsupported platform'))
        }
        return channel;
    };

    return (
        <ConversationContext.Provider value={{conversation: state, dispatch, generateNewConversationChannel}}>
            {children}
        </ConversationContext.Provider>
    );
};
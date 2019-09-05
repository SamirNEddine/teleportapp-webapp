import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { AuthenticationContext } from "./AuthenticationContext";
import { useAgora, AgoraEvents, AgoraActions } from "../hooks/agora";
import {useOpenTok, OpenTokEvents, OpenTokActions} from "../hooks/openTok";
import { useApolloClient } from "@apollo/react-hooks";
import {GET_OPENTOK_SESSION, GET_USER} from "../graphql/queries";
import {
    CONVERSATION_SOCKET,
    CONVERSATION_SOCKET_INCOMING_MESSAGES,
    CONVERSATION_SOCKET_OUTGOING_MESSAGES, STATUS_SOCKET,
    useSocket
} from "../hooks/socket";
import {
    contactAdded,
    contactFetched,
    conversationReducer, joinConversation,
    remoteStreamReceived,
    remoteStreamRemoved
} from "../reducers/conversationReducer";
import {randomString} from "../utils/utils";

export const ConversationContext = createContext();

const voicePlatform = process.env.REACT_APP_VOICE_PLATFORM;
if(!voicePlatform) throw(new Error('Voice platform missing.'));

export const ConversationContextProvider = function ({children}) {
    const apolloClient = useApolloClient();
    const {authState} = useContext(AuthenticationContext);

    const [state, dispatch] = useReducer(conversationReducer, {
        channel: null,
        contacts: [],
        remoteStreams: {},
        contactIdToAdd:null,
        muteAudio: true
    });

    const [socketError, message, socketData, sendMessage] = useSocket(authState, CONVERSATION_SOCKET);
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

    const fetchContact = async function (contactId) {
        console.debug(`Fetching contact ${contactId}`);
        const {error, data} = await apolloClient.query({query: GET_USER, variables:{id: contactId}});
        if(error) throw(new Error('Failed to fetch contact info'));
        dispatch(contactFetched(data.user));
    };

    const [agoraError, agoraEvent, agoraEventData, performAgoraAction] = useAgora (
        voicePlatform === 'agora' ? authState : {},
        voicePlatform === 'agora' ? state.channel : null
    );
    useEffect(  () => {
        if (!agoraError && agoraEventData){
            switch(agoraEvent){
                case AgoraEvents.REMOTE_STREAM_RECEIVED:
                    const {receivedStream} = agoraEventData;
                    //Update remote streams
                    dispatch(remoteStreamReceived(receivedStream));
                    //Fetch the contact info
                    const contactId = receivedStream.getId();
                    fetchContact(contactId);
                    break;
                case AgoraEvents.REMOTE_STREAM_REMOVED:
                    const {removedStream} = agoraEventData;
                    //Update contacts and remote streams
                    dispatch(remoteStreamRemoved(removedStream));
                    break;
                default:
                    break;
            }
        }else{
            //Todo: Error handling strategy
        }
    }, [agoraError, agoraEvent, agoraEventData]);

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
                    //Update remote streams
                    dispatch(remoteStreamReceived(receivedStream));
                    //Fetch the contact info
                    const contactId = receivedStream.name;
                    fetchContact(contactId);
                    break;
                case OpenTokEvents.REMOTE_STREAM_REMOVED:
                    const {removedStream} = openTokEventData;
                    //Update contacts and remote streams
                    dispatch(remoteStreamRemoved(removedStream));
                    break;
                default:
                    break;
            }
        }else{
            //Todo: Error handling strategy
        }
    }, [openTokError, openTokEvent, openTokEventData]);

    useEffect( () => {
        switch (voicePlatform) {
            case 'agora':
                performAgoraAction(state.muteAudio ? AgoraActions.MUTE_AUDIO : AgoraActions.UNMUTE_AUDIO);
                break;
            case 'tokbox':
                performOpenTokAction(state.muteAudio ? OpenTokActions.MUTE_AUDIO : OpenTokActions.UNMUTE_AUDIO);
                break;
            default:
                throw(new Error('Unsupported platform'))
        }
    }, [state.muteAudio]);

    const generateNewConversationChannel = async function () {
        let channel = null;
        switch(voicePlatform) {
            case 'agora':
                channel = randomString();
                break;
            case 'tokbox':
                const {error, data } = await apolloClient.query({query: GET_OPENTOK_SESSION});
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

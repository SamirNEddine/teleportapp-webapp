import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { AuthenticationContext } from "./AuthenticationContext";
import { useAgora, AgoraEvents, AgoraActions } from "../hooks/agora";
import { useOpenTok, OpenTokEvents } from "../hooks/openTok";
import { useLazyQuery } from "@apollo/react-hooks";
import { GET_USER } from "../graphql/queries";
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

export const ConversationContext = createContext();

export const ConversationContextProvider = function ({children}) {
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
            sendMessage(CONVERSATION_SOCKET_OUTGOING_MESSAGES.ADD_CONTACT, {contactId: state.contactIdToAdd, channel: state.channel});
            dispatch(contactAdded(state.contactIdToAdd));
        }
    }, [state.contactIdToAdd, state.channel, sendMessage]);


    const [getUser, {error, loading, data}] = useLazyQuery(GET_USER);
    useEffect( ()=> {
        if(!error && !loading && data){
            const {user} = data;
            //Update contacts
            dispatch(contactFetched(user));
        }else{
            //Todo: Error handling
        }
    }, [error, loading, data]);

    // const [agoraError, event, eventData, performAgoraAction] = useAgora(authState, state.channel);
    // useEffect( () => {
    //     if (!agoraError && eventData){
    //         switch(event){
    //             case AgoraEvents.REMOTE_STREAM_RECEIVED:
    //                 const {receivedStream} = eventData;
    //                 //Update remote streams
    //                 dispatch(remoteStreamReceived(receivedStream));
    //                 //Fetch the contact info
    //                 const contactId = receivedStream.getId();
    //                 getUser({variables: {id: contactId}});
    //                 break;
    //             case AgoraEvents.REMOTE_STREAM_REMOVED:
    //                 const {removedStream} = eventData;
    //                 //Update contacts and remote streams
    //                 dispatch(remoteStreamRemoved(removedStream));
    //                 break;
    //             default:
    //                 break;
    //         }
    //     }else{
    //         //Todo: Error handling strategy for Agora
    //     }
    // }, [agoraError, event, eventData]);

    const [openTokError, event, eventData] = useOpenTok(authState, state.channel);
    useEffect( () => {
        if (!openTokError && eventData){
            switch(event){
                case OpenTokEvents.REMOTE_STREAM_RECEIVED:
                    const {receivedStream} = eventData;
                    //Update remote streams
                    dispatch(remoteStreamReceived(receivedStream));
                    //Fetch the contact info
                    const contactId = receivedStream.name;
                    getUser({variables: {id: contactId}});
                    break;
                case OpenTokEvents.REMOTE_STREAM_REMOVED:
                    const {removedStream} = eventData;
                    //Update contacts and remote streams
                    dispatch(remoteStreamRemoved(removedStream));
                    break;
                default:
                    break;
            }
        }else{
            //Todo: Error handling strategy for Agora
        }
    }, [agoraError, event, eventData]);

    useEffect( () => {
        performAgoraAction(state.muteAudio ? AgoraActions.MUTE_AUDIO : AgoraActions.UNMUTE_AUDIO);
    }, [state.muteAudio]);

    return (
        <ConversationContext.Provider value={{conversation: state, dispatch}}>
            {children}
        </ConversationContext.Provider>
    );
};

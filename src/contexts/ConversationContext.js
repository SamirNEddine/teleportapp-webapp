import React, { createContext, useReducer, useContext, useEffect, useState } from 'react';
import { conversationReducer } from "../reducers/conversationReducer";
import { AuthenticationContext } from "./AuthenticationContext";
import AgoraRTC from "agora-rtc-sdk";
import { useQuery } from "@apollo/react-hooks";
import { GET_AGORA_TOKEN } from "../graphql/queries";
import {
    contactRemoteStreamReceived,
    audioChannelJoined,
    conversationError,
    localStreamReadyForConversation,
    waitingForAddedContactRemoteStream,
    joinConversation,
    playContactRemoteStream,
    remoteStreamRemoved
} from "../actions/conversationActions";
import openSocket from 'socket.io-client';

export const ConversationContext = createContext();

export let socket = null;
export const ConversationContextProvider = function ({children}) {
    const {authState} = useContext(AuthenticationContext);
    const {agoraClient, setAgoraClient} = useState(null);
    useEffect( _ => {
        if(authState.user && !authState.error){
            setAgoraClient(AgoraRTC.createClient({ mode: "live", codec: "h264" }));
        }else{
            agoraClient.stop();
        }
    }, [authState, agoraClient]);

    const [conversation, dispatch] = useReducer(conversationReducer, {
        channel: null,
        contacts: [],
        startingConversation: false,
        joiningConversation: false,
        joiningAudioChannel: false,
        joinedAudioChannel: false,
        readyForConversation: false,
        addingContactToConversation: false,
        waitingForAddedContactRemoteStream: false,
        contactRemoteStreamReceived: false,
        playingContactRemoteStream: false
    });

    useEffect(_ => {
        if(conversation && !conversation.error && conversation.addingContactToConversation){
            //Ask the contact through socket to join the conversation
            //The contact to add is the last one added to the contacts list
            const contactToAdd = conversation.contacts[conversation.contacts.length -1];
            contactToAdd.companyId = contactToAdd.company.id;
            socket.emit('add-contact', {channel: conversation.channel, contact: contactToAdd})
        }
        if (conversation.contactRemoteStreamReceived){
            dispatch(playContactRemoteStream());
        }
    });

    const {loading, error, data, refetch } = useQuery(GET_AGORA_TOKEN, {
        variables: {channel: conversation.channel},
        skip: !conversation.channel
    });

    if (!socket && authState.user){
        socket = openSocket(process.env.REACT_APP_CONVERSATION_SOCKET_URL, {
            query: {
                token: `Bearer ${getAuthenticationToken()}`
            }
        });
        //Add contact event
        socket.on('contact-added', ({contact, channel}) => {
            console.debug('Contact add confirmed');
            dispatch(waitingForAddedContactRemoteStream());
        });
        //Join conversation event
        socket.on('join-conversation', ({channel, contacts}) => {
            dispatch(joinConversation(channel, contacts));
        });
    }else if (socket && !authState.user){
        //Happens after logout
        console.debug("Closing Status socket after logout");
        socket.close();
        socket = null;
    }
    if(!listenersAdded){
        //Setup client listeners
        agoraClient.on('stream-published', evt => {
            //Ready for conversation on the agora front.
            console.debug("Publish local stream successfully. Ready for conversation");
            dispatch(localStreamReadyForConversation());
            setAgoraError(null);
        });
        //Stream received. Update state

        setListenersAdded(true);
    }
    // socket.emit('start-conversation', {channel: conversation.channel});

    // if(conversation && conversation.left){
    //     agoraClient.leave(function() {
    //         console.log("client left channel");
    //         dispatch(conversationLeft());
    //         setAgoraError(null);
    //     }, function(err) {
    //         console.log("client leave failed ", err);
    //         setAgoraError(err);
    //         dispatch(conversationError("Agora error"));
    //     });
    // }

    return (
        <ConversationContext.Provider value={{conversation, dispatch}}>
            {children}
        </ConversationContext.Provider>
    );
};

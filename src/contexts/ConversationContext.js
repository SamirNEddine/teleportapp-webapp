import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { conversationReducer } from "../reducers/conversationReducer";
import { AuthenticationContext } from "./AuthenticationContext";
import { AgoraContext } from "./AgoraContext";
import { useQuery } from "@apollo/react-hooks";
import { GET_AGORA_TOKEN } from "../graphql/queries";
import {
    contactRemoteStreamReceived,
    audioChannelJoined,
    conversationError,
    localStreamReadyForConversation, waitingForAddedContactRemoteStream, joinConversation, playContactRemoteStream
} from "../actions/conversationActions";
import openSocket from 'socket.io-client';
import {getAuthenticationToken} from "../helpers/localStorage";

export const ConversationContext = createContext();

let socket = null;
export const ConversationContextProvider = function ({children}) {
    const {user} = useContext(AuthenticationContext);
    const {agoraClient, localStream, listenersAdded, setListenersAdded, remoteStreams, setRemoteStreams, setAgoraError} = useContext(AgoraContext);
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
        if(conversation && !conversation.error && conversation.addingContactToConversation && conversation.contacts && conversation.contacts.length){
            //Ask the contact through socket to join the conversation
            //The contact to add is the last one added to the contacts list
            const contactToAdd = conversation.contacts[conversation.contacts.length -1];
            socket.emit('add-contact', {channel: conversation.channel, contact: contactToAdd})
        }

        if (conversation.receivedRemoteStream && !conversation.playingContactRemoteStream){
            setRemoteStreams([conversation.receivedRemoteStream]);
            dispatch(playContactRemoteStream());
        }
    });

    const {loading, error, data, refetch } = useQuery(GET_AGORA_TOKEN, {
        variables: {channel: conversation.channel},
        skip: !conversation.channel
    });

    if (!socket && user){
        socket = openSocket(process.env.REACT_APP_CONVERSATION_SOCKET_URL, {
            query: {
                token: `Bearer ${getAuthenticationToken()}`
            }
        });
        //Add contact event
        socket.on('contact-added', ({contact, channel}) => {
            console.log('Contact add confirmed');
            dispatch(waitingForAddedContactRemoteStream());
        });
        //Join conversation event
        socket.on('join-conversation', ({channel, contacts}) => {
            dispatch(joinConversation(channel, contacts));
        });
    }else if (socket && !user){
        //To do
    }
    if(!listenersAdded){
        //Setup client listeners
        agoraClient.on('stream-published', evt => {
            //Ready for conversation on the agora front.
            console.log("Publish local stream successfully. Ready for conversation");
            dispatch(localStreamReadyForConversation());
            setAgoraError(null);
        });
        agoraClient.on('stream-added', evt => {
            const remoteStream = evt.stream;
            console.log("New stream added: " + remoteStream.getId());
            setRemoteStreams(remoteStreams.push(remoteStream));
            dispatch(contactRemoteStreamReceived(remoteStream));
            agoraClient.subscribe(remoteStream, function (err) {
                console.log("Subscribe stream failed", err);
                setAgoraError(err);
            });
        });
        //Listen to remote streams and update state
        agoraClient.on('stream-subscribed', evt => {
            const remoteStream = evt.stream;
            const streamId = remoteStream.getId();
            console.log("Subscribe remote stream successfully: " + streamId);
            setAgoraError(null);
        });
        setListenersAdded(true);
    }

    if(conversation && !conversation.error && conversation.joiningAudioChannel){
        refetch();
        if (error) dispatch(conversationError(error));
        if (!loading && data){
            const {userAgoraToken} = data;
            console.log(userAgoraToken, conversation.channel, user.userId);
            agoraClient.join(userAgoraToken, conversation.channel, user.userId, (uid) => {
                console.log("User " + uid + " join channel successfully");
                setAgoraError(null);
                dispatch(audioChannelJoined());
                agoraClient.publish(localStream, err => {
                    console.log("Failed to publish stream", err);
                    setAgoraError(err);
                    dispatch(conversationError("Agora error"));
                });
            }, function(err) {
                console.log("Join channel failed", err);
                setAgoraError(err);
                dispatch(conversationError("Agora error"));
            });
        }else if(!loading){
            dispatch(conversationError("Unexpected error from Teleport server"));
        }
    }


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

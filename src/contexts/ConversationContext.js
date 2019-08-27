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
    localStreamReadyForConversation,
    waitingForAddedContactRemoteStream,
    joinConversation,
    playContactRemoteStream,
    remoteStreamRemoved
} from "../actions/conversationActions";
import openSocket from 'socket.io-client';
import {getAuthenticationToken} from "../helpers/localStorage";

export const ConversationContext = createContext();

export let socket = null;
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

    if (!socket && user){
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
    }else if (socket && !user){
        //To do
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
        agoraClient.on('stream-added', evt => {
            const remoteStream = evt.stream;
            console.debug("New stream added: " + remoteStream.getId());
            setRemoteStreams(remoteStreams.push(remoteStream));
            dispatch(contactRemoteStreamReceived(remoteStream));
            agoraClient.subscribe(remoteStream, function (err) {
                console.debug("Subscribe stream failed", err);
                setAgoraError(err);
            });
        });
        //Subscribe to streams changes
        agoraClient.on('stream-subscribed', evt => {
            const remoteStream = evt.stream;
            const streamId = remoteStream.getId();
            console.debug("Subscribe remote stream successfully: " + streamId);
            setAgoraError(null);
        });
        //Listen for remove and leave events
        agoraClient.on('stream-removed', evt => {
            const stream = evt.stream;
            const streamId = stream.getId();
            stream.stop();
            console.debug('Stream removed:', streamId);
            dispatch(remoteStreamRemoved(stream));
        });
        agoraClient.on('peer-leave', evt => {
            const stream = evt.stream;
            const streamId = stream.getId();
            stream.stop();
            console.debug('Peer left:', streamId);
            dispatch(remoteStreamRemoved(stream));
        });
        setListenersAdded(true);
    }

    if(conversation && !conversation.error && conversation.joiningAudioChannel){
        refetch();
        if (error) dispatch(conversationError(error));
        if (!loading && data){
            const {userAgoraToken} = data;
            console.log(userAgoraToken, conversation.channel, user.id);
            agoraClient.join(userAgoraToken, conversation.channel, user.id, (uid) => {
                console.log("User " + uid + " join channel successfully");
                setAgoraError(null);
                if(conversation.startingConversation){
                    //Update socket
                    console.log("START CHANNEL", conversation);
                    socket.emit('start-conversation', {channel: conversation.channel});
                }
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

import React, { createContext, useReducer, useContext } from 'react';
import { conversationReducer } from "../reducers/conversationReducer";
import { AuthenticationContext } from "./AuthenticationContext";
import { AgoraContext, agoraClient } from "./AgoraContext";
import { useQuery } from "@apollo/react-hooks";
import { GET_AGORA_TOKEN } from "../graphql/queries";
import { conversationError, conversationLeft, waitingForContact } from "../actions/conversationActions";

export const ConversationContext = createContext();

export const ConversationContextProvider = function ({children}) {
    const {user} = useContext(AuthenticationContext);
    const {localStream, listenersAdded, setListenersAdded, remoteStreams, setRemoteStreams, setAgoraError} = useContext(AgoraContext);
    const [conversation, dispatch] = useReducer(conversationReducer, {
        channel: null,
        contacts: null,
        loading: false,
        started: false,
        waiting: false
    });
    const {loading, error, data, refetch } = useQuery(GET_AGORA_TOKEN, {
        variables: {channel: conversation.channel},
        skip: !conversation.channel
    });

    if(!listenersAdded){
        //Setup client listeners
        agoraClient.on('stream-published', function (evt) {
            console.log("Publish local stream successfully");
            dispatch(waitingForContact());
            setAgoraError(null);
        });
        agoraClient.on('stream-added', function (evt) {
            const theStream = evt.stream;
            console.log("New stream added: " + theStream.getId());
            agoraClient.subscribe(theStream, function (err) {
                console.log("Subscribe stream failed", err);
                setAgoraError(err);
            });
        });
        //Listen to remote streams and update state
        agoraClient.on('stream-subscribed', function (evt) {
            const remoteStream = evt.stream;
            setRemoteStreams(remoteStreams.push(remoteStream));
            const streamId = remoteStream.getId();
            console.log("Subscribe remote stream successfully: " + streamId);
            remoteStream.play('audio-stream_'+streamId);
            setAgoraError(null);
        });

        setListenersAdded(true);
    }

    if(conversation && !conversation.error && conversation.loading){
        refetch();
        if (error) dispatch(conversationError(error));
        if (!loading && data){
            const {userAgoraToken} = data;
            console.log(userAgoraToken, conversation.channel, user.userId);
            agoraClient.join(userAgoraToken, conversation.channel, user.userId, function(uid) {
                console.log("User " + uid + " join channel successfully");
                setAgoraError(null);
                agoraClient.publish(localStream, function (err) {
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

    if(conversation && conversation.left){
        agoraClient.leave(function() {
            console.log("client left channel");
            dispatch(conversationLeft());
            setAgoraError(null);
        }, function(err) {
            console.log("client leave failed ", err);
            setAgoraError(err);
            dispatch(conversationError("Agora error"));
        });
    }

    return (
        <ConversationContext.Provider value={{conversation, dispatch}}>
            {children}
        </ConversationContext.Provider>
    );
};

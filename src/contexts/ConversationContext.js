import React, { createContext, useReducer, useContext } from 'react';
import { conversationReducer } from "../reducers/conversationReducer";
import { AuthenticationContext } from "./AuthenticationContext";
import { AgoraContext, agoraClient } from "./AgoraContext";
import { useQuery } from "@apollo/react-hooks";
import { GET_AGORA_TOKEN } from "../graphql/queries";
import {conversationError} from "../actions/conversationActions";

export const ConversationContext = createContext();

export const ConversationContextProvider = function ({children}) {
    const {user} = useContext(AuthenticationContext);
    const {localStream, setAgoraError} = useContext(AgoraContext);
    const [conversation, dispatch] = useReducer(conversationReducer, {
        channel: null,
        contacts: null,
        loading: false,
        started: false
    });
    const {loading, error, data, refetch } = useQuery(GET_AGORA_TOKEN, {
        variables: {channel: conversation.channel},
        skip: !conversation.channel
    });

    if(conversation && !conversation.error && conversation.loading){
        refetch();
        if (error) dispatch(conversationError(error));
        if (!loading && data){
            const {userAgoraToken} = data;
            console.log(userAgoraToken, conversation.channel, user.userId);
            agoraClient.join(userAgoraToken, conversation.channel, user.userId, function(uid) {
                console.log("User " + uid + " join channel successfully");
                agoraClient.publish(localStream, function (err) {
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

    return (
        <ConversationContext.Provider value={{conversation, dispatch}}>
            {children}
        </ConversationContext.Provider>
    );
};

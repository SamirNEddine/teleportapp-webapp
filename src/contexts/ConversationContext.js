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
    const {loading, error, data, refetchToken } = useQuery(GET_AGORA_TOKEN, {
        variables: {channel: conversation.channel},
        skip: !conversation.channel
    });

    if(conversation && !conversation.error && conversation.loading){
        refetchToken();
        if (error) dispatch(conversationError(error));
        const agoraUserToken = data;

        if (agoraUserToken){
            agoraClient.join(agoraUserToken, conversation.channel, user.userId, function(uid) {
                console.log("User " + uid + " join channel successfully");
                agoraClient.publish(localStream, function (err) {
                    console.log("Publish local stream error: " + err);
                });
            }, function(err) {
                console.log("Join channel failed", err);
                setAgoraError(error);
                dispatch(conversationError(new Error("Agora error!!")));
            });
        }
    }

    return (
        <ConversationContext.Provider value={{conversation, dispatch}}>
            {children}
        </ConversationContext.Provider>
    );
};

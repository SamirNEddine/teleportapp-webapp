import React, { createContext, useReducer, useContext, useEffect, useState } from 'react';
import { conversationReducer } from "../reducers/conversationReducer";
import { AuthenticationContext } from "./AuthenticationContext";
import {useAgora, AgoraEvents} from "../hooks/agora";
import {useLazyQuery} from "@apollo/react-hooks";
import {GET_USER} from "../graphql/queries";

export const ConversationContext = createContext();

export const ConversationContextProvider = function ({children}) {
    const {authState} = useContext(AuthenticationContext);
    const [state, dispatch] = useReducer(conversationReducer, {
        channel: null,
        contacts: [],
        remoteStreams: {}
    });

    const [getUser, {error, loading, data}] = useLazyQuery(GET_USER);
    useEffect( () => {
        if(!error && loading){
            const {user} = data;
            //Disaptch
        }else{
            //Todo: Error handling
        }
    }, [error, loading, data]);

    const [agoraError, event, eventData] = useAgora(state.channel);
    useEffect( () => {
        if (!agoraError && eventData){
            switch(event){
                case AgoraEvents.REMOTE_STREAM_RECEIVED:
                    const {receivedStream} = eventData;
                    const contactId = receivedStream.getId();
                    getUser({variables: {id: contactId}});
                    break;
                case AgoraEvents.REMOTE_STREAM_REMOVED:
                    const {removedStream} = eventData;
                    //Dispatch
                    break;
                default:
                    break;
            }
        }else{
            //Todo: Error handling strategy for Agora
        }
    }, [agoraError, event, eventData]);

    return (
        <ConversationContext.Provider value={{conversation: state, dispatch}}>
            {children}
        </ConversationContext.Provider>
    );
};

import React, { createContext, useReducer, useContext } from 'react';
import { conversationReducer } from "../reducers/conversationReducer";
import {AuthenticationContext} from "./AuthenticationContext";
import {AgoraContext} from "./AgoraContext";

export const ConversationContext = createContext();

export const ConversationContextProvider = function ({children}) {
    const {user} = useContext(AuthenticationContext);
    const {client, localStream} = useContext(AgoraContext);

    //conversation: {channel:"string", contacts:[users]}
    const [conversation, dispatch] = useReducer(conversationReducer, null);

    return (
        <ConversationContext.Provider value={{conversation, dispatch}}>
            {children}
        </ConversationContext.Provider>
    );
};

import React, { createContext, useReducer } from 'react';
import { conversationReducer } from "../reducers/conversationReducer";

export const ConversationContext = createContext();

export const ConversationContextProvider = function ({children}) {
    //conversation: {channel:"string", contacts:[users]}
    const [conversation, dispatch] = useReducer(conversationReducer, null);

    return (
        <ConversationContext.Provider value={{conversation, dispatch}}>
            {children}
        </ConversationContext.Provider>
    );
};

import React, { createContext, useReducer, useContext } from 'react';
import { agoraReducer } from '../reducers/agoraReducer'
import { createAgoraClient, createLocalStream } from "../helpers/agora";
import {AuthenticationContext} from "./AuthenticationContext";

export const AgoraContext = createContext();

function AgoraContextProvider({children}) {
    const { user } = useContext(AuthenticationContext);

    const [agora, dispatch] = useReducer(agoraReducer, {
         localStream: user ? createLocalStream(user.userId) : null,
         client: user ? createAgoraClient() : null
     });
    return (
        <AgoraContext.Provider value={{agora, dispatch}}>
            {children}
        </AgoraContext.Provider>
    );
}

export default AgoraContextProvider;
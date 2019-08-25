import React, { createContext, useReducer, useContext } from 'react';
import { agoraReducer } from '../reducers/agoraReducer'
import { createAgoraClient, createLocalStream } from "../helpers/agora";
import {AuthenticationContext} from "./AuthenticationContext";

export const AgoraContext = createContext();

function AgoraContextProvider({children}) {
    const { user } = useContext(AuthenticationContext);

    const [agora, dispatch] = useReducer(agoraReducer, {
         localStream: createLocalStream(user.userId),
         client: createAgoraClient()
     });
    return (
        <AuthenticationContext.Provider value={{agora, dispatch}}>
            {children}
        </AuthenticationContext.Provider>
    );
}

export default AgoraContextProvider;
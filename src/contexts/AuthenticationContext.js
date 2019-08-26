import React, { createContext, useReducer } from 'react';
import { authenticationReducer } from '../reducers/authenticationReducer'
import {getAuthenticationToken, getLocalUser} from "../helpers/localStorage";
import openSocket from "socket.io-client";

export const AuthenticationContext = createContext();

let socket = null;
export const AuthenticationContextProvider = function({children}) {

    const [user, dispatch] = useReducer(authenticationReducer, getLocalUser());

    if (user && !socket){
        socket = openSocket(process.env.REACT_APP_STATUS_SOCKET_URL, {
            query: {
                token: `Bearer ${getAuthenticationToken()}`
            }
        });
    }else{
        //To do
    }

    return (
        <AuthenticationContext.Provider value={{user, dispatch}}>
            {children}
        </AuthenticationContext.Provider>
    );
};
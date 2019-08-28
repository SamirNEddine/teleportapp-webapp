import React, { createContext, useReducer, useEffect } from 'react';
import { authenticationReducer } from '../reducers/authenticationReducer'
import {getAuthenticationToken, getLocalUser} from "../helpers/localStorage";
import openSocket from "socket.io-client";
import authenticationStore from "../stores/authenticationStore";

export const AuthenticationContext = createContext();

let socket = null;
export const AuthenticationContextProvider = function({children}) {
    const [authState, dispatch] = useReducer(authenticationReducer, {user: getLocalUser()});
    const stateRef = React.useRef(authState);

    useEffect(_ => {
        stateRef.current = authState;
        authenticationStore.__onStateUpdated();
    }, [authState]);
    useEffect(_ => {
        if (!authenticationStore.isReady){
            authenticationStore.init({
                dispatch: params => dispatch(params),
                getState: () => ({...stateRef.current}),
            })
        }
    }, []);

    if (authState.user && !socket){
        socket = openSocket(process.env.REACT_APP_STATUS_SOCKET_URL, {
            query: {
                token: `Bearer ${getAuthenticationToken()}`
            }
        });
    }else if(!authState.user && socket){
        //Happens after logout
        console.debug("Closing Status socket after logout");
        socket.close();
        socket = null;
    }

    return (
        <AuthenticationContext.Provider value={{authState, dispatch}}>
            {children}
        </AuthenticationContext.Provider>
    );
};
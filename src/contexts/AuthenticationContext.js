import React, { createContext, useReducer, useEffect } from 'react';
import { authenticationReducer } from '../reducers/authenticationReducer'
import {getLocalUser} from "../helpers/localStorage";
import authenticationStore from "../stores/authenticationStore";
import {STATUS_SOCKET, STATUS_SOCKET_OUTGOING_MESSAGES, useSocket} from "../hooks/socket";

export const AuthenticationContext = createContext();

export const AuthenticationContextProvider = function({children}) {
    const [authState, dispatch] = useReducer(authenticationReducer, {user: getLocalUser()});
    const [,,, sendMessage] = useSocket(authState, STATUS_SOCKET);
    useEffect( () => {
        if(authState.status){
            sendMessage(STATUS_SOCKET_OUTGOING_MESSAGES.UPDATE_STATUS, {status: authState.status});
            if(authState.statusUpdatedManually){
                sendMessage(STATUS_SOCKET_OUTGOING_MESSAGES.ANALYTICS, [{eventName: 'UPDATE_STATUS', eventProperties:{status: authState.status}}])
            }
        }
    }, [authState.status, authState.statusUpdatedManually, sendMessage]);

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

    return (
        <AuthenticationContext.Provider value={{authState, dispatch}}>
            {children}
        </AuthenticationContext.Provider>
    );
};
import React, { createContext, useReducer, useEffect } from 'react';
import { authenticationReducer } from '../reducers/authenticationReducer'
import {getLocalUser} from "../helpers/localStorage";
import authenticationStore from "../stores/authenticationStore";

export const AuthenticationContext = createContext();

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

    return (
        <AuthenticationContext.Provider value={{authState, dispatch}}>
            {children}
        </AuthenticationContext.Provider>
    );
};
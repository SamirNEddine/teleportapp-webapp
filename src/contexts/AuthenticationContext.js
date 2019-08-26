import React, { createContext, useReducer } from 'react';
import { authenticationReducer } from '../reducers/authenticationReducer'
import { getLocalUser } from "../helpers/localStorage";

export const AuthenticationContext = createContext();

export const AuthenticationContextProvider = function({children}) {

    const [user, dispatch] = useReducer(authenticationReducer, getLocalUser());
    return (
        <AuthenticationContext.Provider value={{user, dispatch}}>
            {children}
        </AuthenticationContext.Provider>
    );
};
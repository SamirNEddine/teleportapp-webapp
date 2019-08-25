import React, { createContext, useReducer } from 'react';
import { authenticationReducer } from '../reducers/authenticationReducer'

export const AuthenticationContext = createContext();

function AuthenticationContextProvider({children}) {
    const [user, dispatch] = useReducer(authenticationReducer, {
        userId: null,
        companyId: null,
        email: null
    });
    return (
        <AuthenticationContext.Provider value={{user, dispatch}}>
            {children}
        </AuthenticationContext.Provider>
    );
}
export default AuthenticationContextProvider;
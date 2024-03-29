import React, { useState, useContext, useEffect } from "react";
import { useMutation } from "@apollo/react-hooks";
import { LOGIN_USER } from "../../graphql/queries";
import { AuthenticationContext } from "../../contexts/AuthenticationContext";
import { updateLocalUser } from "../../helpers/localStorage";
import { signInSuccess } from '../../reducers/authenticationReducer';
import { Message } from 'semantic-ui-react'
import { getErrorMessageFromGraphqlErrorMessage } from '../../helpers/graphql';

import './authentication.css'

const SignIn = function ({history}) {
    const { authState, dispatch } = useContext(AuthenticationContext);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [signIn, {error}] = useMutation(LOGIN_USER);
    useEffect( _ => {
        if (authState.user){
            history.push('/');
        }
    });
    const handleSubmit = async e => {
        e.preventDefault();
        try{
            const result = await signIn({variables: {email, password}});
            const localUser =  await updateLocalUser(result.data.loginUser);
            dispatch(signInSuccess(localUser));
        }catch(e){
            console.log('ERROR' + e);
        }
    };
    return (
        <div className='auth-container'>
            <div className="signin-container">
                <img src="https://storage.googleapis.com/teleport_public_assets/logo/white.svg" className="teleport-logo" alt="Logo"/>
                <form className="signin-form" onSubmit={handleSubmit}>
                    <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="email"  autoComplete="username"/>
                    <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="password"  autoComplete="current-password"/>
                    <button>login</button>
                </form>
            </div>
            {error || authState.error ? (
                <Message negative>
                    <Message.Header>Authentication error</Message.Header>
                    <p>{ error ? getErrorMessageFromGraphqlErrorMessage(error.message) : authState.error}</p>
                </Message>
            ) : ('')
            }
        </div>
    );
};

export default SignIn;
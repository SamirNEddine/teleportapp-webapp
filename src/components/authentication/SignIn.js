import React, { useState, useContext, useEffect } from "react";
import { useMutation } from "@apollo/react-hooks";
import { LOGIN_USER } from "../../graphql/queries";
import { AuthenticationContext } from "../../contexts/AuthenticationContext";
import { updateLocalUser } from "../../helpers/localStorage";
import { signInSuccess } from '../../actions/authenticationActions'

import './authentication.css'

const SignIn = function ({history}) {
    const { authState, dispatch } = useContext(AuthenticationContext);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [signIn] = useMutation(LOGIN_USER);
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
        <div className="signin-container">
            <form className="signin-form" onSubmit={handleSubmit}>
                <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="email"  autoComplete="username"/>
                <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="password"  autoComplete="current-password"/>
                <button>login</button>

            </form>
        </div>
    );
};

export default SignIn;
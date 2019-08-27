import React, { useState, useContext } from "react";
import { useMutation } from "@apollo/react-hooks";
import { LOGIN_USER } from "../../graphql/queries";
import { AuthenticationContext } from "../../contexts/AuthenticationContext";
import { updateLocalUser } from "../../helpers/localStorage";
import {Actions, signInSuccess} from '../../actions/authenticationActions'

import './authentication.css'

const SignIn = function ({history}) {
    const { user, dispatch } = useContext(AuthenticationContext);
    if (user){
        history.push('/');
    }
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [signIn] = useMutation(LOGIN_USER);
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
                <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="email"/>
                <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="password"/>
                <button>login</button>

            </form>
        </div>
    );
};

export default SignIn;
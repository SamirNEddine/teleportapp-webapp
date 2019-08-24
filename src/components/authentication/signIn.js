import React from "react";

import './authentication.css'

export const SignIn = function () {
    return (
        <div className="signin-container">
            <form className="signin-form">
                <input type="text" placeholder="username"/>
                <input type="password" placeholder="password"/>
                <button>login</button>
            </form>
        </div>
    );
};
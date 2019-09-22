import React from 'react';
import {Redirect, Route} from 'react-router-dom';
import { AuthenticationContext } from "../contexts/AuthenticationContext";

class PrivateRoute extends Route{
    render() {
        const { authState } = this.context;
        return (
            <div>
                {super.render()}
                {!authState.user ?  <Redirect to="/signin" /> : ''}
            </div>
        )
    }
}
PrivateRoute.contextType = AuthenticationContext;

export default PrivateRoute;
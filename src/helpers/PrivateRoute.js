import React from 'react';
import {Redirect, Route} from 'react-router-dom';
import { AuthenticationContext } from "../contexts/AuthenticationContext";

class PrivateRoute extends Route{
    render() {
        const { authState } = this.context;
        if(!authState.user){
            return <Redirect to="/signin" />
        }else{
            return super.render()
        }
    }
}
PrivateRoute.contextType = AuthenticationContext;

export default PrivateRoute;
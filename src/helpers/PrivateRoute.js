import React from 'react';
import {Redirect, Route} from 'react-router-dom';

class PrivateRoute extends Route{
    render() {
        const {hasActiveSession} = this.props;
        if(!hasActiveSession){
            return <Redirect to="/signin" />
        }else{
            return super.render()
        }
    }
}

export default PrivateRoute;
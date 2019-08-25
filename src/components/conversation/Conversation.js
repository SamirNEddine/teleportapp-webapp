import React, {useState} from 'react';
import {Redirect} from 'react-router-dom';

import './conversation.css'

const Conversation = function ({location}) {
    const {firstUser} = location && location.state ? location.state : {firstUser:null};
    const [otherUsers, setOtherUsers] = useState([firstUser]);
    const [displayedUser, setDisplayedUser] = useState(firstUser);
    if (!firstUser){
        return <Redirect to="/"/>
    }
    return (
        <div className="screen-container">
            <img src={displayedUser.profilePicture} className="displayed-user" alt="user"/>
            <div className="displayed-user-name">{`${displayedUser.firstName} ${displayedUser.lastName}`}</div>
        </div>
    )
};

export  default Conversation;
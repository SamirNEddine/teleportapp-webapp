import React, { useState, useContext } from 'react';
import { withRouter } from 'react-router-dom'

import './contacts.css';
import {AuthenticationContext} from "../../contexts/AuthenticationContext";

const ContactAvatar = function ({positionClassName, contact, history}) {
    const {user} = useContext(AuthenticationContext);
    const [openConversationAnimation, setOpenConversationAnimation] = useState(false);
    const onClick = _ => {
        setOpenConversationAnimation(true);
        setTimeout(_ => {
            history.push({
                pathname: '/conversation',
                state: {firstUser: contact, user}
            });
        },350);
    };
    return (
        <div className={'contact-avatar ' + positionClassName + (openConversationAnimation ? ' selected' : '')} onClick={onClick}>
            <img src={contact.profilePicture} alt="avatar"/>
        </div>
    )
};

export default withRouter(ContactAvatar);
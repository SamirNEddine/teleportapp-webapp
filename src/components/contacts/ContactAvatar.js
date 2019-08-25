import React, { useState } from 'react';
import { withRouter } from 'react-router-dom'
import './contacts.css';

const ContactAvatar = function ({positionClassName, user, history}) {
    const [openConversationAnimation, setOpenConversationAnimation] = useState(false);
    const onClick = _ => {
        setOpenConversationAnimation(true);
        setTimeout(_ => {
            history.push({
                pathname: '/conversation',
                state: {firstUser: user}
            });
        },350);
    };
    return (
        <div className={'contact-avatar ' + positionClassName + (openConversationAnimation ? ' selected' : '')} onClick={onClick}>
            <img src={user.profilePicture} alt="avatar"/>
        </div>
    )
};

export default withRouter(ContactAvatar);
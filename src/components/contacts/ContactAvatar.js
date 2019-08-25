import React from 'react';
import { withRouter } from 'react-router-dom'
import './contacts.css';

const ContactAvatar = function ({positionClassName, user, history}) {
    const onClick = _ => {
        history.push({
            pathname: '/conversation',
            state: {firstUser: user}
        });
    };
    return (
        <div className={'contact-avatar ' + positionClassName} onClick={onClick}>
            <img src={user.profilePicture} alt="avatar"/>
        </div>
    )
};

export default withRouter(ContactAvatar);
import React from 'react';
import './contacts.css';

const ContactAvatar = function ({positionClassName, profilePicture}) {
    return (
        <div className={'contact-avatar ' + positionClassName}>
            <img src={profilePicture} alt="avatar"/>
        </div>
    )
};

export default ContactAvatar;
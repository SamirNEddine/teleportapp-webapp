import React from 'react';
import './contacts.css';

export const ContactAvatar = function ({positionClassName}) {
    return (
        <div className={'contact-avatar ' + positionClassName}>
            <img src="https://storage.googleapis.com/test-teleport/joy.jpeg" alt="test"/>
        </div>
    )
};
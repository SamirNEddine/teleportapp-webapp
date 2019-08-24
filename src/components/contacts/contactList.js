import React from 'react';
import { ContactAvatar } from './contactAvatar'

export const ContactList = function () {
    return (
        <div className="contact-list">
            <ContactAvatar positionClassName="center"/>
            <ContactAvatar positionClassName="deg30"/>
            <ContactAvatar positionClassName="deg90"/>
            <ContactAvatar positionClassName="deg150"/>
            <ContactAvatar positionClassName="deg210"/>
            <ContactAvatar positionClassName="deg270"/>
            <ContactAvatar positionClassName="deg330"/>
        </div>
    );
};

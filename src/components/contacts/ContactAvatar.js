import React from 'react';
import { withRouter } from 'react-router-dom'

import './contacts.css';

const ContactAvatar = function ({contact, styles, showContactInfo, scaleOnHover, onContactClick}) {

    const onClick = _ => {
        if(onContactClick){
            onContactClick(contact)
        }
    };

    return (
        <div className={`contact-avatar ${styles} ${scaleOnHover ? ' hoverEnabled':''}`} onClick={onClick}>
            <img src={contact.profilePicture} alt="avatar"/>
            {showContactInfo && <div className="contact-info-background">
                <div className="contact-info-text">{`${contact.firstName} ${contact.lastName}`}</div>
            </div>}
        </div>
    )
};

export default withRouter(ContactAvatar);
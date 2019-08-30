import React, { useState } from 'react';
import { withRouter } from 'react-router-dom'

import './contacts.css';

const ContactAvatar = function ({positionClassName, contact, onContactClick}) {
    const [selected, setSelected] = useState(false);

    const onClick = _ => {
        if(contact.status === 'available'){
            if(selected){
                // setOpenConversationAnimation(false);
                // dispatch(leaveConversation());
            }else{
                setSelected(true);
                onContactClick(contact);
            }
        }
    };

    return (
        <div className={'contact-avatar ' + contact.status + ' ' + positionClassName + (selected ? ' selected' : '')} onClick={onClick}>
            <img src={contact.profilePicture} alt="avatar"/>
        </div>
    )
};

export default withRouter(ContactAvatar);
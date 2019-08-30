import React, { useState, useContext, useEffect } from 'react';
import { withRouter } from 'react-router-dom'
import { AuthenticationContext } from "../../contexts/AuthenticationContext";
import { ConversationContext } from "../../contexts/ConversationContext";

import './contacts.css';

const ContactAvatar = function ({positionClassName, contact, onClick}) {
    const {authState} = useContext(AuthenticationContext);
    const {conversation, dispatch} = useContext(ConversationContext);
    const [selected, setSelected] = useState(false);

    const onClick = _ => {
        if(contact.status === 'available'){
            if(selected){
                // setOpenConversationAnimation(false);
                // dispatch(leaveConversation());
            }else{
                setSelected(true);
                onClick(contact.id);
            }
        }
    };

    // if (conversation.left){
    //     setOpenConversationAnimation(false);
    // }
    return (
        <div className={'contact-avatar ' + contact.status + ' ' + positionClassName + (selected ? ' selected' : '')} onClick={onClick}>
            <img src={contact.profilePicture} alt="avatar"/>
        </div>
    )
};

export default withRouter(ContactAvatar);
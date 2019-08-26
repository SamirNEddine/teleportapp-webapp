import React, { useState, useContext } from 'react';
import { withRouter } from 'react-router-dom'
import { AuthenticationContext } from "../../contexts/AuthenticationContext";
import { ConversationContext } from "../../contexts/ConversationContext";
import { leaveConversation, startConversationWithContact } from "../../actions/conversationActions";

import './contacts.css';

const ContactAvatar = function ({positionClassName, contact, history}) {
    const {user} = useContext(AuthenticationContext);
    const {conversation, dispatch, error} = useContext(ConversationContext);
    const [openConversationAnimation, setOpenConversationAnimation] = useState(false);
    const onClick = _ => {
        if(openConversationAnimation){
            setOpenConversationAnimation(false);
            dispatch(leaveConversation());
        }else{
            setOpenConversationAnimation(true);
            dispatch(startConversationWithContact(contact));
        }
    };
    if (conversation.started){
        history.push({
            pathname: '/conversation',
        });
    }
    // if (conversation.left){
    //     setOpenConversationAnimation(false);
    // }
    return (
        <div className={'contact-avatar ' + positionClassName + (openConversationAnimation ? ' selected' : '')} onClick={onClick}>
            <img src={contact.profilePicture} alt="avatar"/>
        </div>
    )
};

export default withRouter(ContactAvatar);
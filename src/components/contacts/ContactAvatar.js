import React, { useState, useContext } from 'react';
import { withRouter } from 'react-router-dom'
import { AuthenticationContext } from "../../contexts/AuthenticationContext";
import { ConversationContext } from "../../contexts/ConversationContext";
import {
    addContactToConversation,
    contactRemoteStreamPlayed,
    joinAudioChannel,
    startConversation
} from "../../actions/conversationActions";

import './contacts.css';

const ContactAvatar = function ({positionClassName, contact, history}) {
    const {user} = useContext(AuthenticationContext);
    const {conversation, dispatch, error} = useContext(ConversationContext);
    const [selected, setSelected] = useState(false);
    const onClick = _ => {
        if(selected){
            // setOpenConversationAnimation(false);
            // dispatch(leaveConversation());
        }else{
            setSelected(true);
            dispatch(startConversation());
        }
    };
    if (selected && conversation.startingConversation && !conversation.joiningAudioChannel && !conversation.joinedAudioChannel && !conversation.readyForConversation){
        const channel = `${user.email}_${contact.email}_${Math.floor(Math.random() * 10000)}`;
        dispatch(joinAudioChannel(channel))
    }
    if (selected && conversation.readyForConversation && !conversation.addingContactToConversation){
        dispatch(addContactToConversation(contact));
    }
    if (conversation.contactRemoteStreamReceived){
        dispatch(contactRemoteStreamPlayed());
        history.push({
            pathname: '/conversation',
        });
    }
    // if (conversation.left){
    //     setOpenConversationAnimation(false);
    // }
    return (
        <div className={'contact-avatar ' + positionClassName + (selected ? ' selected' : '')} onClick={onClick}>
            <img src={contact.profilePicture} alt="avatar"/>
        </div>
    )
};

export default withRouter(ContactAvatar);
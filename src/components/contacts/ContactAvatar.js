import React, { useState, useContext, useEffect } from 'react';
import { withRouter } from 'react-router-dom'
import { AuthenticationContext } from "../../contexts/AuthenticationContext";
import { ConversationContext } from "../../contexts/ConversationContext";
import {
    addContactToConversation,
    joinAudioChannel,
    startConversation
} from "../../actions/conversationActions";

import './contacts.css';

const ContactAvatar = function ({positionClassName, contact}) {
    const {authState} = useContext(AuthenticationContext);
    const {conversation, dispatch} = useContext(ConversationContext);
    const [selected, setSelected] = useState(false);

    useEffect(_ => {
        if (selected && conversation.startingConversation && !conversation.channel){
            const channel = `${authState.user.email}_${contact.email}_${Math.floor(Math.random() * 10000)}`;
            dispatch(joinAudioChannel(channel))
        }
        if (selected && conversation.joinedAudioChannel && (!conversation.contacts.length || !conversation.contacts.some( c => { return c.id === contact.id }))){
            dispatch(addContactToConversation(contact));
        }
    });

    const onClick = _ => {
        if(selected){
            // setOpenConversationAnimation(false);
            // dispatch(leaveConversation());
        }else{
            setSelected(true);
            dispatch(startConversation());
        }
    };

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
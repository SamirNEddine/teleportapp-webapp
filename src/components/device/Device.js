import React, { useContext } from 'react';
import ContactList from "../contacts/ContactList";
import Conversation from "../conversation/Conversation";
import './device.css';
import {ConversationContext} from "../../contexts/ConversationContext";
import {leaveConversation} from "../../reducers/conversationReducer";

const Device = function () {

    const {conversation, dispatch} = useContext(ConversationContext);

    const onButtonClick = _ => {
        if (conversation.channel){
            dispatch(leaveConversation());
        }
    };
    return (
        <div className="device-container">
            <div className="hardware-button" onClick={onButtonClick}/>
            <ContactList/>
            {conversation.contacts.length ? <Conversation/> : ''}
        </div>
    );
};

export default Device;
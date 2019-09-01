import React, { useContext } from 'react';
import ContactList from "../contacts/ContactList";
import Conversation from "../conversation/Conversation";
import './device.css';
import {ConversationContext} from "../../contexts/ConversationContext";

const Device = function () {

    const {conversation} = useContext(ConversationContext);

    const onButtonClick = _ => {
        console.log('Hardware button clicked')
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
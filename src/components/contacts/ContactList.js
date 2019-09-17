import React, { useContext, useEffect, useState } from 'react';
import ContactAvatar from './ContactAvatar';
import { ConversationContext } from "../../contexts/ConversationContext";
import './contacts.css';
import {addContact, startConversation} from "../../reducers/conversationReducer";

const DEGREE_OFFSET = 60;
const DEGREE_PREFIX = "deg";
const STARTING_DEGREE = 30;
const NUMBER_OF_AVATARS = 7;

const ContactList = function ({contacts}) {
    const {conversation, dispatch, generateNewConversationChannel} = useContext(ConversationContext);
    const [selectedContactId, setSelectedContactId] = useState(null);
    useEffect( () => {
        if (selectedContactId && !conversation.channel){
            setTimeout( function () {
                setSelectedContactId(null);
            }, 200);
        }
    },[conversation.contacts, conversation.channel, selectedContactId]);

    const onContactClick = async contact => {
        const channel = await generateNewConversationChannel();
        dispatch(startConversation(channel));
        dispatch(addContact(contact.id));
        setSelectedContactId(contact.id);
    };

    const openingConversation = (conversation.channel && !conversation.contacts.length && selectedContactId !== null);
    const inConversation = (conversation.contacts.length && selectedContactId !== null);
    const leavingConversation = (!conversation.channel && selectedContactId !== null);

    const displayList = _ => {
        if (!contacts.length){
            return <div className="loading">Loading contacts...</div>
        }else if (!contacts || contacts.length === 0){
            return <div>No contacts.</div>
        }else{
            const avatars = [];
            for(let i=0; i< NUMBER_OF_AVATARS && i< contacts.length; i++){
                const contact = contacts[i];
                const positionClassName = i === 0 ? "center" : DEGREE_PREFIX + String(STARTING_DEGREE + (i-1)*DEGREE_OFFSET);
                const avatar = <ContactAvatar
                    styles={`contact-list-avatar ${positionClassName} ${contact.id !== selectedContactId ? contact.status : 'available'} ${openingConversation || leavingConversation || inConversation ? (selectedContactId === contact.id ? ('selected') : 'pushed-back') : ''} `}
                    contact={contact}
                    scaleOnHover={!openingConversation && contact.status === 'available'}
                    key={contact.id}
                    onContactClick={(!openingConversation && contact.status === 'available') ? onContactClick : _=>{}}/>;
                avatars.push(avatar);
            }
            return avatars;
        }
    };

    return (
        <div className="contact-list-container">
            {openingConversation ? <div className="loading">Contacting...</div> : ''}
            {displayList()}
        </div>
    );
};

export default ContactList;

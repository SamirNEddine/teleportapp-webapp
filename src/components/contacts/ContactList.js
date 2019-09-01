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
    const {conversation, dispatch} = useContext(ConversationContext);
    const [selectedContactId, setSelectedContactId] = useState(null);
    useEffect( () => {
        if(selectedContactId && conversation.contacts.length){
            //Reset for next time
            setSelectedContactId(null);
        }
    },[conversation.contacts, selectedContactId]);

    const onContactClick = contact => {
        setSelectedContactId(contact.id);
        dispatch(startConversation());
        dispatch(addContact(contact.id));
    };

    const displayList = _ => {
        if (!contacts.length){
            return <div className="loading">Loading contacts...</div>
        }else if (!contacts || contacts.length === 0){
            return <div>No contacts.</div>
        }else{
            const avatars = [];
            const openingConversation = (!conversation.contacts.length && selectedContactId !== null);
            for(let i=0; i< NUMBER_OF_AVATARS && i< contacts.length; i++){
                const contact = contacts[i];
                const positionClassName = i === 0 ? "center" : DEGREE_PREFIX + String(STARTING_DEGREE + (i-1)*DEGREE_OFFSET);
                const avatar = <ContactAvatar styles={`contact-list-avatar ${positionClassName} ${contact.status} ${openingConversation ? (selectedContactId === contact.id ? 'selected' : '') : ''}`} contact={contact} scaleOnHover={!openingConversation && contact.status === 'available'} key={contact.id} onContactClick={onContactClick}/>;
                avatars.push(avatar);
            }
            return avatars;
        }
    };

    return (
        <div>
            {selectedContactId ? <div className="loading">Contacting...</div> : ''}
            {displayList()}
        </div>
    );
};

export default ContactList;

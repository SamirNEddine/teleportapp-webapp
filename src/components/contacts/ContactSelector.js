import React, { useContext, useEffect, useState } from 'react';
import ContactAvatar from '../contacts/ContactAvatar';
import { ConversationContext } from "../../contexts/ConversationContext";
import {addContact, startConversation} from "../../reducers/conversationReducer";
import AvatarsCollection from "../layout/AvatarsCollection";

import '../contacts/contacts.css';

const NUMBER_OF_AVATARS = 7;

const ContactSelector = function ({contacts, displayInformationalText}) {
    const {conversation, dispatch, generateNewConversationChannel} = useContext(ConversationContext);
    const [selectedContactId, setSelectedContactId] = useState(null);
    useEffect( () => {
        if (selectedContactId && conversation.contacts.length && conversation.contacts.find( c => { return c.id === selectedContactId} )){
            console.log('HEEEEEERRRE', selectedContactId, conversation.contacts);
            setSelectedContactId(null);
        }
    },[conversation.contacts, conversation.channel, selectedContactId]);

    useEffect( () => {
        if(conversation.isCreator && conversation.aborted){
            displayInformationalText('Failed to connect. Please try again.', 'negative');
        }
    }, [conversation.isCreator, conversation.aborted, displayInformationalText]);
    const onContactClick = async contact => {
        if(!conversation.channel){
            const channel = await generateNewConversationChannel();
            dispatch(startConversation(channel));
        }
        dispatch(addContact(contact.id));
        setSelectedContactId(contact.id);
    };

    const avatars = [];
    for(let i=0; i< NUMBER_OF_AVATARS && i< contacts.length; i++){
        const contact = contacts[i];
        const additionalClasses = `animatedAvatar ${selectedContactId === contact.id ? 'selected' : ''}`;
        const component = (
            <ContactAvatar
                styles={`${contact.id !== selectedContactId ? contact.status : ''} `}
                contact={contact}
                scaleOnHover={!selectedContactId && contact.status === 'available'}
                onContactClick={(!selectedContactId && contact.status === 'available') ? onContactClick : _=>{}}/>
        );
        const key = contact.id;
        const avatar = {
            additionalClasses,
            component,
            key,
        };
        avatars.push(avatar);
    }

    return (
        <div className="contact-list-container">
            {selectedContactId ? <div className="loading">Connecting...</div> : ''}
            {!contacts || !contacts.length ? (
                <div className="loading">Loading contacts...</div>
            ) : (
                <AvatarsCollection avatars={avatars}/>
            )
            }
        </div>
    );
};

export default ContactSelector;

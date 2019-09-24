import React, { useContext, useEffect, useState } from 'react';
import ContactAvatar from './ContactAvatar';
import { ConversationContext } from "../../contexts/ConversationContext";
import {addContact, startConversation} from "../../reducers/conversationReducer";
import AvatarsCollection from "../layout/AvatarsCollection";

import './contacts.css';

const NUMBER_OF_AVATARS = 7;

const Home = function ({contacts}) {
    const {conversation, dispatch, generateNewConversationChannel} = useContext(ConversationContext);
    const [selectedContactId, setSelectedContactId] = useState(null);
    useEffect( () => {
        if (selectedContactId && !conversation.channel){
            setTimeout( function () {
                setSelectedContactId(null);
            }, 300);
        } else if (!selectedContactId && conversation.contacts.length){
            setSelectedContactId(conversation.contacts[0].id);
        }
    },[conversation.contacts, conversation.channel, selectedContactId]);

    const onContactClick = async contact => {
        const channel = await generateNewConversationChannel();
        dispatch(startConversation(channel));
        // dispatch(addContact(contact.id));
        // setSelectedContactId(contact.id);
    };

    const openingConversation = (conversation.channel && !conversation.contacts.length && selectedContactId !== null);
    const inConversation = (conversation.contacts.length && selectedContactId !== null);
    const leavingConversation = (!conversation.channel && selectedContactId !== null);
    const avatars = [];
    for(let i=0; i< NUMBER_OF_AVATARS && i< contacts.length; i++){
        const contact = contacts[i];
        const additionalClasses = `animatedAvatar ${openingConversation || inConversation ? (selectedContactId === contact.id ? 'selected' : 'pushed-back') : ''} ${leavingConversation ? (selectedContactId === contact.id ? 'leaving' : '') : ''} `
        const component = (
            <ContactAvatar
                styles={`${contact.id !== selectedContactId ? contact.status : ''} `}
                contact={contact}
                scaleOnHover={!openingConversation && contact.status === 'available'}
                onContactClick={(!openingConversation && contact.status === 'available') ? onContactClick : _=>{}}/>
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
            {openingConversation ? <div className="loading">Contacting...</div> : ''}
            {!contacts || !contacts.length ? (
                <div className="loading">Loading contacts...</div>
            ) : (
                <AvatarsCollection avatars={avatars}/>
                )
            }
        </div>
    );
};

export default Home;

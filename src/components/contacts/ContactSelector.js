import React, { useContext, useEffect, useState } from 'react';
import ContactAvatar from '../contacts/ContactAvatar';
import { ConversationContext } from "../../contexts/ConversationContext";
import {abortAddingContactAfterTimeout, addContact, startConversation} from "../../reducers/conversationReducer";
import AvatarsCollection from "../layout/AvatarsCollection";

import '../contacts/contacts.css';

const NUMBER_OF_AVATARS = 7;

const ContactSelector = function ({contacts, displayInformationalText, name}) {
    const {conversation, dispatch, generateNewConversationChannel} = useContext(ConversationContext);
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [abortConnectingWithContactTimeout, setAbortConnectingWithContactTimeout] = useState(null);
    useEffect( () => {
        if(selectedContactId && !abortConnectingWithContactTimeout){
            console.log('Starting connecting timeout');
            setAbortConnectingWithContactTimeout(setTimeout( function () {
                    displayInformationalText('Failed to connect. Please try again.', 'negative');
                    setAbortConnectingWithContactTimeout(null);
                    setSelectedContactId(null);
                    dispatch(abortAddingContactAfterTimeout());
            }, 5000));
        }
        if (abortConnectingWithContactTimeout && selectedContactId && conversation.contacts.length && conversation.contacts.find( c => { return c.id === selectedContactId} )){
            console.log('Cancelling connecting timeout');
            clearTimeout(abortConnectingWithContactTimeout);
            setAbortConnectingWithContactTimeout(null);
            setSelectedContactId(null);
        }
        return _ => {
            if(abortConnectingWithContactTimeout){
                clearTimeout(abortConnectingWithContactTimeout);
                setAbortConnectingWithContactTimeout(null);
            }
        };
    },[conversation.contacts, conversation.channel, selectedContactId, abortConnectingWithContactTimeout, dispatch, displayInformationalText]);

    useEffect( () => {
        if(conversation.isCreator && conversation.aborted){
            console.log('here');
            displayInformationalText('Failed to connect. Please try again.', 'negative');
            setSelectedContactId(null);
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

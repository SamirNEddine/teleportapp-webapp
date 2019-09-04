import React, { useContext, useEffect, useState } from 'react';
import ContactAvatar from './ContactAvatar';
import { ConversationContext } from "../../contexts/ConversationContext";
import './contacts.css';
import {addContact, contactFetched, startConversation} from "../../reducers/conversationReducer";
import { useLazyQuery } from '@apollo/react-hooks'
import {GET_OPENTOK_SESSION} from '../../graphql/queries'

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

    const [getOpenTokSession, {error, loading, data}] = useLazyQuery(GET_OPENTOK_SESSION);
    useEffect( () => {
        if(selectedContactId && !conversation.channel && !error && !loading && data){
            console.log(data);
            const {openTokSession} = data;
            dispatch(startConversation(openTokSession));
            dispatch(addContact(selectedContactId));
        }
    }, [conversation.channel, error, data, loading, selectedContactId]);

    const onContactClick = contact => {
        setSelectedContactId(contact.id);
        getOpenTokSession();
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
                const avatar = <ContactAvatar
                    styles={`contact-list-avatar ${positionClassName} ${contact.id !== selectedContactId ? contact.status : 'available'} ${openingConversation ? (selectedContactId === contact.id ? 'selected' : '') : ''}`}
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
        <div>
            {selectedContactId ? <div className="loading">Contacting...</div> : ''}
            {displayList()}
        </div>
    );
};

export default ContactList;

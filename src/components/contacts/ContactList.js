import React, { useContext, useEffect, useState } from 'react';
import ContactAvatar from './ContactAvatar';
import { GET_USERS } from "../../graphql/queries";
import { useQuery } from "@apollo/react-hooks";
import { ConversationContext } from "../../contexts/ConversationContext";
import './contacts.css';
import {STATUS_SOCKET, STATUS_SOCKET_INCOMING_MESSAGES, useSocket} from "../../hooks/socket";
import {AuthenticationContext} from "../../contexts/AuthenticationContext";
import {addContact, startConversation} from "../../reducers/conversationReducer";

const DEGREE_OFFSET = 60;
const DEGREE_PREFIX = "deg";
const STARTING_DEGREE = 30;
const NUMBER_OF_AVATARS = 7;

const ContactList = function () {
    const {conversation, dispatch} = useContext(ConversationContext);
    const [selectedContactId, setSelectedContactId] = useState(null);
    useEffect( () => {
        if(selectedContactId && conversation.contacts.length){
            //Reset for next time
            setSelectedContactId(null);
        }
    },[conversation.contacts, selectedContactId]);
    const {error, loading, data, refetch} = useQuery(GET_USERS);

    const {authState} = useContext(AuthenticationContext);
    const [socketError, message, socketData, sendMessage] = useSocket(authState, STATUS_SOCKET);
    useEffect( () => {
        if (message === STATUS_SOCKET_INCOMING_MESSAGES.STATUS_UPDATE){
            refetch()
        }
    }, [message, socketData]);


    const onContactClick = contact => {
        setSelectedContactId(contact.id);
        dispatch(startConversation());
        dispatch(addContact(contact.id));
    };

    const displayList = _ => {
        const {users} = data;
        if (error){
            //Todo: Error messaging
            return <div>Error!</div>
        }
        if (loading){
            return <div className="loading">Loading users...</div>
        }else if (!users || users.length === 0){
            return <div>No users.</div>
        }else{
            const avatars = [];
            const openingConversation = (!conversation.contacts.length && selectedContactId !== null);
            for(let i=0; i< NUMBER_OF_AVATARS && i< users.length; i++){
                const user = users[i];
                const positionClassName = i === 0 ? "center" : DEGREE_PREFIX + String(STARTING_DEGREE + (i-1)*DEGREE_OFFSET);
                const avatar = <ContactAvatar styles={`contact-list-avatar ${positionClassName} ${user.status} ${openingConversation ? (selectedContactId === user.id ? 'selected' : '') : ''}`} contact={user} scaleOnHover={!openingConversation && user.status === 'available'} key={user.id} onContactClick={onContactClick}/>;
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

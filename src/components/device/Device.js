import React, { useContext, useEffect, useState } from 'react';
import ContactList from "../contacts/ContactList";
import Conversation from "../conversation/Conversation";
import Unavailable from './Unavailable';
import './device.css';
import {ConversationContext} from "../../contexts/ConversationContext";
import {leaveConversation} from "../../reducers/conversationReducer";
import {AuthenticationContext} from "../../contexts/AuthenticationContext";
import {
    STATUS_SOCKET,
    STATUS_SOCKET_INCOMING_MESSAGES,
    STATUS_SOCKET_OUTGOING_MESSAGES,
    useSocket
} from "../../hooks/socket";
import {useQuery} from "@apollo/react-hooks";
import { GET_USERS } from "../../graphql/queries";

const Device = function () {
    const [contacts, setContacts] = useState([]);
    const {error, loading, data, refetch} = useQuery(GET_USERS);
    useEffect( () => {
        if (!error && !loading){
            setContacts(data.users);
        }
    }, [error, loading, data, contacts]);

    const {authState} = useContext(AuthenticationContext);
    const [socketError, message, socketData, sendMessage] = useSocket(authState, STATUS_SOCKET);
    useEffect( () => {
        if (message === STATUS_SOCKET_INCOMING_MESSAGES.STATUS_UPDATE){
            //To do: Update locally instead of refetching.
            refetch()
        }
    }, [message, socketData]);

    const {conversation, dispatch} = useContext(ConversationContext);
    const [status, setStatus] = useState('available');
    useEffect( () => {
        sendMessage(STATUS_SOCKET_OUTGOING_MESSAGES.UPDATE_STATUS, {status});
    }, [status]);
    useEffect( () => {
        if(conversation.channel){
            setStatus('busy');
        }else if (status !== 'unavailable'){
            setStatus('available');
        }
    }, [conversation.channel, sendMessage, status]);

    const onButtonClick = _ => {
        if (conversation.channel){
            //leave conversation
            dispatch(leaveConversation());
        }else{
            //Switch status
            setStatus(status === 'available' ? 'unavailable' : 'available');
        }
    };
    return (
        <div className="device-container">
            <div className="hardware-button" onClick={onButtonClick}/>
            <ContactList contacts={contacts}/>
            {conversation.contacts.length ? <Conversation/> : ''}
            {status === 'unavailable' ? <Unavailable/> : ''}
        </div>
    );
};

export default Device;
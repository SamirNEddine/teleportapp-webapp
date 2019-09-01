import React, { useContext, useEffect, useState } from 'react';
import ContactList from "../contacts/ContactList";
import Conversation from "../conversation/Conversation";
import './device.css';
import {ConversationContext} from "../../contexts/ConversationContext";
import {leaveConversation} from "../../reducers/conversationReducer";
import {AuthenticationContext} from "../../contexts/AuthenticationContext";
import {STATUS_SOCKET, STATUS_SOCKET_INCOMING_MESSAGES, useSocket} from "../../hooks/socket";
import {useQuery} from "@apollo/react-hooks";
import { GET_USERS } from "../../graphql/queries";

const Device = function () {
    const {conversation, dispatch} = useContext(ConversationContext);

    const [contacts, setContacts] = useState([]);
    const {error, loading, data, refetch} = useQuery(GET_USERS);
    useEffect( () => {
        if (!error && !loading){
            setContacts(data.users);
        }
    }, [error, loading, data, contacts]);

    const {authState} = useContext(AuthenticationContext);
    const [status, setStatus] = useState('available');
    const [socketError, message, socketData, sendMessage] = useSocket(authState, STATUS_SOCKET);
    useEffect( () => {
        if (message === STATUS_SOCKET_INCOMING_MESSAGES.STATUS_UPDATE){
            refetch()
        }
    }, [message, socketData]);

    const onButtonClick = _ => {
        if (conversation.channel){
            dispatch(leaveConversation());
        }
    };
    return (
        <div className="device-container">
            <div className="hardware-button" onClick={onButtonClick}/>
            <ContactList contacts={contacts}/>
            {conversation.contacts.length ? <Conversation/> : ''}
        </div>
    );
};

export default Device;
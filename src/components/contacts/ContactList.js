import React, { useContext, useEffect } from 'react';
import ContactAvatar from './ContactAvatar';
import { GET_USERS } from "../../graphql/queries";
import { useQuery } from "@apollo/react-hooks";
import { ConversationContext } from "../../contexts/ConversationContext";

import './contacts.css';
import {addContact, joinConversation, startConversation} from "../../reducers/conversationReducer";
import {STATUS_SOCKET, STATUS_SOCKET_INCOMING_MESSAGES, useSocket} from "../../hooks/socket";
import {AuthenticationContext} from "../../contexts/AuthenticationContext";

const DEGREE_PREFIX = "deg";
const STARTING_DEGREE = 30;
const DEGREE_OFFSET = 60;
const NUMBER_OF_AVATARS = 7;

const ContactList = function ({history}) {
    const {conversation, dispatch} = useContext(ConversationContext);
    useEffect( _ => {
        if (conversation.contacts && conversation.contacts.length){
            history.push({
                pathname: '/conversation',
            });
        }
    }, [conversation.contacts, history]);

    const {error, loading, data, refetch} = useQuery(GET_USERS);

    const {authState} = useContext(AuthenticationContext);
    const [socketError, message, socketData, sendMessage] = useSocket(authState, STATUS_SOCKET);
    useEffect( () => {
        if (message === STATUS_SOCKET_INCOMING_MESSAGES.STATUS_UPDATE){
            refetch()
        }
    }, [message, socketData]);

    const onContactClick = contact => {
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
            return <div className="loading-contacts">Loading users...</div>
        }else if (!users || users.length === 0){
            return <div>No users.</div>
        }else{
            const avatars = [];
            for(let i=0; i< NUMBER_OF_AVATARS && i< users.length; i++){
                const user = users[i];
                const positionClassName = i === 0 ? "center" : DEGREE_PREFIX + String(STARTING_DEGREE + (i-1)*DEGREE_OFFSET);
                const avatar = <ContactAvatar positionClassName={positionClassName} contact={user} key={user.id} onContactClick={onContactClick}/>;
                avatars.push(avatar);
            }
            return avatars;
        }
    };
    return (
        <div>
            <div className="screen-container">
                {conversation && (conversation.waiting || conversation.loading) ? <div className="message">Contacting...</div> : ''}
                {displayList()}
            </div>
            {conversation && conversation.error ? <div className="error">Error: {conversation.error}</div> : ''}

        </div>
    );
};

export default ContactList;

import React, { useContext, useEffect, useState, useCallback } from 'react';
import Home from "../contacts/Home";
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
    const {authState} = useContext(AuthenticationContext);

    const [contacts, setContacts] = useState([]);
    const {error, loading, data, refetch} = useQuery(GET_USERS, {
        skip: (!authState.user || authState.error)
    });
    useEffect( () => {
        if (!error && !loading && data){
            setContacts(data.users);
        }
    }, [error, loading, data]);

    const [, message, socketData, sendMessage] = useSocket(authState, STATUS_SOCKET);
    useEffect( () => {
        if (message === STATUS_SOCKET_INCOMING_MESSAGES.STATUS_UPDATE && authState.user){
            //To do: Update locally instead of refetching.
            refetch()
        }
    }, [message, socketData, refetch, authState.user]);

    const {conversation, dispatch} = useContext(ConversationContext);
    const [status, setStatus] = useState('available');
    useEffect( () => {
        sendMessage(STATUS_SOCKET_OUTGOING_MESSAGES.UPDATE_STATUS, {status});
    }, [status, sendMessage]);
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

    const [informationalText, setInformationalText] = useState(null);
    const displayInformationalText =  useCallback(function(text, type){
        setInformationalText({text, type});
        setTimeout(function () {
            setInformationalText(null);
        }, 2000);
    }, []);

    useEffect( () => {
        if(conversation.microphoneAccess === 'denied' || conversation.microphoneAccess === 'asking'){
            setInformationalText({text: 'Microphone access is required to use Teleport.', type: 'negative'});
        }else{
            setInformationalText(null);
        }
    }, [conversation.microphoneAccess]);

    return (
        <div className="device-container">
            <div className="hardware-button" onClick={onButtonClick}/>
            <div className="device-screen">
                {informationalText ? (
                    <div className={`information-text-container ${informationalText.type}`}>
                        <div className={`information-text ${informationalText.type}`}>{informationalText.text}</div>
                    </div>
                ) : ''}
                <div style={{visibility: `${conversation.contacts.length ? 'hidden': 'visible'}`}}>
                    <Home contacts={contacts} displayInformationalText={displayInformationalText}/>
                </div>
                {conversation.contacts.length ? <Conversation/> : ''}
                {status === 'unavailable' ? <Unavailable/> : ''}
            </div>
        </div>
    );
};

export default Device;
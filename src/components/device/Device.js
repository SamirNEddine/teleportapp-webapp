import React, { useContext, useEffect, useState, useCallback } from 'react';
import Home from "../home/Home";
import Conversation from "../conversation/Conversation";
import Unavailable from './Unavailable';
import HardwareButton from './HardwareButton';
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
import { GET_RECOMMENDED_CONTACTS } from "../../graphql/queries";

const Device = function () {
    const {authState} = useContext(AuthenticationContext);

    const [contacts, setContacts] = useState([]);
    const {error, loading, data, refetch} = useQuery(GET_RECOMMENDED_CONTACTS, {
        skip: (!authState.user || authState.error)
    });
    useEffect( () => {
        if (!error && !loading && data){
            setContacts(data.recommendedContacts);
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

    const [informationalText, setInformationalText] = useState(null);
    const displayInformationalText =  useCallback(function(text, type){
        setInformationalText({text, type});
        setTimeout(function () {
            setInformationalText(null);
        }, 2000);
    }, []);

    const [microphoneAccess, setMicrophoneAccess] = useState(null);
    useEffect( () => {
        if(!microphoneAccess && authState.user){
            const askStateTimeout =  setTimeout(function () {
                setMicrophoneAccess('asking');
                setStatus('unavailable');
            }, 500);
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(function() {
                    clearTimeout(askStateTimeout);
                    setMicrophoneAccess('allowed');
                    setStatus('available');
                    console.debug('Access to microphone allowed');
                }).catch(function() {
                    clearTimeout(askStateTimeout);
                    setMicrophoneAccess('denied');
                    console.debug('Access to microphone denied')
                });
        }
        if(microphoneAccess === 'denied' || microphoneAccess === 'asking'){
            setInformationalText({text: 'Microphone access is required to use Teleport.', type: 'negative'});
        }else{
            setInformationalText(null);
        }
    },[microphoneAccess, authState.user]);

    useEffect( () => {
        if(conversation.aborted){
            //Check microphone access
            setTimeout(function () {
                setMicrophoneAccess(null);
            }, 2100);
        }
    }, [conversation.aborted]);

    const onButtonSinglePress = _ => {
        if (conversation.channel && conversation.contacts.length){
            //leave conversation. Do not allow leaving when connecting
            dispatch(leaveConversation());
        }else if(!conversation.channel){
            //Switch status
            setStatus(status === 'available' ? 'unavailable' : 'available');
        }
    };

    return (
        <div className="device-container">
            <HardwareButton onSinglePress={onButtonSinglePress}/>
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
                {microphoneAccess === 'allowed' && status === 'unavailable' ? <Unavailable/> : ''}
            </div>
        </div>
    );
};

export default Device;
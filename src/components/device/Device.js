import React, { useContext, useEffect, useState, useCallback } from 'react';
import Home from '../home/Home';
import Conversation from '../conversation/Conversation';
import Unavailable from './Unavailable';
import HardwareButton from './HardwareButton';
import './device.css';
import { ConversationContext } from '../../contexts/ConversationContext';
import {
    cancelSelectingContact, closeConversationScreen,
    selectContactToAddToConversation
} from '../../reducers/conversationReducer';
import { AuthenticationContext } from '../../contexts/AuthenticationContext';
import { updateStatus, Status } from '../../reducers/authenticationReducer';

const Device = function () {
    const authContext = useContext(AuthenticationContext);
    const authState = authContext.authState;
    const dispatchAuth = authContext.dispatch;

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
                dispatchAuth(updateStatus(Status.UNAVAILABLE));
            }, 500);
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(function() {
                    clearTimeout(askStateTimeout);
                    setMicrophoneAccess('allowed');
                    dispatchAuth(updateStatus(Status.AVAILABLE));
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
    },[microphoneAccess, authState.user, dispatchAuth]);

    const {conversation, dispatch} = useContext(ConversationContext);
    useEffect( () => {
        if(conversation.channel){
            dispatchAuth(updateStatus(Status.BUSY))
        }else if (authState.status && authState.status !== Status.UNAVAILABLE && authState.status !== Status.AVAILABLE && microphoneAccess === 'allowed'){
            dispatchAuth(updateStatus(Status.AVAILABLE));
        }
    }, [conversation.channel, authState.status, dispatchAuth, microphoneAccess]);

    useEffect( () => {
        if(conversation.aborted){
            //Check microphone access
            setTimeout(function () {
                setMicrophoneAccess(null);
            }, 2100);
        }
    }, [conversation.aborted]);

    const onButtonSinglePress = _ => {
        if(conversation.selectingContact) {
            dispatch(cancelSelectingContact());
        }else if (conversation.channel && conversation.contacts.length){
            //leave conversation. Do not allow leaving when connecting
            dispatch(closeConversationScreen());
        }else if(!conversation.channel){
            //Switch status
            dispatchAuth(updateStatus(authState.status === Status.AVAILABLE ? Status.UNAVAILABLE : Status.AVAILABLE));
        }
    };
    const onButtonLongPress = _ => {
        if(conversation.selectingContact){
            dispatch(cancelSelectingContact());
        }else if(conversation.channel && conversation.contacts.length){
            dispatch(selectContactToAddToConversation());
        }
    };

    return (
        <div className="device-container">
            <HardwareButton onSinglePress={onButtonSinglePress} onLongPress={onButtonLongPress} />
            <div className="device-screen">
                {informationalText ? (
                    <div className={`information-text-container ${informationalText.type}`}>
                        <div className={`information-text ${informationalText.type}`}>{informationalText.text}</div>
                    </div>
                ) : ''}
                {!conversation.contacts.length || conversation.closeConversationScreen ? <Home displayInformationalText={displayInformationalText}/> : ''}
                {conversation.contacts.length ? <Conversation displayInformationalText={displayInformationalText}/> : ''}
                {microphoneAccess === 'allowed' && authState.status === Status.UNAVAILABLE ? <Unavailable/> : ''}
            </div>
        </div>
    );
};

export default Device;
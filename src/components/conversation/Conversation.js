import React, {useState, useContext, useEffect} from 'react';
import { Redirect } from 'react-router-dom';
import { AgoraContext } from "../../contexts/AgoraContext";
import { ConversationContext } from "../../contexts/ConversationContext";

import './conversation.css'
import {contactRemoteStreamPlayed} from "../../actions/conversationActions";

const Conversation = function ({location, data}) {
    const { remoteStreams, agoraError } = useContext(AgoraContext);
    const {conversation, dispatch} = useContext(ConversationContext);
    const [speakingUser] = useState((conversation && conversation.contacts && conversation.contacts.length) ? conversation.contacts[0] : null);
    useEffect(_ => {
        if (remoteStreams && remoteStreams.length) {
            remoteStreams.forEach(stream => {
                if (stream.isPlaying()){
                    stream.resume();
                }else{
                    const streamId = stream.getId();
                    stream.play('audio-div_' + streamId);
                }
            });
            if (conversation.playingContactRemoteStream) {
                dispatch(contactRemoteStreamPlayed());
            }
        }
    });
    if (!conversation || !conversation.contacts || !conversation.contacts.length){
        return <Redirect to="/"/>
    }
    const {contacts} = conversation;
    const contactsDivs = contacts.map(contact => {
        if (contact.userId === speakingUser.userId){
            return (
                <div key={`${contact.userId}_div`}>
                    <img src={contact.profilePicture} className="speaking-user" alt="user" key={`${contact.userId}_img`}/>
                    <div className="speaking-user-name" key={`${contact.userId}_name`}>{`${contact.firstName} ${contact.lastName}`}</div>
                </div>
            )
        }else{
            //To do
            return <div></div>
        }
    });
    const audioDivs = remoteStreams && remoteStreams.length ?  remoteStreams.map(stream => {
        return <div id={`audio-div_${stream.getId()}`} key={`audio-div_${stream.getId()}`}/>
    }) : '';

    return (
        <div className="screen-container">
            {agoraError ? <div className="error">Error!</div> : ''}
            {contactsDivs}
            {audioDivs}
        </div>
    )
};
export default Conversation;
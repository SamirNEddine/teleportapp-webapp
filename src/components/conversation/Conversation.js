import React, {useState, useContext} from 'react';
import { Redirect } from 'react-router-dom';
import { AgoraContext } from "../../contexts/AgoraContext";
import { ConversationContext } from "../../contexts/ConversationContext";

import './conversation.css'
import {contactRemoteStreamPlayed} from "../../actions/conversationActions";

const Conversation = function ({location, data}) {
    const { remoteStreams, agoraError } = useContext(AgoraContext);
    const {conversation, dispatch} = useContext(ConversationContext);
    const [speakingUser, setSpeakingUser] = useState((conversation && conversation.contacts && conversation.contacts.length) ? conversation.contacts[0] : null);
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
        }
    });
    console.log("REMOTE STEAMS!!!", remoteStreams);
    const audioDivs = remoteStreams && remoteStreams.length ?  remoteStreams.map(stream => {
        return <div id={`audio-div_${stream.getId()}`} key={`audio-div_${stream.getId()}`}/>
    }) : '';

    const playStreams = () => {
        setTimeout(_ => {
            remoteStreams.forEach( stream => {

                    const streamId = stream.getId();
                    stream.play('audio-div_'+streamId);

            });
        }, 50);

        if(conversation.playingContactRemoteStream){
            dispatch(contactRemoteStreamPlayed());
        }
    };

    return (
        <div className="screen-container">
            {agoraError ? <div className="error">Error!</div> : ''}
            {contactsDivs}
            {audioDivs}
            {playStreams()}
        </div>
    )
};
export default Conversation;
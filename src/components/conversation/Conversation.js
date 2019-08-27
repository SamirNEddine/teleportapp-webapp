import React, {useState, useContext, useEffect} from 'react';
import { Redirect } from 'react-router-dom';
import { AgoraContext } from "../../contexts/AgoraContext";
import { ConversationContext } from "../../contexts/ConversationContext";

import './conversation.css'
import {contactRemoteStreamPlayed} from "../../actions/conversationActions";

const Conversation = function ({history}) {
    const {agoraError} = useContext(AgoraContext);
    const {conversation, dispatch} = useContext(ConversationContext);
    const [speakingUser] = useState((conversation && conversation.contacts && conversation.contacts.length) ? conversation.contacts[0] : null);
    useEffect(_ => {
        if (!conversation.contacts.length){
            history.push({
                pathname: '/',
            });
        }
        if (conversation.playingContactRemoteStream) {
            console.log("CONTACTS: ", conversation.contacts);
            //Play the stream of the last added contact
            const stream = conversation.contacts[contacts.length - 1].stream;
            const streamId = stream.getId();
            stream.play('audio-div_' + streamId);
            dispatch(contactRemoteStreamPlayed());
        }
    });
    if (!conversation || !conversation.contacts || !conversation.contacts.length){
        return <Redirect to="/"/>
    }
    const {contacts} = conversation;
    const contactsDivs = contacts.map(contact => {
        if (contact.id === speakingUser.id){
            return (
                <div key={`${contact.id}_div`}>
                    <img src={contact.profilePicture} className="speaking-user" alt="user" key={`${contact.id}_img`}/>
                    <div className="speaking-user-name" key={`${contact.id}_name`}>{`${contact.firstName} ${contact.lastName}`}</div>
                    {contact.stream ? <div id={`audio-div_${contact.stream.getId()}`} key={`audio-div_${contact.stream.getId()}`}/> : ''}
                </div>
            )
        }else{
            //To do
            return <div></div>
        }
    });
    // const audioDivs = remoteStreams && remoteStreams.length ?  remoteStreams.map(stream => {
    //     return <div id={`audio-div_${stream.getId()}`} key={`audio-div_${stream.getId()}`}/>
    // }) : '';

    return (
        <div className="screen-container">
            {agoraError ? <div className="error">Error!</div> : ''}
            {contactsDivs}
            {/*{audioDivs}*/}
        </div>
    )
};
export default Conversation;
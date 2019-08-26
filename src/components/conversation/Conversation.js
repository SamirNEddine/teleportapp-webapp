import React, {useState, useContext} from 'react';
import { Redirect } from 'react-router-dom';
import { AgoraContext } from "../../contexts/AgoraContext";
import { ConversationContext } from "../../contexts/ConversationContext";

import './conversation.css'

const Conversation = function ({location, data}) {
    const { remoteStreams, agoraError } = useContext(AgoraContext);
    const {conversation} = useContext(ConversationContext);
    const [speakingUser, setSpeakingUser] = useState((conversation && conversation.contacts && conversation.contacts.length) ? conversation.contacts[0] : null);
    if (!conversation || !conversation.contacts || !conversation.contacts.length){
        return <Redirect to="/"/>
    }

    const {contacts} = conversation;
    const contactsDivs = contacts.map(contact => {
        if (contact.userId === speakingUser.userId){
            return (
                <div>
                    <img src={contact.profilePicture} className="speaking-user" alt="user"/>
                    <div className="speaking-user-name">{`${contact.firstName} ${contact.lastName}`}</div>
                </div>
            )
        }else{
            //To do
        }
    });
    const audioDivs = remoteStreams.map(stream => {
        return <div id={`audio-div_${stream.getId()}`}/>
    });

    return (
        <div className="screen-container">
            {contactsDivs}
            {audioDivs}
        </div>
    )
};
export default Conversation;
import React, {useState, useContext, useEffect} from 'react';
import { ConversationContext } from "../../contexts/ConversationContext";
import './conversation.css'
import ContactAvatar from "../contacts/ContactAvatar";
import {unmuteAudio} from "../../reducers/conversationReducer";

const Conversation = function () {
    const {conversation, dispatch} = useContext(ConversationContext);
    useEffect(_ => {
        //Todo: Check if you need optimization here
        for (let i = 0; i < conversation.contacts.length; i++) {
            const contact = conversation.contacts[i];
            if (conversation.remoteStreams[contact.id]) {
                console.log(`Playing stream for contact ${contact.id}`);
                conversation.remoteStreams[contact.id].play('audio-div_' + contact.id);
            }
        }

        return _ => {
            console.debug("Stopping remote streams");
            for(const remoteStreamId in conversation.remoteStreams){
                const remoteStream = conversation.remoteStreams[remoteStreamId];
                remoteStream.stop();
            }
        }
    }, [conversation.contacts, conversation.remoteStreams]);

    const [speakingUser] = useState((conversation && conversation.contacts && conversation.contacts.length) ? conversation.contacts[0] : null);

    const unmute = function () {
        dispatch(unmuteAudio());
    };

    const {contacts} = conversation;
    console.log('Conversation with contacts:\n', contacts);
    return (
        <div className="conversation-container">
            {contacts.map(contact => {
                if (contact.id === speakingUser.id){
                    const backgroundImageStyle = {backgroundImage: `url('${contact.profilePicture}')`};
                    return (
                        <div className="speaking-user-container" key={`${contact.id}_div`}>
                            <ContactAvatar  contact={contact} styles="speaking-user"  showContactInfo={true} />
                            <div id={`audio-div_${contact.id}`} key={`audio-div_${contact.id}`}/>
                        </div>
                    )
                }else{
                    //To do
                    return <div/>
                }
            })}
            {conversation.muteAudio ? (
                <div className="mute-container" onClick={unmute}>
                    <div className="mute-indicator"/>
                    <div className='mute-text'>You are in a conversation.<br/>Tap to unmute.</div>
                </div>
            ) : ('')}
        </div>
    )
};

export default Conversation;
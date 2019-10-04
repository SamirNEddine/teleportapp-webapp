import React, {useState, useContext, useEffect} from 'react';
import { ConversationContext } from "../../contexts/ConversationContext";
import './conversation.css'
import ContactAvatar from "../contacts/ContactAvatar";
import {answerConversation, unmuteAudio} from "../../reducers/conversationReducer";
import AddContact from './AddContact';

const FloatingContactStyles = [
    'deg14',
    'deg166',
    'deg270',
    'deg323',
    'deg217'
];

const Conversation = function () {
    const {conversation, dispatch} = useContext(ConversationContext);
    const [speakingUser, setSpeakingUser] = useState((conversation && conversation.contacts && conversation.contacts.length) ? conversation.contacts[0] : null);
    useEffect(() => {
        if(process.env.REACT_APP_VOICE_PLATFORM === 'agora'){
            //Todo: Check if you need optimization here
            for (let i = 0; i < conversation.contacts.length; i++) {
                const contact = conversation.contacts[i];
                if (conversation.remoteStreams[contact.id]) {
                    console.log(`Playing stream for contact ${contact.id}`);
                    conversation.remoteStreams[contact.id].play('audio-div_' + contact.id);
                }
            }
        }
        if(conversation.contacts.length){
            setSpeakingUser(conversation.contacts[conversation.contacts.length -1]);
        }
        return _ => {
            if(process.env.REACT_APP_VOICE_PLATFORM === 'agora'){
                console.debug("Stopping remote streams");
                for(const remoteStreamId in conversation.remoteStreams){
                    const remoteStream = conversation.remoteStreams[remoteStreamId];
                    remoteStream.stop();
                }
            }
        }
    }, [conversation.contacts, conversation.remoteStreams]);

    const [answeredConversation, setAnsweredConversation] = useState(false);
    const unmute = function () {
        if(!answeredConversation){
            dispatch(answerConversation());
            setAnsweredConversation(true);
        }else{
            dispatch(unmuteAudio());
        }
    };

    let i = 0;
    let {contacts} = conversation;
    const contactsDivs = contacts.map(contact => {
        i++;
        if (contact.id === speakingUser.id){
            return (
                <div className="speaking-user-container" key={`${contact.id}_div`}>
                    <ContactAvatar  contact={contact} styles="speaking-contact"  showContactInfo={true} />
                    {process.env.REACT_APP_VOICE_PLATFORM === 'agora' ? <div id={`audio-div_${contact.id}`} key={`audio-div_${contact.id}`}/> : ''}
                </div>
            )
        }else{
            return <ContactAvatar contact={contact} styles={`contact ${FloatingContactStyles[i-1]}`} key={`${contact.id}_div`}/>
        }
    });

    console.log('Conversation with contacts:\n', contacts);
    return (
        <div className="conversation-container">
            {contactsDivs}
            {conversation.muteAudio ? (
                <div className="mute-container" onClick={unmute}>
                    <div className="mute-indicator"/>
                    <div className='mute-text'>You are in a conversation.<br/>Tap to unmute.</div>
                </div>
            ) : ('')}
            {conversation.selectingContact ? <div className="add-contact-container"> <AddContact/>  </div>: ''}
        </div>
    )
};

export default Conversation;
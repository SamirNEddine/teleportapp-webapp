import React, {useState, useContext, useEffect} from 'react';
import { ConversationContext } from "../../contexts/ConversationContext";

import './conversation.css'

const Conversation = function ({history}) {
    const {conversation} = useContext(ConversationContext);
    const [speakingUser] = useState((conversation && conversation.contacts && conversation.contacts.length) ? conversation.contacts[0] : null);
    useEffect(_ => {
        if (!conversation.contacts.length){
            history.push({
                pathname: '/',
            });
        }
    }, [conversation.contacts, history]);

    const playRemoteStreams = _ => {
        //Todo: Check if you need optimization here
        for (let i = 0; i < conversation.contacts.length; i++) {
            const contact = conversation.contact[i];
            if (conversation.remoteStreams[contact.id]) {
                conversation.remoteStreams[contact.id].play('audio-div_' + contact.id);
            }
        }
    };

    console.log('Conversation with contacts:\n', conversation.contacts);
    const {contacts} = conversation;
    const contactsDivs = contacts.map(contact => {
        if (contact.id === speakingUser.id){
            const backgrouldImageStyle = {backgroundImage: `url('${contact.profilePicture}')`};
            return (
                <div key={`${contact.id}_div`}>
                    <div style={backgrouldImageStyle} className="speaking-user" key={`${contact.id}_img`}>
                        <div className="speaking-user-name" key={`${contact.id}_name`}>{`${contact.firstName} ${contact.lastName}`}</div>
                    </div>
                    {contact.stream ? <div id={`audio-div_${contact.stream.getId()}`} key={`audio-div_${contact.stream.getId()}`}/> : ''}
                </div>
            )
        }else{
            //To do
            return <div/>
        }
    });

    return (
        <div className="screen-container">
            {contactsDivs}
            {playRemoteStreams()}
        </div>
    )
};

export default Conversation;
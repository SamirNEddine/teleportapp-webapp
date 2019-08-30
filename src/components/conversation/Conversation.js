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

        //Todo: Check if you need optimization here
        console.debug(`Remote streams: ${conversation.remoteStreams}`);
        for (let i = 0; i < conversation.contacts.length; i++) {
            const contact = conversation.contacts[i];
            if (conversation.remoteStreams[contact.id]) {
                console.log(`Playing stream for contact ${contact.id}`);
                conversation.remoteStreams[contact.id].play('audio-div_' + contact.id);
            }
        }
    }, [conversation.contacts, conversation.remoteStreams, history]);

    console.log('Conversation with contacts:\n', conversation.contacts);
    const {contacts} = conversation;
    const contactsDivs = contacts.map(contact => {
        if (contact.id === speakingUser.id){
            const backgroundImageStyle = {backgroundImage: `url('${contact.profilePicture}')`};
            return (
                <div key={`${contact.id}_div`}>
                    <div style={backgroundImageStyle} className="speaking-user" key={`${contact.id}_img`}>
                        <div className="speaking-user-name" key={`${contact.id}_name`}>{`${contact.firstName} ${contact.lastName}`}</div>
                    </div>
                    <div id={`audio-div_${contact.id}`} key={`audio-div_${contact.id}`}/>
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
        </div>
    )
};

export default Conversation;
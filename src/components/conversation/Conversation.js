import React, {useState, useContext, useEffect} from 'react';
import { ConversationContext } from "../../contexts/ConversationContext";

import './conversation.css'
import Device from "../device/Device";
import ContactAvatar from "../contacts/ContactAvatar";

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
                    <ContactAvatar  contact={contact} styles="speaking-user"  showContactInfo={true} />
                    <div id={`audio-div_${contact.id}`} key={`audio-div_${contact.id}`}/>
                </div>
            )
        }else{
            //To do
            return <div/>
        }
    });

    const onHardwareButtonClick = _ => {
        console.log("hardware button clicked!");
    };
    return (
        <Device onHardwareButtonClick={onHardwareButtonClick}>
            {contactsDivs}
        </Device>
    )
};

export default Conversation;
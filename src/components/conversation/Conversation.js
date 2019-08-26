import React, {useState, useContext} from 'react';
import { Redirect } from 'react-router-dom';
import {GET_AGORA_TOKEN} from "../../graphql/queries";
import { graphql } from 'react-apollo';
import { AgoraContext } from "../../contexts/AgoraContext";

import './conversation.css'

const Conversation = function ({location, data}) {
    const { remoteStreams } = useContext(AgoraContext);
    const {contact, user} = location && location.state ? location.state : {contact:null};
    const [contacts, setContacts] = useState([contact]);
    const [speakingUser, setSpeakingUser] = useState(contact);
    if (!contact){
        return <Redirect to="/"/>
    }
    // const {userAgoraToken} = data;
    //
    // if (userAgoraToken){
    //     agora.client.join(userAgoraToken, user.email, user.userId, function(uid) {
    //         console.log("User " + uid + " join channel successfully");
    //         agora.client.publish(agora.localStream, function (err) {
    //             console.log("Publish local stream error: " + err);
    //         });
    //
    //     }, function(err) {
    //         console.log("Join channel failed", err);
    //     });
    // }

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
export default graphql(GET_AGORA_TOKEN, {
    options:function ({location}) {
        const {user} = location ? location.state : null;
        return {
            variables: {
                channel: user.email
            }
        }
    }
})(Conversation);
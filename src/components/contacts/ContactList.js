import React, { useContext } from 'react';
import ContactAvatar from './ContactAvatar';
import { GET_USERS } from "../../graphql/queries";
import { graphql } from 'react-apollo';
import { AgoraContext } from "../../contexts/AgoraContext";
import { ConversationContext } from "../../contexts/ConversationContext";

import './contacts.css';
import {joinAudioChannel} from "../../actions/conversationActions";

const DEGREE_PREFIX = "deg";
const STARTING_DEGREE = 30;
const DEGREE_OFFSET = 60;
const NUMBER_OF_AVATARS = 7;

const ContactList = function ({data, history}) {
    const {agoraError, remoteStreams} = useContext(AgoraContext);
    const {conversation, dispatch} = useContext(ConversationContext);
    if (conversation.joiningConversation && !conversation.joiningAudioChannel && !conversation.joinedAudioChannel){
        dispatch(joinAudioChannel(conversation.channel));
    }
    if (conversation.playingContactRemoteStream){
        history.push({
            pathname: '/conversation',
        });
        console.log(remoteStreams);
    }

    const displayList = _ => {
        const {loading, users} = data;
        if (loading){
            return <div className="loading-contacts">Loading users...</div>
        }else if (!users || users.length === 0){
            return <div>No users.</div>
        }else{
            const avatars = [];
            for(let i=0; i< NUMBER_OF_AVATARS && i< users.length; i++){
                const user = users[i];
                const positionClassName = i === 0 ? "center" : DEGREE_PREFIX + String(STARTING_DEGREE + (i-1)*DEGREE_OFFSET);
                const avatar = <ContactAvatar positionClassName={positionClassName} contact={user} key={user.id}/>;
                avatars.push(avatar);
            }
            return avatars;
        }
    };
    return (
        <div>
            <div className="screen-container">
                {conversation && (conversation.waiting || conversation.loading) ? <div className="message">Contacting...</div> : ''}
                {displayList()}
            </div>
            {conversation && conversation.error ? <div className="error">Error: {conversation.error}</div> : ''}
            {agoraError ? <div className="error">{agoraError}</div> : ''}
        </div>
    );
};

export default graphql(GET_USERS)(ContactList);

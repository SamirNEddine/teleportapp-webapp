import React, {useState, useContext} from 'react';
import { Redirect } from 'react-router-dom';
import {GET_AGORA_TOKEN} from "../../graphql/queries";
import { graphql } from 'react-apollo';
import { AgoraContext } from "../../contexts/AgoraContext";

import './conversation.css'

const Conversation = function ({location, data}) {
    const { agora } = useContext(AgoraContext);
    const {firstUser, user} = location && location.state ? location.state : {firstUser:null};
    const [otherUsers, setOtherUsers] = useState([firstUser]);
    const [displayedUser, setDisplayedUser] = useState(firstUser);
    if (!firstUser){
        return <Redirect to="/"/>
    }
    const {userAgoraToken} = data;

    if (userAgoraToken){
        agora.client.join(userAgoraToken, user.email, user.userId, function(uid) {
            console.log("User " + uid + " join channel successfully");
            agora.client.publish(agora.localStream, function (err) {
                console.log("Publish local stream error: " + err);
            });

        }, function(err) {
            console.log("Join channel failed", err);
        });
    }

    return (
        <div className="screen-container">
            <img src={displayedUser.profilePicture} className="displayed-user" alt="user"/>
            <div className="displayed-user-name">{`${displayedUser.firstName} ${displayedUser.lastName}`}</div>
            <div id="audio-stream"></div>
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
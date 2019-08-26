import React, { createContext, useState, useContext, useReducer } from 'react';
import {AuthenticationContext} from "./AuthenticationContext";
import { client } from "../helpers/agora";

export const AgoraContext = createContext();

export const AgoraContextProvider = function({children}) {
    const { user } = useContext(AuthenticationContext);
    const [remoteStreams, setRemoteStreams] = useState( []);
    //Listen to remote streams and update state
    client.on('stream-subscribed', function (evt) {
        const remoteStream = evt.stream;
        setRemoteStreams(remoteStreams.push(remoteStream));
        const streamId = remoteStream.getId();
        console.log("Subscribe remote stream successfully: " + streamId);
        remoteStream.play('audio-stream_'+streamId);
    });

    return (
        <AgoraContext.Provider value={{remoteStreams}}>
            {children}
        </AgoraContext.Provider>
    );
};
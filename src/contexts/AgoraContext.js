import React, { createContext, useState, useContext, useReducer } from 'react';
import {AuthenticationContext} from "./AuthenticationContext";
import { getLocalUser } from "./localStorage";
import AgoraRTC from "agora-rtc-sdk";


export const client = AgoraRTC.createClient({ mode: "live", codec: "h264" });
export const localStream = AgoraRTC.createStream({
    streamID: getLocalUser().userId,
    audio: true,
    video: false,
    screen: false
});

export const AgoraContext = createContext();

export const AgoraContextProvider = function({children}) {
    const [remoteStreams, setRemoteStreams] = useState( []);
    const [error, setError] = useState(null);
    //Init the local stream
    localStream.init( _ => {
        //Request access to microphone
        console.log("getUserMedia successfully");
    }, function (err) {
        console.log("getUserMedia failed", err);
        setError(err);
    });
    //Init the client
    client.init(process.env.REACT_APP_AGORA_APP_ID, function () {
        console.log("AgoraRTC client initialized");
    }, function (err) {
        console.log("AgoraRTC client init failed", err);
        setError(err);
    });
    //Setup client listeners
    client.on('stream-published', function (evt) {
        console.log("Publish local stream successfully");
    });
    client.on('stream-added', function (evt) {
        const theStream = evt.stream;
        console.log("New stream added: " + theStream.getId());
        client.subscribe(theStream, function (err) {
            console.log("Subscribe stream failed", err);
            setError(err);
        });
    });
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
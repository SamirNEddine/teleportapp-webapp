import React, { createContext, useState, useContext, useReducer } from 'react';
import {AuthenticationContext} from "./AuthenticationContext";
import AgoraRTC from "agora-rtc-sdk";

export const AgoraContext = createContext();

export const AgoraContextProvider = function({children}) {
    const { user } = useContext(AuthenticationContext);

    const createLocalStreamAndInit = streamId => {
        const stream = AgoraRTC.createStream({
            streamID: streamId,
            audio: true,
            video: false,
            screen: false
        });
        stream.init( _ => {
            //Request access to microphone
            console.log("getUserMedia successfully");
        }, e => {
            console.log("getUserMedia failed", e);
        });
        return stream;
    };
    const createAndSetupAgoraClient = _ => {
        //Create Client
        const agoraClient = AgoraRTC.createClient({ mode: "live", codec: "h264" });
        //Init Client
        agoraClient.init(process.env.REACT_APP_AGORA_APP_ID, function () {
            console.log("AgoraRTC client initialized");
            }, function (err) {
            console.log("AgoraRTC client init failed", err);
        });

        //Setup client listeners
        agoraClient.on('stream-published', function (evt) {
            console.log("Publish local stream successfully");
        });
        agoraClient.on('stream-added', function (evt) {
            const theStream = evt.stream;
            console.log("New stream added: " + theStream.getId());
            client.subscribe(theStream, function (err) {
                console.log("Subscribe stream failed", err);
            });
        });
        agoraClient.on('stream-subscribed', function (evt) {
            const remoteStream = evt.stream;
            setRemoteStreams(remoteStreams.push(remoteStream));
            const streamId = remoteStream.getId();
            console.log("Subscribe remote stream successfully: " + streamId);
            remoteStream.play('audio-stream_'+streamId);
        });
        return agoraClient;
    };

    const [client, setClient] = useState(createAndSetupAgoraClient());
    const [localStream, setLocalStream] = useState(createLocalStreamAndInit(user.userId));
    const [remoteStreams, setRemoteStreams] = useState( []);

    return (
        <AgoraContext.Provider value={{remoteStreams}}>
            {children}
        </AgoraContext.Provider>
    );
};
import React, { createContext, useState, useContext } from 'react';
import AgoraRTC from "agora-rtc-sdk";
import {AuthenticationContext} from "./AuthenticationContext";

let agoraLocalStream = null;

export const agoraClient = AgoraRTC.createClient({ mode: "live", codec: "h264" });
export const AgoraContext = createContext();

export const AgoraContextProvider = function({children}) {
    const {user} = useContext(AuthenticationContext);
    if(user && !agoraLocalStream){
        agoraLocalStream = AgoraRTC.createStream({streamID: user.userId, audio: true, video: false, screen: false});
    }
    const [localStream, setLocalStream] = useState(user ? agoraLocalStream : null);
    const [remoteStreams, setRemoteStreams] = useState( []);
    const [agoraError, setAgoraError] = useState(null);
    const [localStreamInitialized, setLocalStreamInitialized] = useState(false);
    const [clientInitialized, setClientInitialized] = useState(false);
    const [listenersAdded, setListenersAdded] = useState(false);
    if (!agoraError && localStream && !localStreamInitialized) {
        //Init the local stream
        localStream.init( _ => {
            //Request access to microphone
            console.log("getUserMedia successfully");
            setLocalStreamInitialized(true);
        }, function (err) {
            console.log("getUserMedia failed", err);
            setAgoraError(err);
        });
    }

    //Init the client
    if (!agoraError && !clientInitialized) {
        agoraClient.init(process.env.REACT_APP_AGORA_APP_ID, function () {
            console.log("AgoraRTC client initialized");
            setClientInitialized(true);
        }, function (err) {
            console.log("AgoraRTC client init failed", err);
            setAgoraError(err);
        });
    }
    return (
        <AgoraContext.Provider value={{localStream, remoteStreams, setRemoteStreams, agoraError, setAgoraError, listenersAdded, setListenersAdded}}>
            {children}
        </AgoraContext.Provider>
    );
};
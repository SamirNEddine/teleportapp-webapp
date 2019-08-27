import React, { createContext, useState, useContext, useEffect } from 'react';
import AgoraRTC from "agora-rtc-sdk";
import {AuthenticationContext} from "./AuthenticationContext";

export const agoraClient = AgoraRTC.createClient({ mode: "live", codec: "h264" });
export const AgoraContext = createContext();

export const AgoraContextProvider = function({children}) {
    const {user} = useContext(AuthenticationContext);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState( []);
    const [agoraError, setAgoraError] = useState(null);
    const [localStreamInitialized, setLocalStreamInitialized] = useState(false);
    const [clientInitialized, setClientInitialized] = useState(false);
    const [listenersAdded, setListenersAdded] = useState(false);

    useEffect(_ => {
        if (!localStream && user){
            setLocalStream(AgoraRTC.createStream({streamID: user.userId, audio: true, video: false, screen: false}));
        }
        if(localStream && !localStreamInitialized){
            localStream.init( _ => {
                //Request access to microphone
                console.log("getUserMedia successfully");
                setLocalStreamInitialized(true);
                setAgoraError(null);
            }, function (err) {
                console.log("getUserMedia failed", err);
                setAgoraError(err);
            });
        }

        if(!clientInitialized){
            agoraClient.init(process.env.REACT_APP_AGORA_APP_ID, function () {
                console.log("AgoraRTC client initialized");
                setClientInitialized(true);
                setAgoraError(null);
            }, function (err) {
                console.log("AgoraRTC client init failed", err);
                setAgoraError(err);
            });
        }
    });

    return (
        <AgoraContext.Provider value={{localStream, remoteStreams, setRemoteStreams, agoraError, setAgoraError, listenersAdded, setListenersAdded}}>
            {children}
        </AgoraContext.Provider>
    );
};
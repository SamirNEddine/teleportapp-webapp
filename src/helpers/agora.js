import AgoraRTC from "agora-rtc-sdk";


export const createLocalStream = function(streamId){
    return AgoraRTC.createStream({
        streamID: streamId,
        audio: true,
        video: false,
        screen: false
    })
};

export const createAgoraClient = function(){
    AgoraRTC.createClient({ mode: "live", codec: "h264" });
};
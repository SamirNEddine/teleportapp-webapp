import AgoraRTC from "agora-rtc-sdk";

let stream = null;
let client = null;

export const createLocalStream = function(streamId){
    if (!stream){
        stream = AgoraRTC.createStream({
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
    }
    return stream;
};

export const createAgoraClient = function(){
    if (!client){
        client = AgoraRTC.createClient({ mode: "live", codec: "h264" });
        client.init("7dea5406fe56495c95e5f9fe17c6fbbb", function () {
            console.log("AgoraRTC client initialized");

        }, function (err) {
            console.log("AgoraRTC client init failed", err);
        });

        client.on('stream-published', function (evt) {
            console.log("Publish local stream successfully");
        });

        client.on('stream-added', function (evt) {
            const theStream = evt.stream;
            console.log("New stream added: " + theStream.getId());

            client.subscribe(theStream, function (err) {
                console.log("Subscribe stream failed", err);
            });
        });
        client.on('stream-subscribed', function (evt) {
            const remoteStream = evt.stream;
            console.log("Subscribe remote stream successfully: " + remoteStream.getId());
            remoteStream.play('audio-stream');
        })
    }
    return client;
};

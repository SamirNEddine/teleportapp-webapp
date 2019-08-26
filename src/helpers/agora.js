import AgoraRTC from "agora-rtc-sdk";
import { getLocalUser } from "./localStorage";

const localStream = AgoraRTC.createStream({
    streamID: getLocalUser().userId,
    audio: true,
    video: false,
    screen: false
});

localStream.init( _ => {
    //Request access to microphone
    console.log("getUserMedia successfully");
}, e => {
    console.log("getUserMedia failed", e);
});

export const client = AgoraRTC.createClient({ mode: "live", codec: "h264" });
//Init Client
client.init(process.env.REACT_APP_AGORA_APP_ID, function () {
    console.log("AgoraRTC client initialized");
}, function (err) {
    console.log("AgoraRTC client init failed", err);
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
    });
});
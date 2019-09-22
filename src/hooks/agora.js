import { useState, useEffect } from 'react';
import AgoraRTC from "agora-rtc-sdk";
import { useQuery } from "@apollo/react-hooks";
import {GET_AGORA_TOKEN} from "../graphql/queries";

export const AgoraEvents = {
    INIT_LOCAL_STREAM: 'INIT_LOCAL_STREAM',
    GET_AGORA_TOKEN: 'GET_AGORA_TOKEN',
    JOIN_CHANNEL: 'JOIN_CHANNEL',
    REMOTE_STREAM_RECEIVED: 'REMOTE_STREAM_RECEIVED',
    REMOTE_STREAM_REMOVED: 'REMOTE_STREAM_REMOVED',
    REMOTE_STREAM_SUBSCRIBED: 'REMOTE_STREAM_SUBSCRIBED'
};

export const AgoraActions = {
    MUTE_AUDIO: 'MUTE_AUDIO',
    UNMUTE_AUDIO: 'UNMUTE_AUDIO'
};

export function useAgora(authState, channel) {
    const [agoraError, setAgoraError] = useState(null);
    const [event, setEvent] = useState(null);
    const [client, setClient] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [eventData, setEventData] = useState(null);
    useEffect( () => {
        if (!authState.error && authState.user && !client){
            //Create client and stream
            setClient(AgoraRTC.createClient({ mode: "rtc", codec: "h264" }));
            setLocalStream(AgoraRTC.createStream({streamID: authState.user.id, audio: true, video: false, screen: false}));
            setConfigured(false);
        }else if (!authState.user && client){
            localStream.stop();
            setLocalStream(null);
            setClient(null);
        }
    }, [authState, client, localStream, agoraError, eventData]);

    const [configured, setConfigured] = useState(false);
    useEffect( () => {
        if(client && !configured){
            //Init the client
            client.init(process.env.REACT_APP_AGORA_APP_ID, function () {
                console.debug('AgoraRTC client initialized');
            }, function (err) {
                console.debug('AgoraRTC client init failed', err);
                setAgoraError(err);
            });
            //Init the local stream to have access to microphone
            localStream.init( _ => {
                console.log('Access to microphone successful');
                setEvent(AgoraEvents.INIT_LOCAL_STREAM);
                setEventData({localStream});
                //Muted by default
                localStream.muteAudio()
            }, function (err) {
                console.log('Access to microphone failed:', err);
                setEvent(AgoraEvents.INIT_LOCAL_STREAM);
                setAgoraError(err);
            });
            //Setup listeners
            //Remote stream received: A new contact added to the conversation.
            console.debug('Configuring Agora client and local stream');
            client.on('stream-added', evt => {
                const stream = evt.stream;
                console.debug(`New stream received for contact id: ${stream.getId()}`);
                setEventData({receivedStream: stream});
                setEvent(AgoraEvents.REMOTE_STREAM_RECEIVED);
                client.subscribe(stream, function (err) {
                    console.debug(`Failed to subscribe for stream changes for contact ${stream.getId()}. Error: ${err}`);
                    //Todo: Decide what to do in this case
                });
            });
            //Subscribe to streams changes
            client.on('stream-subscribed', evt => {
                console.debug(`Subscribed to stream changes for contact ${evt.stream.getId()}`);
                setEvent(AgoraEvents.REMOTE_STREAM_SUBSCRIBED);
            });
            //Listen for remove and leave events
            client.on('stream-removed', evt => {
                console.debug(`Remote stream for contact ${evt.stream.getId()} removed`);
                evt.stream.stop();
                setEventData({removedStream: evt.stream});
                setEvent(AgoraEvents.REMOTE_STREAM_REMOVED);
            });
            client.on('peer-leave', evt => {
                console.debug(`Contact ${evt.stream.getId()} left. (peer-left event)`);
                setEventData({removedStream: evt.stream});
                setEvent(AgoraEvents.REMOTE_STREAM_REMOVED);
            });
            setConfigured(true);
        }else if(!authState.user){
            setConfigured(false);
        }

    }, [configured, client, localStream, authState.user]);

    const [channelJoined, setChannelJoined] = useState(false);
    const {loading, error, data, refetch } = useQuery(GET_AGORA_TOKEN, {
        variables: {channel},
        skip: !channel
    });
    useEffect( () => {
        if (channel && !channelJoined) {
            if (error) {
                setEvent(GET_AGORA_TOKEN);
                setAgoraError(error);
            } else if (!loading) {
                if (!data) {
                    console.debug(`Joining channel: ${channel}`);
                    console.debug('Get a new Agora token from server');
                    refetch()
                } else {
                    const {userAgoraToken} = data;
                    console.debug(`New agora token received: ${userAgoraToken} to join channel ${channel}`);
                    client.join(userAgoraToken, channel, authState.user.id, (userId) => {
                        console.debug(`Channel ${channel} joined`);
                        setEvent(AgoraEvents.JOIN_CHANNEL);
                        setChannelJoined(true);
                        console.debug('Publishing local stream');
                        client.publish(localStream, err => {
                            console.log(`Failed to publish local stream for channel ${channel}. Error: ${err}`);
                            setAgoraError(err);
                            setEvent(AgoraEvents.JOIN_CHANNEL);
                        });
                    }, function(err) {
                        console.log(`Failed to join channel ${channel}. Error: ${err}`);
                        setAgoraError(err);
                        setEvent(AgoraEvents.JOIN_CHANNEL);
                    });
                }
            }
        }else if (!channel && channelJoined){
            //Leave channel
            console.debug(`Leaving current channel`);
            client.leave();
            setChannelJoined(false);
            setEvent(null);
        }
    }, [channel, channelJoined, loading, error, data, refetch, authState.user, client, localStream]);

    const performAction = (action, actionData) => {
        if(configured){
            switch (action) {
                case AgoraActions.MUTE_AUDIO:
                    localStream.muteAudio();
                    break;
                case AgoraActions.UNMUTE_AUDIO:
                    localStream.unmuteAudio();
                    break;
                default:
                    break;
            }
        }
    };

    return [agoraError, event, eventData, performAction];
}
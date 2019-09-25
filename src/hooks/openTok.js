import { useState, useEffect, useCallback } from 'react';
import OT from '@opentok/client'
import { useApolloClient } from "@apollo/react-hooks";
import {GET_OPENTOK_TOKEN} from "../graphql/queries";

export const OpenTokEvents = {
    MICROPHONE_ACCESS: 'MICROPHONE_ACCESS',
    INIT_PUBLISHER: 'INIT_PUBLISHER',
    SESSION_INITIALIZED: 'SESSION_INITIALIZED',
    SESSION_JOINED: 'SESSION_JOINED',
    REMOTE_STREAM_RECEIVED: 'REMOTE_STREAM_RECEIVED',
    REMOTE_STREAM_SUBSCRIBED: 'REMOTE_STREAM_SUBSCRIBED',
    REMOTE_STREAM_REMOVED: 'REMOTE_STREAM_REMOVED'
};

export const OpenTokActions = {
    MUTE_AUDIO: 'MUTE_AUDIO',
    UNMUTE_AUDIO: 'UNMUTE_AUDIO'
};

export function useOpenTok(authState, sessionId) {
    const apolloClient = useApolloClient();
    const [event, setEvent] = useState(null);
    const [eventData, setEventData] = useState(null);

    const [openTokError, setOpenTokError] = useState(null);
    const [publisher, setPublisher] = useState(null);
    const [session, setSession] = useState(null);

    const [microphoneAllowed, setMicrophoneAllowed] = useState(false);
    useEffect( () => {
        if(authState.user && !microphoneAllowed){
            const options = {publishAudio:false, insertDefaultUI:false};
            const accessPublisher = OT.initPublisher(null, options, function (err) {
                if(err){
                    console.error('Unable to setup voice plateform:', err);
                }else{
                    console.debug('Voice platform ready');
                }
            });
            accessPublisher.on('accessDialogOpened', function () {
                console.debug('Requesting access to microphone');
            });
            accessPublisher.on('accessAllowed', function () {
                console.debug('Access to microphone allowed');
                setMicrophoneAllowed(true);
                setEvent(OpenTokEvents.MICROPHONE_ACCESS);
                setEventData({access:'allowed'});
                setTimeout( function () {
                    accessPublisher.destroy();
                }, 50);
            });
            accessPublisher.on('accessDenied', function () {
                console.debug('Access to microphone denied');
                setEvent(OpenTokEvents.MICROPHONE_ACCESS);
                setEventData({access:'denied'});
                accessPublisher.destroy();
            });
        }
    }, [authState, microphoneAllowed]);

    useEffect( () => {
        if(authState.user && sessionId && !publisher){
            const options = {videoSource: null, name: authState.user.id, publishAudio:false, insertDefaultUI:false};
            const newPublisher = OT.initPublisher(null, options, function (err) {
               if(err){
                   setOpenTokError(err);
                   setPublisher(null);
               }else{
                   console.debug('Publisher initialized.');
               }
           });
           setPublisher(newPublisher);
           setEvent(OpenTokEvents.INIT_PUBLISHER);
        }
    }, [authState, sessionId, session, publisher]);

    useEffect( () => {
        if(!openTokError && publisher && !session){
            console.debug(`Creating new session ${sessionId}`);
            const newSession = OT.initSession(process.env.REACT_APP_OPENTOK_API_KEY, sessionId);
            //Setup listeners
            newSession.on('streamCreated', function(event) {
                console.debug('EVENT :', event, event.stream);
                setEvent(OpenTokEvents.REMOTE_STREAM_RECEIVED);
                setEventData({receivedStream: event.stream});
                console.debug(`New stream received ${event.stream.name}`);
                console.debug(`Subscribing to stream ${event.stream.name}`);
                newSession.subscribe(event.stream, null, {insertDefaultUI:false}, function(err){
                    setEvent(OpenTokEvents.REMOTE_STREAM_SUBSCRIBED);
                    setEventData(null);
                    if(err){
                        console.debug(`Failed to subscribe to stream ${event.stream.name}`);
                    }else{
                        console.debug(`Successfully subscribed to stream ${event.stream.name}`);
                    }
                });
            });
            newSession.on('streamDestroyed', function(event) {
                setEventData({removedStream: event.stream});
                setEvent(OpenTokEvents.REMOTE_STREAM_REMOVED);
            });
            setSession(newSession);
            setEvent(OpenTokEvents.SESSION_INITIALIZED);
        }else if (!sessionId && session){
            console.debug(`Leaving current session`);
            session.unpublish(publisher);
            session.disconnect();
            setPublisher(null);
            setSession(null);
            setEvent(null);
            setEventData(null);
            setOpenTokError(null);
        }
    }, [sessionId, session, openTokError, publisher]);

    useEffect( () => {
        const getOpenTokToken = async function(sessionID) {
            const {error, data} = await apolloClient.query({query: GET_OPENTOK_TOKEN, variables:{sessionId: sessionID}, fetchPolicy: 'no-cache'});
            if(!error){
                const {userOpenTalkToken} = data;
                console.debug(`Joining session ${sessionId} using token ${userOpenTalkToken}`);
                session.connect(userOpenTalkToken, function(err) {
                    setEvent(OpenTokEvents.SESSION_JOINED);
                    if(err){
                        console.debug(`Failed to join session ${sessionId} using ${userOpenTalkToken}`);
                    }else{
                        console.debug(`Session ${sessionId} joined. Publishing.`);
                        session.publish(publisher, function(err){
                            if(err){
                                console.debug(`Failed to join session ${sessionId} using token ${userOpenTalkToken}. Error: ${err}`)
                            }else{
                                console.debug('Published successfully');
                            }
                        }).on("streamDestroyed", function(event) {
                            console.log("Publisher stopped streaming.");
                        });
                    }
                });
            }else{
                setOpenTokError(error);
            }

        };
        if (sessionId && publisher && session) {
            console.debug(`Get token to join session ${sessionId}`);
            getOpenTokToken(sessionId);
        }
    },[sessionId, session, publisher, apolloClient]);

    const performAction = useCallback((action, actionData) => {
        if(publisher && sessionId){
            console.log(`Performing action: ${action} with data: ${actionData}`);
            switch (action) {
                case OpenTokActions.MUTE_AUDIO:
                    publisher.publishAudio(false);
                    break;
                case OpenTokActions.UNMUTE_AUDIO:
                    publisher.publishAudio(true);
                    break;
                default:
                    break;
            }
        }
    }, [publisher, sessionId]);

    return [openTokError, event, eventData, performAction];
}
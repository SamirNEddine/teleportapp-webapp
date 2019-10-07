import { useState, useEffect, useCallback } from 'react';
import OT from '@opentok/client'
import { useApolloClient } from "@apollo/react-hooks";
import {GET_OPENTOK_TOKEN} from "../graphql/queries";

export const OpenTokEvents = {
    INIT_PUBLISHER: 'INIT_PUBLISHER',
    SESSION_INITIALIZED: 'SESSION_INITIALIZED',
    SESSION_JOINED: 'SESSION_JOINED',
    REMOTE_STREAM_RECEIVED: 'REMOTE_STREAM_RECEIVED',
    REMOTE_STREAM_SUBSCRIBED: 'REMOTE_STREAM_SUBSCRIBED',
    REMOTE_STREAM_REMOVED: 'REMOTE_STREAM_REMOVED',
    CONTACT_IS_SPEAKING: 'CONTACT_IS_SPEAKING',
    CONTACT_STOPPED_SPEAKING: 'CONTACT_STOPPED_SPEAKING'
};

export const OpenTokActions = {
    MUTE_AUDIO: 'MUTE_AUDIO',
    UNMUTE_AUDIO: 'UNMUTE_AUDIO'
};

export function useOpenTok(authState, sessionId) {
    const apolloClient = useApolloClient();
    const [event, setEvent] = useState(null);

    const [openTokError, setOpenTokError] = useState(null);
    const [publisher, setPublisher] = useState(null);
    const [session, setSession] = useState(null);

    const SpeakerDetection = useCallback(function(subscriber, startTalking, stopTalking) {
        let activity = null;
        subscriber.on('audioLevelUpdated', function(event) {
            const now = Date.now();
            if (event.audioLevel > 0.2) {
                if (!activity) {
                    activity = {timestamp: now, talking: false};
                } else if (activity.talking) {
                    activity.timestamp = now;
                } else if (now- activity.timestamp > 1000) {
                    // detected audio activity for more than 1s
                    // for the first time.
                    activity.talking = true;
                    if (typeof(startTalking) === 'function') {
                        startTalking(event.audioLevel);
                    }
                }
            } else if (activity && now - activity.timestamp > 3000) {
                // detected low audio activity for more than 3s
                if (activity.talking) {
                    if (typeof(stopTalking) === 'function') {
                        stopTalking();
                    }
                }
                activity = null;
            }
        });
    }, []);

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
            setEvent({event: OpenTokEvents.INIT_PUBLISHER});
        }
    }, [authState.user, sessionId, session, publisher]);

    useEffect( () => {
        if(!openTokError && publisher && !session){
            console.debug(`Creating new session ${sessionId}`);
            const newSession = OT.initSession(process.env.REACT_APP_OPENTOK_API_KEY, sessionId);
            //Setup listeners
            newSession.on('streamCreated', function(event) {
                console.debug('EVENT :', event, event.stream);
                setEvent({event: OpenTokEvents.REMOTE_STREAM_RECEIVED, eventData: {receivedStream: event.stream}});
                console.debug(`New stream received ${event.stream.name}`);
                console.debug(`Subscribing to stream ${event.stream.name}`);
                const subscriber = newSession.subscribe(event.stream, null, {insertDefaultUI:false}, function(err){
                    setEvent({event: OpenTokEvents.REMOTE_STREAM_SUBSCRIBED});
                    if(err){
                        console.debug(`Failed to subscribe to stream ${event.stream.name}`);
                    }else{
                        console.debug(`Successfully subscribed to stream ${event.stream.name}`);
                        SpeakerDetection(subscriber, function(audioLevel) {
                            console.log(event.stream.name, 'started talking');
                            setEvent({event: OpenTokEvents.CONTACT_IS_SPEAKING, eventData: {contactId: event.stream.name, audioLevel}});
                        }, function() {
                            console.log(event.stream.name, 'stopped talking');
                            setEvent({event: OpenTokEvents.CONTACT_STOPPED_SPEAKING, eventData: {contactId: event.stream.name}});
                        });
                    }
                });
            });
            newSession.on('streamDestroyed', function(event) {
                setEvent({event: OpenTokEvents.REMOTE_STREAM_REMOVED, eventData: {removedStream: event.stream}});
            });
            setSession(newSession);
            setEvent({event: OpenTokEvents.SESSION_INITIALIZED});
        }else if (!sessionId && session){
            console.debug(`Leaving current session`);
            session.unpublish(publisher);
            session.disconnect();
            setPublisher(null);
            setSession(null);
            setEvent(null);
            setOpenTokError(null);
        }
    }, [sessionId, session, openTokError, publisher, SpeakerDetection]);

    useEffect( () => {
        const getOpenTokToken = async function(sessionID) {
            const {error, data} = await apolloClient.query({query: GET_OPENTOK_TOKEN, variables:{sessionId: sessionID}, fetchPolicy: 'no-cache'});
            if(!error){
                const {userOpenTalkToken} = data;
                console.debug(`Joining session ${sessionId} using token ${userOpenTalkToken}`);
                session.connect(userOpenTalkToken, function(err) {
                    setEvent({event: OpenTokEvents.SESSION_JOINED});
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

    return [openTokError, event, performAction];
}
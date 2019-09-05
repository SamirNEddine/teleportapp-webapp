import { useState, useEffect } from 'react';
import OT from '@opentok/client'
import { useQuery } from "@apollo/react-hooks";
import { GET_OPENTOK_TOKEN } from "../graphql/queries";

export const OpenTokEvents = {
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
    const [event, setEvent] = useState(null);
    const [eventData, setEventData] = useState(null);

    const [openTokError, setOpenTokError] = useState(null);
    const [publisher, setPublisher] = useState(null);
    useEffect( () => {
        if(authState.user && !publisher){
            const options = {videoSource: null, name: authState.user.id, publishAudio:false};
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
    }, [authState, publisher]);

    const [session, setSession] = useState(null);
    const {loading, error, data, refetch} = useQuery(GET_OPENTOK_TOKEN, {
        variables: {sessionId},
        skip: !sessionId
    });
    useEffect( () => {
        if (!loading && !error && data){
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
                    });
                }
            });

        }else if (error){
            setOpenTokError(error);
        }
    },[loading, error, data, session, publisher, sessionId]);

    useEffect( () => {
        if(sessionId && !openTokError && publisher && !session){
            const newSession = OT.initSession(process.env.REACT_APP_OPENTOK_API_KEY, sessionId);
            //Setup listeners
            newSession.on('streamCreated', function(event) {
                console.debug('EVENT :', event, event.stream);
                setEvent(OpenTokEvents.REMOTE_STREAM_RECEIVED);
                setEventData({receivedStream: event.stream});
                console.debug(`New stream received ${event.stream.name}`);
                console.debug(`Subscribing to stream ${event.stream.name}`);
                newSession.subscribe(event.stream, null, null, function(err){
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
            console.debug(`Get token to join session ${sessionId}`);
            refetch();
        }else if (!sessionId && session){
            console.debug(`Leaving current session`);
            session.disconnect();
            setSession(null);
            setEvent(null);
            setEventData(null);
            setOpenTokError(null);
            publisher.publishAudio(false);
        }
    }, [sessionId, session, openTokError, publisher, refetch]);

    const performAction = (action, actionData) => {
        if(publisher){
            console.log(`Performing action: ${action} with data: ${actionData}`);
            switch (action) {
                case OpenTokActions.MUTE_AUDIO:
                    publisher.publishAudio(false);
                    break;
                case OpenTokActions.UNMUTE_AUDIO:
                    publisher.publishAudio(true);
                    break;
            }
        }
    };

    return [openTokError, event, eventData, performAction];
}
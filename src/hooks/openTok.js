import { useState, useEffect } from 'react';
import OT from '@opentok/client'
import { useApolloClient } from "@apollo/react-hooks";
import {GET_OPENTOK_TOKEN, GET_USER} from "../graphql/queries";

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
    const apolloClient = useApolloClient();
    const [event, setEvent] = useState(null);
    const [eventData, setEventData] = useState(null);

    const [openTokError, setOpenTokError] = useState(null);
    const [publisher, setPublisher] = useState(null);
    useEffect( () => {
        if(authState.user && !publisher){
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
    }, [authState, publisher]);

    const [session, setSession] = useState(null);
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
                            event.preventDefault();
                            console.log("Publisher stopped streaming.");
                        });
                    }
                });
            }else{
                setOpenTokError(error);
            }

        };
        if (sessionId && session) {
            console.debug(`Get token to join session ${sessionId}`);
            getOpenTokToken(sessionId);
        }
    },[session, publisher, sessionId]);

    useEffect( () => {
        if(sessionId && !openTokError && publisher && !session){
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
            setSession(null);
            setEvent(null);
            setEventData(null);
            setOpenTokError(null);
        }
    }, [sessionId, session, openTokError, publisher]);

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
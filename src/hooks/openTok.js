import { useState, useEffect } from 'react';
import OT from '@opentok/session'
import { useQuery } from "@apollo/react-hooks";
import { GET_OPENTOK_TOKEN } from "../graphql/queries";

export const OpenTokEvents = {
    INIT_PUBLISHER: 'INIT_PUBLISHER',
    SESSION_INITIALIZED: 'SESSION_INITIALIZED',
    SESSION_JOINED: 'SESSION_JOINED',
    REMOTE_STREAM_RECEIVED: 'REMOTE_STREAM_RECEIVED'
};

export function useOpenTok(authState, sessionId) {
    const [event, setEvent] = useState(null);
    const [eventData, setEventData] = useState(null);

    const [openTokError, setOpenTokError] = useState(null);
    const [publisher, setPublisher] = useState(null);
    useEffect( () => {
        if(authState.user && !publisher){
            const options = {videoSource: null, name: authState.user.id};
            const newPublisher = OT.initPublisher(null, options, function (err) {
               if(err){
                   setOpenTokError(err);
                   setPublisher(null);
               }else{
                   console.debug('Publisher initialized.');
               }
           });
           setPublisher(newPublisher);
           setEventData(OpenTokEvents.INIT_PUBLISHER);
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
    },[loading, error, data, session, publisher]);

    useEffect( () => {
        if(sessionId && !openTokError && publisher && !session){
            const newSession = OT.initSession(process.env.REACT_APP_OPENTOK_API_KEY, sessionId);
            //Setup listeners
            session.on('streamCreated', function(event) {
                setEvent(OpenTokEvents.REMOTE_STREAM_RECEIVED);
                setEventData({receivedStream: event.stream});
                console.debug(`New stream received ${event.stream.name}`);
                console.debug(`Subscribing to stream ${event.stream.name}`);
                session.subscribe(event.stream, null, null, function(err){
                    if(err){
                        console.debug(`Failed to subscribe to stream ${event.stream.name}`);
                    }else{
                        console.debug(`Successfully subscribed to stream ${event.stream.name}`);
                    }
                });
            });
            setSession(newSession);
            setEvent(OpenTokEvents.SESSION_INITIALIZED);
            console.debug(`Get token to join session ${sessionId}`);
            refetch();
        }
    }, [sessionId, session, openTokError, publisher, refetch]);

    return [openTokError, event, eventData];
}
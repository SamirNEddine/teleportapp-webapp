import { useState, useEffect, useCallback } from 'react';
import { useApolloClient } from '@apollo/react-hooks';
import Voxeet from '@voxeet/voxeet-web-sdk';
import { GET_VOXEET_TOKEN, REFRESH_VOXEET_TOKEN } from '../graphql/queries';
import {OpenTokActions} from "./openTok";

export const VoxeetEvents = {
    INIT_VOXEET: 'INIT_VOXEET',
    SESSION_INITIALIZED: 'SESSION_INITIALIZED',
    SESSION_JOINED: 'SESSION_JOINED',
    REMOTE_STREAM_RECEIVED: 'REMOTE_STREAM_RECEIVED',
    REMOTE_STREAM_SUBSCRIBED: 'REMOTE_STREAM_SUBSCRIBED',
    REMOTE_STREAM_REMOVED: 'REMOTE_STREAM_REMOVED'
};

export const VoxeetActions = {
    MUTE_AUDIO: 'MUTE_AUDIO',
    UNMUTE_AUDIO: 'UNMUTE_AUDIO'
};

export function useVoxeet(authState, conferenceAlias) {
    const apolloClient = useApolloClient();
    const [event, setEvent] = useState(null);
    const [eventData, setEventData] = useState(null);

    const [voxeetError, setVoxeetError] = useState(null);
    const [voxeet, setVoxeet] = useState(null);

    useEffect( async () => {
        if(authState.user && !voxeet){
            const {error, data} = await apolloClient.query({query: GET_VOXEET_TOKEN, fetchPolicy: 'no-cache'});
            if(!error){
                try{
                    const {accessToken, refreshToken} = data;
                    const voxeet = new Voxeet();
                    await voxeet.initializeToken(accessToken, {externalId: authState.user.id}, _ => {
                        return new Promise( async (resolve, reject) => {
                            const {error, data} = await apolloClient.query({query: REFRESH_VOXEET_TOKEN, variables:{refreshToken: refreshToken}, fetchPolicy: 'no-cache'});
                            if(!error){
                                resolve(data.refreshUserVoxeetAccessToken);
                            }else{
                                reject(error);
                            }
                        });
                    });
                    setVoxeet(voxeet);
                    setEvent(Voxeet.INIT_LOCAL_STREAM);
                    setEventData({accessToken, refreshToken});
                }catch (e) {
                    console.error(`VOXEET ERROR: ${e}`);
                    setVoxeetError(e);
                }
            }else{
                setVoxeetError(error);
            }
        }
    }, [authState, voxeet]);


    const performAction = useCallback((action, actionData) => {
    }, []);

    return [voxeetError, event, eventData, performAction];
}
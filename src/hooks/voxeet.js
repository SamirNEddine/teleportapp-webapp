import { useState, useEffect, useCallback } from 'react';
import { useApolloClient } from '@apollo/react-hooks';
import Voxeet from '@voxeet/voxeet-web-sdk';
import { GET_VOXEET_TOKEN, REFRESH_VOXEET_TOKEN } from '../graphql/queries';

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
    useEffect( () => {
        //Events setup
        if(voxeet){
            voxeet.on('conferenceJoined', (conferenceInfo) => {
                console.debug(`Successfully joined conference ${conferenceInfo.conferenceAlias}.`);
            })
        }
    }, [voxeet]);

    useEffect( () => {
        async function initVoxeet() {
            const {error, data} = await apolloClient.query({query: GET_VOXEET_TOKEN, fetchPolicy: 'no-cache'});
            if(!error){
                try{
                    const {accessToken, refreshToken} = data;
                    const voxeetSDK = new Voxeet();
                    //Initialize
                    console.debug('Initializing VOXEET');
                    await voxeetSDK.initializeToken(accessToken, {externalId: authState.user.id}, _ => {
                        return new Promise( async (resolve, reject) => {
                            console.debug('Refreshing VOXEET accessToken.');
                            const {error, data} = await apolloClient.query({query: REFRESH_VOXEET_TOKEN, variables:{refreshToken: refreshToken}, fetchPolicy: 'no-cache'});
                            if(!error){
                                console.debug('VOXEET accessToken refreshed.');
                                resolve(data.refreshUserVoxeetAccessToken);
                            }else{
                                reject(error);
                            }
                        });
                    });
                    console.debug('VOXEET Initialized.');
                    setVoxeet(voxeetSDK);
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

        if(authState.user && !voxeet){
            initVoxeet();
        }
    }, [authState, voxeet, apolloClient]);

    const[conferenceInfo, setConferenceInfo] = useState(null);
    useEffect(  () => {
        async function joinConference(conferenceId) {
            //Create and join a conference
            try{
                console.debug(`Joining conference ${conferenceAlias}.`);
                const constraints = {audio: true, video: false};
                const info = await voxeet.joinConference(conferenceAlias, {constraints});
                setConferenceInfo(info);
            }catch(e){
                console.error(`VOXEET ERROR: ${e}`);
                setVoxeetError(e);
            }
        }
        async function leaveCurrentConference() {
            //Leave current conference
            try{
                await voxeet.leaveConference();
            }catch(e){
                console.error(`VOXEET ERROR: ${e}`);
                setVoxeetError(e);
            }
        }
        if(conferenceAlias && voxeet){
            joinConference(conferenceAlias);
        }else if(!conferenceAlias && conferenceInfo){
            leaveCurrentConference();
        }
    }, [conferenceAlias, conferenceInfo, voxeet]);


    const performAction = useCallback((action, actionData) => {
    }, []);

    return [voxeetError, event, eventData, performAction];
}
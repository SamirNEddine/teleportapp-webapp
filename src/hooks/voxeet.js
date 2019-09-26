import { useState, useEffect, useCallback } from 'react';
import { useApolloClient } from '@apollo/react-hooks';
import Voxeet from '@voxeet/voxeet-web-sdk';
import { GET_VOXEET_TOKEN, REFRESH_VOXEET_TOKEN } from '../graphql/queries';
import {OpenTokActions} from "./openTok";

export const VoxeetEvents = {
    INIT_VOXEET: 'INIT_VOXEET',
    JOINING_CONVERSATION: 'JOINING_CONVERSATION',
    CONFERENCE_JOINED: 'CONFERENCE_JOINED',
    CONTACT_JOINED: 'CONTACT_JOINED',
    CONTACT_LEFT: 'CONTACT_LEFT',
    CONVERSATION_LEFT: 'CONVERSATION_LEFT'
};

export const VoxeetActions = {
    MUTE_AUDIO: 'MUTE_AUDIO',
    UNMUTE_AUDIO: 'UNMUTE_AUDIO'
};

export function useVoxeet(authState, conferenceAlias) {
    const apolloClient = useApolloClient();
    const [event, setEvent] = useState(null);

    const [voxeetError, setVoxeetError] = useState(null);
    const [voxeet, setVoxeet] = useState(null);
    const [userIdsMap, setUserIdMap] = useState({});
    const [listenersAdded, setListenersAdded] = useState(false);
    useEffect( () => {
        //Events setup
        if(voxeet && conferenceAlias && !listenersAdded){
            voxeet.on('conferenceJoined', (info) => {
                console.debug(`Successfully joined conference.`);
            });
            voxeet.on('participantAdded', (voxeetUserId, userInfo) => {
                console.debug('Participant added:', voxeetUserId);
                const idsMap = userIdsMap;
                idsMap[voxeetUserId] = Number(userInfo.externalId);
                setUserIdMap(idsMap);
            });
            voxeet.on('participantJoined', (voxeetUserId, stream) => {
                if(voxeetUserId === voxeet.userId) {
                    //Me joining the conference
                    const idsMap = userIdsMap;
                    idsMap[voxeetUserId] = authState.user.id;
                    setUserIdMap(idsMap);
                }else{
                    console.debug(`Participant joined: ${userIdsMap[voxeetUserId]}`);
                    stream.contactId = userIdsMap[voxeetUserId];
                    setEvent({event: VoxeetEvents.CONTACT_JOINED, eventData: {stream}});
                }
            });
            voxeet.on('participantLeft', (voxeetUserId) => {
                if(voxeetUserId !== voxeet.userId) {
                    console.debug(`Participant left: ${userIdsMap[voxeetUserId]}`);
                    const stream = {contactId: userIdsMap[voxeetUserId]};
                    setEvent({event: VoxeetEvents.CONTACT_LEFT, eventData: {stream}});
                }
            });
            setListenersAdded(true);
        }
    }, [voxeet, listenersAdded, userIdsMap, authState.user, conferenceAlias]);

    useEffect( () => {
        async function initVoxeet() {
            const {error, data} = await apolloClient.query({query: GET_VOXEET_TOKEN, fetchPolicy: 'no-cache'});
            if(!error){
                try{
                    const {accessToken, refreshToken} = data.userVoxeetAccessToken;
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
                    setEvent({event: VoxeetEvents.INIT_VOXEET});
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
                console.debug(`Joining conference ${conferenceId}.`);
                setEvent({event: VoxeetEvents.JOINING_CONVERSATION});
                const constraints = {audio: true, video: false};
                const info = await voxeet.joinConference(conferenceId, {constraints});
                voxeet.muteUser(voxeet.userId, true);
                setConferenceInfo(info);
                setEvent({event: VoxeetEvents.CONFERENCE_JOINED});
            }catch(e){
                console.error(`VOXEET ERROR: ${e}`);
                setVoxeetError(e);
            }
        }
        async function leaveCurrentConference() {
            //Leave current conference
            try{
                console.debug(`Leaving current conference`);
                await voxeet.leaveConference();
            }catch(e){
                console.error(`VOXEET ERROR: ${e}`);
                setVoxeetError(e);
            }
        }
        if(conferenceAlias && !conferenceInfo && voxeet){
            joinConference(conferenceAlias);
        }else if(!conferenceAlias && conferenceInfo){
            leaveCurrentConference();
            voxeet.removeAllListeners();
            setListenersAdded(false);
            setUserIdMap({});
            setConferenceInfo(null);
            setEvent({event: VoxeetEvents.CONVERSATION_LEFT})
        }
    }, [conferenceAlias, conferenceInfo, voxeet]);


    const performAction = useCallback((action, actionData) => {
        if(voxeet){
            console.log(`Performing action: ${action} with data: ${actionData}`);
            switch (action) {
                case VoxeetActions.MUTE_AUDIO:
                    voxeet.muteUser(voxeet.userId, true);
                    break;
                case OpenTokActions.UNMUTE_AUDIO:
                    voxeet.muteUser(voxeet.userId, false);
                    break;
                default:
                    break;
            }
        }
    }, [voxeet]);

    return [voxeetError, event, performAction];
}
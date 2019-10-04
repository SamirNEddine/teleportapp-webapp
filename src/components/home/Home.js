import React, { useContext, useState, useEffect } from 'react';
import ContactSelector from '../contacts/ContactSelector';
import { AuthenticationContext } from '../../contexts/AuthenticationContext';
import { useQuery } from '@apollo/react-hooks';
import { GET_RECOMMENDED_CONTACTS } from '../../graphql/queries';
import { STATUS_SOCKET, STATUS_SOCKET_INCOMING_MESSAGES, useSocket } from '../../hooks/socket';

const Home = function ({displayInformationalText}) {
    const {authState} = useContext(AuthenticationContext);

    const [contacts, setContacts] = useState([]);
    const {error, loading, data, refetch} = useQuery(GET_RECOMMENDED_CONTACTS, {
        skip: (!authState.user || authState.error)
    });
    useEffect( () => {
        if (!error && !loading && data){
            setContacts(data.recommendedContacts);
        }
    }, [error, loading, data]);

    const [, message, socketData] = useSocket(authState, STATUS_SOCKET);
    useEffect( () => {
        if (message === STATUS_SOCKET_INCOMING_MESSAGES.STATUS_UPDATE && authState.user){
            //To do: Update locally instead of re-fetching.
            refetch()
        }
    }, [message, socketData, refetch, authState.user]);

    return (
        <ContactSelector contacts={contacts} displayInformationalText={displayInformationalText}/>
    );
};

export default Home;

import React from 'react';
import ContactSelector from '../contacts/ContactSelector';

const Home = function ({contacts, displayInformationalText}) {

    return (
        <ContactSelector contacts={contacts} displayInformationalText={displayInformationalText}/>
    );
};

export default Home;

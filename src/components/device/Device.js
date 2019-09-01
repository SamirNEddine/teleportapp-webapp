import React from 'react';
import ContactList from "../contacts/ContactList";
import './device.css';

const Device = function () {
    const onButtonClick = _ => {
        console.log('Hardware button clicked')
    };
    return (
        <div className="device-container">
            <div className="hardware-button" onClick={onButtonClick}/>
            <ContactList/>
        </div>
    );
};

export default Device;
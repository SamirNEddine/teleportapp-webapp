import React from 'react';

import './device.css';

const DeviceComponent = function ({children, onHardwareButtonClick}) {
    const onButtonClick = _ => {
        if (onHardwareButtonClick) onHardwareButtonClick();
    };
    return (
        <div className="device-container">
            <div className="hardware-button" onClick={onButtonClick}/>
            {children}
        </div>
    );
};

export default DeviceComponent;
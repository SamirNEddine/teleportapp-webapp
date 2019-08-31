import React from 'react';

import './device.css';

const DeviceComponent = function ({children}) {
    return (
        <div className="device-container">
            {children}
        </div>
    );
};

export default DeviceComponent;
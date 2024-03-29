import React, { useState, useEffect } from 'react';

const Unavailable = function () {
    const formatTime = function(i) {
        if (i < 10) i = '0' + i;  // add zero in front of numbers < 10
        return i;
    };
    const formattedCurrentTime = function () {
        const today = new Date();
        const h = formatTime(today.getHours());
        const m = formatTime(today.getMinutes());
        return h + ":" + m;
    };

    const [time, setTime] = useState(formattedCurrentTime());

    useEffect( () => {
        let timer = function () {
            setTime(formattedCurrentTime);
            setTimeout(timer, 60000 - Date.now().getSeconds*1000);
        };
        timer();
        return _ => {
            timer = null;
        }
    });


    return (
        <div className="unavailable-container">
            <div className='unavailable-message'>Unavailable for conversations</div>
            <div className='current-time'>{time}</div>
        </div>
    )
};

export default Unavailable;
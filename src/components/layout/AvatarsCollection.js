import React from 'react';

import './avatarsCollection.css'

const MAX_NUMBER_OF_AVATARS = 7;
const DEGREE_OFFSET = 60;
const DEGREE_PREFIX = "deg";
const STARTING_DEGREE = 30;

const AvatarsCollection = function ({avatars}) {

    const avatarsElements = [];

    for (let i=0; i<MAX_NUMBER_OF_AVATARS && i< avatars.length; i++){
        const avatar = avatars[i];
        const positionClassName = i === 0 ? "center" : DEGREE_PREFIX + String(STARTING_DEGREE + (i-1)*DEGREE_OFFSET);
        const avatarElement = (
            <div className={`avatar-item ${positionClassName} ${avatar.additionalClasses ? avatar.additionalClasses : ''}`}>
                {avatar.component}
            </div>
        );
        avatarsElements.push(avatarElement);
    }

    return (
        <div className='avatars-collection-container'>
            {avatarsElements}
        </div>
    );
};

export default AvatarsCollection;
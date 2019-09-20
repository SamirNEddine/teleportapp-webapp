import React from 'react';

import './avatarsCollection.css'

const MAX_NUMBER_OF_AVATARS = 7;
const DEGREE_OFFSET = 60;
const DEGREE_PREFIX = "deg";
const STARTING_DEGREE = 30;

const positionsConfig = {
    1: ['center'],
    2: ['deg90', 'deg270'],
    3: ['center', 'deg90', 'deg270'],
    4: ['deg30', 'deg150', 'deg330', 'deg210'],
    5: ['center', 'deg30', 'deg150', 'deg330', 'deg210'],
    6: ['deg90', 'deg270', 'deg30', 'deg150', 'deg330', 'deg210'],
    7: ['center', 'deg90', 'deg270', 'deg30', 'deg150', 'deg330', 'deg210']
};

const AvatarsCollection = function ({avatars}) {

    const positionClasses = positionsConfig[avatars.length];
    const avatarsElements = [];
    for (let i=0; i<MAX_NUMBER_OF_AVATARS && i< avatars.length; i++){
        const avatar = avatars[i];
        const positionClassName = positionClasses[i];
        const avatarElement = (
            <div className={`avatar-item ${positionClassName} ${avatar.additionalClasses ? avatar.additionalClasses : ''}`} key={avatar.key}>
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
import React from 'react';

import './avatarsCollection.css'

const MAX_NUMBER_OF_AVATARS = 7;
// const DEGREE_OFFSET = 60;
// const DEGREE_PREFIX = "deg";
// const STARTING_DEGREE = 30;

const positionsConfig = {
    1: ['center'],
    2: ['deg90', 'deg270'],
    3: ['center', 'deg90', 'deg270'],
    4: ['deg30', 'deg150', 'deg330', 'deg210'],
    5: ['center', 'deg30', 'deg150', 'deg330', 'deg210'],
    6: ['deg90', 'deg270', 'deg30', 'deg150', 'deg330', 'deg210'],
    7: ['center', 'deg270', 'deg330', 'deg30', 'deg90', 'deg150', 'deg210']
};

const AvatarsCollection = function ({avatars}) {

    const positionClasses = positionsConfig[MAX_NUMBER_OF_AVATARS];
    const avatarsElements = [];
    for (let i=0; i<MAX_NUMBER_OF_AVATARS; i++){
        const avatar = avatars[i] ? avatars[i] : null;
        const positionClassName = positionClasses[i];
        const avatarElement = (
            <div className={`avatar-item ${positionClassName} ${avatar && avatar.additionalClasses ? avatar.additionalClasses : ''}`} key={avatar ? avatar.key : `default_${i}`}>
                {avatar ? avatar.component : <div className="default-avatar" alt="default"/>}
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
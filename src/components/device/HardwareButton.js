import React from 'react';

//In ms
const SINGLE_PRESS_MAX_TIME = 500;
const DOUBLE_PRESS_MAX_TIME = 300;
const LONG_PRESS_MIN_TIME = 500;
const HardwareButton = function ({onSinglePress, onDoublePress, onLongPress}) {

    const onSinglePressEvent = _ => {
        if(onSinglePress){
            onSinglePress();
        }
    };
    const onDoublePressEvent = _ => {
        if(onDoublePress){
            onDoublePress();
        }
    };
    const onLongPressEvent = _ => {
        if(onLongPress){
            onLongPress();
        }
    };

    let pressTime = null;
    let longPressTimeout = null;
    let clickTimeout = null;
    const onPress = _ => {
        pressTime = new Date();
        if(!clickTimeout){
            longPressTimeout = setTimeout(onLongPressEvent, LONG_PRESS_MIN_TIME);
        }
    };
    const onRelease = _ => {
        const diff = new Date() - pressTime;
        if(clickTimeout || diff < SINGLE_PRESS_MAX_TIME){
            if(clickTimeout){
                clearTimeout(clickTimeout);
                clickTimeout = null;
                onDoublePressEvent();
            }else {
                clickTimeout = setTimeout(onSinglePressEvent, DOUBLE_PRESS_MAX_TIME);
            }
        }
        if(longPressTimeout){
            clearTimeout(longPressTimeout);
            longPressTimeout = null;
        }
        pressTime = null;
    };

    return (
        <div className="hardware-button" onTouchStart={onPress} onMouseDown={onPress} onTouchEnd={onRelease} onMouseUp={onRelease}/>
    )
};

export default HardwareButton;
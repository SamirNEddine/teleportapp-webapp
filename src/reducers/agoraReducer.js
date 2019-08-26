import { Actions } from '../actions/agoraActions'

export const agoraReducer = function (state, action) {
    let newState = null;
    const {type} = action;
    switch (type) {
        default:
            newState = state;
    }
    return newState;
};
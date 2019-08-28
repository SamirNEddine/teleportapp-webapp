import { Actions } from '../actions/authenticationActions'

export const authenticationReducer = function (state, action) {
    console.debug('Action: ', action, '\nSTATE ', state);
    let newState = null;
    const {type} = action;
    switch (type) {
        case Actions.SIGN_IN_SUCCESS:
            const {user} = action;
            newState = user;
            break;
        case Actions.SIGN_IN_ERROR:
            newState = null;
            break;
        default:
            newState = state;
    }
    return newState;
};
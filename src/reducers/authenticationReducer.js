import { Actions } from '../actions/authenticationActions'

export const authenticationReducer = function (state, action) {
    let newState = null;
    const {type} = action;
    switch (type) {
        case Actions.SIGN_IN_SUCCESS:
            const {user} = action;
            newState = {
                user
            };
            break;
        case Actions.SIGN_IN_ERROR:
            newState = {
                user: null
            };
            break;
        default:
            newState = state;
    }
    return newState;
};
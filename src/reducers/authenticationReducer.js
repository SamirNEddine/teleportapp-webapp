import { Actions } from '../actions/authenticationActions'

export const authenticationReducer = function (state, action) {
    let newState = null;
    const {type} = action;
    switch (type) {
        case Actions.SIGN_IN_SUCCESS:
            const {userId, companyId, email} = action.user;
            newState = {
                userId,
                companyId,
                email
            };
            break;
        case Actions.SIGN_IN_ERROR:
            newState = {
                userId: null,
                companyId: null,
                email: null
            };
            break;
        default:
            newState = state;
    }
    return newState;
};
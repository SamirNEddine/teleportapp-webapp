import {clearLocalStorage} from "../helpers/localStorage";

const Actions = {
    SIGN_IN_PENDING: 'SIGN_IN_PENDING',
    SIGN_IN_SUCCESS: 'SIGN_IN_SUCCESS',
    SIGN_IN_ERROR: 'SIGN_IN_ERROR',
    AUTH_ERROR:'AUTH_ERROR',
    LOGOUT:'LOGOUT',
    UPDATE_STATUS: 'UPDATE_STATUS'
};

/** Helpers **/
export function signInPending() {
    return {
        type: Actions.SIGN_IN_PENDING
    }
}
export function signInSuccess(user) {
    return {
        type: Actions.SIGN_IN_SUCCESS,
        user
    }
}
export function signInError(error) {
    return {
        type: Actions.SIGN_IN_ERROR,
        error
    }
}
export function authError(error) {
    return {
        type: Actions.AUTH_ERROR,
        error
    }
}
export function logout() {
    return {
        type: Actions.LOGOUT
    }
}

export function updateStatus(status){
    return {
        type: Actions.UPDATE_STATUS,
        status
    }
}

/** Status **/
export const Status = {
    AVAILABLE: 'available',
    BUSY: 'busy',
    UNAVAILABLE: 'unavailable'
};

export const authenticationReducer = function (state, action) {
    console.debug('Action: ', action, '\nSTATE ', state);
    let newState = null;
    const {type} = action;
    switch (type) {
        case Actions.SIGN_IN_SUCCESS:
            const {user} = action;
            newState = {
                user,
                status: Status.AVAILABLE
            };
            break;
        case Actions.SIGN_IN_ERROR:
        case Actions.AUTH_ERROR:
            const {error} = action;
            newState = {
                error
            };
            break;
        case Actions.LOGOUT:
            clearLocalStorage();
            newState = {
                user: null,
                error: null
            };
            break;
        case Actions.UPDATE_STATUS:
            const {status} = action;
            newState = {
                ...state,
                status
            };
            break;
        default:
            newState = state;
    }
    return newState;
};
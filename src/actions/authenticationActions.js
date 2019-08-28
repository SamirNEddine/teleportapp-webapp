export const Actions = {
    SIGN_IN_PENDING: 'SIGN_IN_PENDING',
    SIGN_IN_SUCCESS: 'SIGN_IN_SUCCESS',
    SIGN_IN_ERROR: 'SIGN_IN_ERROR',
    AUTH_ERROR:'AUTH_ERROR',
    LOGOUT:'LOGOUT'
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
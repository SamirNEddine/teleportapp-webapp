export const Actions = {
    SIGN_IN_PENDING: 'SIGN_IN_PENDING',
    SIGN_IN_SUCCESS: 'SIGN_IN_SUCCESS',
    SIGN_IN_ERROR: 'SIGN_IN_ERROR'
};

/** Sign in actions **/
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
import jwtDecode from 'jwt-decode';

export async function updateLocalUser(userToken){
    const payload =  await jwtDecode(userToken);
    localStorage.user = JSON.stringify(payload.user);
    localStorage.accessToken = userToken;
    return getLocalUser();
}

export function clearLocalStorage(){
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
}

export function getLocalUser(){
    if (!localStorage.accessToken || !localStorage.user) {
        clearLocalStorage();
        return null;
    }else {
        return JSON.parse(localStorage.user);
    }
}

export function getAuthenticationToken(){
    return localStorage.accessToken;
}
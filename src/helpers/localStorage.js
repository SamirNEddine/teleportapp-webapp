import jwtDecode from 'jwt-decode';

export async function updateLocalUser(userToken){
    const payload =  await jwtDecode(userToken);
    localStorage.userId = payload.userId;
    localStorage.companyId = payload.companyId;
    localStorage.email = payload.email;
    localStorage.accessToken = userToken;
    return getLocalUser();
}

export function clearLocalUser(){
    // localStorage.removeItem('userToken');
    // localStorage.removeItem('userId');
    // localStorage.removeItem('userFullName');
}

export function getLocalUser(){
    return {
        userId: localStorage.userId,
        companyId: localStorage.companyId,
        email: localStorage.email
    }
}

export function getAuthenticationToken(){
    return localStorage.accessToken;
}
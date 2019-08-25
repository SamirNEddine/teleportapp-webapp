import jwtDecode from 'jwt-decode';

export async function updateLocalUser(userToken){
    const payload =  await jwtDecode(userToken);
    console.log(payload);
    localStorage.userId = payload.userId;
    localStorage.companyId = payload.companyId;
    localStorage.email = payload.email;
    localStorage.accessToken = userToken;
    return getLocalUser();
}

export function clearLocalStorage(){
    localStorage.removeItem('accessToken');
    localStorage.removeItem('email');
    localStorage.removeItem('companyId');
    localStorage.removeItem('userId');
}

export function getLocalUser(){
    if (!localStorage.accessToken || !localStorage.userId || !localStorage.companyId || !localStorage.email) {
        clearLocalStorage();
        return null;
    }else {
        return {
            userId: localStorage.userId,
            companyId: localStorage.companyId,
            email: localStorage.email
        }
    }
}

export function getAuthenticationToken(){
    return localStorage.accessToken;
}
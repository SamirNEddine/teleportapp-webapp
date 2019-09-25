import openSocket from "socket.io-client";
import { getAuthenticationToken } from "./localStorage";

const sockets = {};

const createSocket = function (url, authenticated) {
    console.debug(`Opening socket: ${url}`);
    return openSocket(url, !authenticated ? null : {
        query: {
            token: `Bearer ${getAuthenticationToken()}`
        }
    }, function(er){
        console.log(er);
    });
};

export const connectSocket = function(baseURL, nameSpace, authenticated){
    const socketURL = `${baseURL}/${nameSpace}`;
    const existingSocket = sockets[socketURL];
    if(existingSocket) {
        return  existingSocket;
    }else{
        const socket = createSocket(socketURL, authenticated);
        sockets[socketURL] = socket;
        return socket;
    }
};

export const disconnectSocket = function(baseURL, nameSpace){
    const socketURL = `${baseURL}/${nameSpace}`;
    console.debug(`Closing socket: ${socketURL}`);
    const socket = sockets[socketURL];
    socket.close();
    delete sockets[socketURL];
};
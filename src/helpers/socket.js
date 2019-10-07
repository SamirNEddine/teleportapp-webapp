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
        let onevent = socket.onevent;
        socket.onevent = function (packet) {
            const args = packet.data || [];
            onevent.call (this, packet);
            packet.data = ["*"].concat(args);
            onevent.call(this, packet);
        };
        socket.on("*",function(event,data) {
            console.log('Incoming socket event', event);
            console.log(data);
        });
        sockets[socketURL] = socket;
        return socket;
    }
};

export const disconnectSocket = function(baseURL, nameSpace){
    const socketURL = `${baseURL}/${nameSpace}`;
    console.debug(`Closing socket: ${socketURL}`);
    const socket = sockets[socketURL];
    if(socket){
        socket.close();
        delete sockets[socketURL];
    }
};
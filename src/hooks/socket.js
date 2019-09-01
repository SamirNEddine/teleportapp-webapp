import { useState, useEffect } from 'react';
import openSocket from "socket.io-client";
import {getAuthenticationToken} from "../helpers/localStorage";

export const STATUS_SOCKET = "status";
export const STATUS_SOCKET_INCOMING_MESSAGES = {
    STATUS_UPDATE: 'status-update'
};
export const STATUS_SOCKET_OUTGOING_MESSAGES = {
    UPDATE_STATUS: 'update-status'
};

export const CONVERSATION_SOCKET = "conversation";
export const CONVERSATION_SOCKET_INCOMING_MESSAGES = {
    JOIN_CONVERSATION: 'join-conversation'
};
export const CONVERSATION_SOCKET_OUTGOING_MESSAGES = {
    ADD_CONTACT: 'add-contact'
};

const socketIncomingMessagesMap = {
    [STATUS_SOCKET]: STATUS_SOCKET_INCOMING_MESSAGES,
    [CONVERSATION_SOCKET]: CONVERSATION_SOCKET_INCOMING_MESSAGES
};

export function useSocket(authState, nameSpace) {
    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState(null);
    const [data, setData] = useState(null);
    const [error] = useState(null);
    useEffect( () => {
        if (authState.user && !socket){
            setSocket(openSocket(`${process.env.REACT_APP_SOCKET_URL}/${nameSpace}`, {
                query: {
                    token: `Bearer ${getAuthenticationToken()}`
                }
            }));
        }else if(authState.user && socket){
            console.debug(`Setup ${nameSpace} socket listeners`);
            //Setup listeners
            const incomingMessages = socketIncomingMessagesMap[nameSpace];
            console.debug(`${nameSpace} socket: incoming messages: ${incomingMessages}`);
            for(let incomingMessageKey in incomingMessages) {
                if (incomingMessages.hasOwnProperty(incomingMessageKey)) {
                    const incomingMessage = incomingMessages[incomingMessageKey];
                    console.debug(`${nameSpace} socket: listening to ${incomingMessage}`);
                    socket.on(incomingMessage, (data) => {
                        console.debug(`Incoming message: ${incomingMessage} on ${nameSpace} socket`);
                        setMessage(incomingMessage);
                        setData(data);
                    });
                }
            }
        }else if (!authState.user && socket){
                console.debug(`Closing ${nameSpace} socket`);
                socket.close();
        }
        return _ => {
            if (socket){
                //Cleaning
                console.debug(`${nameSpace} socket: unsubscribe from all events`);
                for(let key in socketIncomingMessagesMap[nameSpace]) {
                    socket.off(socketIncomingMessagesMap[nameSpace][key]);
                }
            }
        }

    }, [authState.user, nameSpace, socket, message, data, error]);

    const sendMessage = (message, data) => {
        if(socket){
            socket.emit(message, data);
        }
    };

    return [error, message, data, sendMessage];
}
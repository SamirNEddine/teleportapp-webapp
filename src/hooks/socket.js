import React, { useState, useEffect, useContext } from 'react';
import openSocket from "socket.io-client";

export const STATUS_SOCKET = "status";
export const STATUS_SOCKET_INCOMING_MESSAGES = {
    STATUS_UPDATE: 'status-update'
};

export const CONVERSATION_SOCKET = "conversation";
export const CONVERSATION_SOCKET_INCOMING_MESSAGES = {
    JOIN_CONVERSATION: 'join-conversation'
};
export const CONVERSATION_SOCKET_OUTGOING_MESSAGES = {
    ADD_CONTACT: 'add-contact'
};

const socketIncomingMessagesMap = {
    STATUS_SOCKET: STATUS_SOCKET_INCOMING_MESSAGES,
    CONVERSATION_SOCKET: CONVERSATION_SOCKET_INCOMING_MESSAGES
};

export function useSocket(authState, nameSpace) {
    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState(null);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    useEffect( () => {
        const clean = _ => {
            if(socket){
                console.debug(`Closing ${nameSpace} socket`);
                socket.close();
            }
        };
        if (authState.user && !socket){
            setSocket(openSocket(`${process.env.REACT_APP_SOCKET_URL}/${nameSpace}`, {
                query: {
                    token: `Bearer ${authState.token}`
                }
            }));
            //Setup listeners
            const incomingMessages = socketIncomingMessagesMap[nameSpace];
            for(let incomingMessageKey in incomingMessages){
                if (incomingMessages.hasOwnProperty(incomingMessageKey)){
                    const incomingMessage = incomingMessages[incomingMessageKey];
                    socket.on(incomingMessage, (data) => {
                        setMessage(incomingMessage);
                        setData(data);
                    });
                }
            }
        }else{
            clean();
        }
        return _ => {
            clean();
        }
    }, [authState.user, nameSpace, socket, message, data, error];

    const sendMessage = (message, data) => {
        if(socket){
            socket.emit(message, data);
        }
    };

    return [error, message, data, sendMessage];
}
import { useState, useEffect, useCallback } from 'react';
import { connectSocket, disconnectSocket } from '../helpers/socket';

export const STATUS_SOCKET = "status";
export const STATUS_SOCKET_INCOMING_MESSAGES = {
    STATUS_UPDATE: 'status-update'
};
export const STATUS_SOCKET_OUTGOING_MESSAGES = {
    UPDATE_STATUS: 'update-status',
    ANALYTICS: 'analytics'
};

export const CONVERSATION_SOCKET = "conversation";
export const CONVERSATION_SOCKET_INCOMING_MESSAGES = {
    JOIN_CONVERSATION: 'join-conversation'
};
export const CONVERSATION_SOCKET_OUTGOING_MESSAGES = {
    ADD_CONTACT: 'add-contact',
    LEAVE_CONVERSATION: 'leave-conversation',
    ANALYTICS: 'analytics'
};

const socketIncomingMessagesMap = {
    [STATUS_SOCKET]: STATUS_SOCKET_INCOMING_MESSAGES,
    [CONVERSATION_SOCKET]: CONVERSATION_SOCKET_INCOMING_MESSAGES
};

export function useSocket(authState, nameSpace) {
    const [socket, setSocket] = useState(null);
    const [listeners, setListeners] = useState(null);
    const [message, setMessage] = useState(null);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    useEffect( () => {
        const removeAllListeners = function () {
            for(let message in listeners){
                if(listeners.hasOwnProperty(message)){
                    socket.removeListener(message, listeners[message]);
                }
            }
            setListeners(null);
        };

        if (authState.user && !socket){
            setSocket(connectSocket(process.env.REACT_APP_SOCKET_URL, nameSpace, true));
        }else if(authState.user && socket){
            const newListeners = {};
            console.debug(`Setup ${nameSpace} socket listeners`);
            //Setup listeners
            //Common listeners
            newListeners['error'] = (errorMessage) => {
                console.debug(`Error while trying to connect to ${nameSpace} socket\n`, errorMessage);
                setError(new Error(errorMessage));
            };
            socket.on('error', newListeners['error']);
            //Specific listeners
            const incomingMessages = socketIncomingMessagesMap[nameSpace];
            for(let incomingMessageKey in incomingMessages) {
                if (incomingMessages.hasOwnProperty(incomingMessageKey)) {
                    const incomingMessage = incomingMessages[incomingMessageKey];
                    newListeners[incomingMessage] = (data) => {
                        setMessage(incomingMessage);
                        setData(data);
                    };
                    socket.on(incomingMessage, newListeners[incomingMessage]);
                }
            }
            setListeners(newListeners);
        }else if (!authState.user && socket){
                removeAllListeners();
                disconnectSocket(process.env.REACT_APP_SOCKET_URL, nameSpace);
                setSocket(null);
        }
        return _ => {
            if (socket){
                //Cleaning
                console.debug(`Cleaning: Unsubscribe from all ${nameSpace} socket events`);
                removeAllListeners();
                setSocket(null);
            }
        }

    }, [authState.user, nameSpace, socket]);

    const sendMessage = useCallback((message, data) => {
        if(socket){
            socket.emit(message, data);
        }
    }, [socket]);

    return [error, message, data, sendMessage];
}
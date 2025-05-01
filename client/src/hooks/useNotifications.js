import { useState } from 'react';
export const useNotifications = () => {
    const [messages, setMessages] = useState([]);
    const addMessage = (message) => {
        setMessages((prev) => [...prev, message]);
        if (message.duration) {
            setTimeout(() => {
                setMessages((prev) => prev.filter((m) => m !== message));
            }, message.duration);
        }
    };
    const removeMessage = (message) => {
        setMessages((prev) => prev.filter((m) => m !== message));
    };
    return { messages, addMessage, removeMessage };
};

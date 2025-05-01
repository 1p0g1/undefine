import { useState } from 'react';
import type { Message } from '@undefine/shared-types';

export const useNotifications = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
    if (message.duration) {
      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m !== message));
      }, message.duration);
    }
  };

  const removeMessage = (message: Message) => {
    setMessages((prev) => prev.filter((m) => m !== message));
  };

  return { messages, addMessage, removeMessage };
}; 
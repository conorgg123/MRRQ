import { useState, useCallback } from 'react';

interface Message {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: Date;
}

export function useTeamChat(teamId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = useCallback((userId: string, username: string, text: string) => {
    const newMessage: Message = {
      id: `${teamId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      username,
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
  }, [teamId]);

  return {
    messages,
    sendMessage
  };
}
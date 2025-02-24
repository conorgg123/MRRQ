import React, { useState, useRef, useEffect } from 'react';
import { Send, Shield, Sword, Heart, Crown, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Player {
  id: string;
  username: string;
  role: 'vanguard' | 'duelist' | 'strategist';
  mainCharacters?: string[];
  selectedCharacters?: string[];
  isLeader?: boolean;
}

interface Message {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: Date;
}

interface TeamChatProps {
  teamId: string;
  currentUser: {
    id: string;
    username: string;
  };
  messages: Message[];
  onSendMessage: (text: string) => void;
  players: Player[];
}

export const TeamChat: React.FC<TeamChatProps> = ({
  teamId,
  currentUser,
  messages,
  onSendMessage,
  players
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'vanguard':
        return Shield;
      case 'duelist':
        return Sword;
      case 'strategist':
        return Heart;
      default:
        return Shield;
    }
  };

  const handleProfileClick = (playerId: string) => {
    navigate(`/profile/${playerId}`);
  };

  // If there are no other players besides the current user, show the waiting message
  if (players.length <= 1) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <h3 className="text-xl font-semibold mb-4">Team Chat</h3>
        <p className="text-gray-300">Waiting for players to join...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden flex">
      {/* Player List Sidebar */}
      <div className="w-72 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">Team Members</h3>
        </div>
        <div className="p-2">
          {players.map((player) => {
            const RoleIcon = getRoleIcon(player.role);
            return (
              <button
                key={player.id}
                onClick={() => handleProfileClick(player.id)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-700 transition mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center gap-2">
                  {player.isLeader && (
                    <Crown className="w-4 h-4 text-yellow-400" />
                  )}
                  <span className="font-medium">
                    {player.username}
                    {player.id === currentUser.id && ' (You)'}
                  </span>
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-2 text-sm">
                    <RoleIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      {player.role.charAt(0).toUpperCase() + player.role.slice(1)}
                    </span>
                  </div>
                  
                  {/* Main Characters */}
                  {player.mainCharacters && player.mainCharacters.length > 0 && (
                    <div className="space-y-1">
                      {player.mainCharacters.map((char) => (
                        <div key={char} className="flex items-center gap-1 text-sm text-yellow-400">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{char}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Selected Characters */}
                  {player.selectedCharacters && player.selectedCharacters.length > 0 && (
                    <div className="space-y-1 mt-1">
                      {player.selectedCharacters
                        .filter(char => !player.mainCharacters?.includes(char))
                        .map((char) => (
                          <div key={char} className="text-sm text-gray-400 pl-4">
                            {char}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">Team Chat</h3>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.userId === currentUser.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.userId === currentUser.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={() => handleProfileClick(message.userId)}
                    className="text-sm font-medium hover:underline focus:outline-none"
                  >
                    {message.userId === currentUser.id ? 'You' : message.username}
                  </button>
                  <span className="text-xs text-gray-300">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="break-words">{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
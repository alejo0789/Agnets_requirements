import { useState } from 'react';
import { MessageType, AgentType } from '../types';
import UserMessage from './UserMessage';
import AgentMessage from './AgentMessage';

interface ChatInterfaceProps {
  messages: MessageType[];
  onSendMessage: (content: string) => void;
  currentAgent: AgentType;
}

export default function ChatInterface({ messages, onSendMessage, currentAgent }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <h2 className="text-lg font-semibold">{currentAgent} Agent</h2>
      </div>
      
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {messages.map((message) => (
          message.sender === 'user' ? (
            <UserMessage key={message.id} content={message.content} />
          ) : (
            <AgentMessage key={message.id} content={message.content} />
          )
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t flex">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 p-2 border rounded-lg mr-2 text-sm"
        />
        <button 
          type="submit"
          className="bg-blue-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-5 h-5"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
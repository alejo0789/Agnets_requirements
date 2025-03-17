import React, { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  isDrawingMode: boolean;
  onToggleDrawingMode: () => void;
}

const MessageInput = ({ 
  onSendMessage, 
  isLoading, 
  isDrawingMode, 
  onToggleDrawingMode 
}: MessageInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 py-4 mt-2 flex justify-center">
      <div className="flex items-center bg-gray-100 rounded-xl p-2 shadow-inner max-w-4xl w-full">
        {!isDrawingMode && (
          <button
            type="button"
            onClick={onToggleDrawingMode}
            className="p-2 mx-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
            title="Open sketch tool"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
            </svg>
          </button>
        )}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 py-2 px-3 text-sm bg-transparent focus:outline-none"
          disabled={isDrawingMode || isLoading}
        />
        <button 
          type="submit"
          className={`${isLoading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg p-2 w-10 h-10 flex items-center justify-center mx-2 transition-colors shadow-md`}
          disabled={isDrawingMode || isLoading || !inputValue.trim()}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-6 h-6"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
import React, { forwardRef } from 'react';
import dynamic from 'next/dynamic';

// Import Excalidraw with dynamic loading to prevent SSR issues
const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <p>Loading drawing tool...</p>
      </div>
    ),
  }
);

type MessageType = {
  id: string;
  sender: "user" | "agent";
  content: string;
  timestamp: Date;
  drawingElements?: any[];
};

interface ChatMessagesProps {
  messages: MessageType[];
  isLoading: boolean;
  error: string | null;
  isClient: boolean;
}

const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ messages, isLoading, error, isClient }, ref) => {
    return (
      <div className="flex-1 overflow-y-auto bg-transparent" ref={ref}>
        <div className="max-w-6xl mx-auto px-4 py-4 space-y-8">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="w-full">
                {message.sender === 'user' ? (
                  // User message
                  <div className="bg-white border border-gray-200 p-6 rounded-lg">
                    <p className="text-xl whitespace-pre-wrap" style={{ lineHeight: '1.6' }}>{message.content}</p>
                    {message.drawingElements && message.drawingElements.length > 0 && (
                      <div className="mt-4 bg-white border rounded-lg p-3">
                        <div className="h-52 w-full">
                          {isClient && (
                            <Excalidraw
                              initialData={{
                                elements: message.drawingElements,
                                appState: { 
                                  viewBackgroundColor: "#ffffff",
                                  readOnly: true
                                },
                                scrollToContent: true
                              }}
                              viewModeEnabled={true}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Agent message
                  <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg">
                    <p className="text-xl whitespace-pre-wrap" style={{ lineHeight: '1.6' }}>{message.content}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-pulse flex space-x-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-5 rounded-lg text-xl">
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ChatMessages.displayName = 'ChatMessages';

export default ChatMessages;
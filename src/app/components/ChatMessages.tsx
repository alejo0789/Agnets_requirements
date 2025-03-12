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
      <div className="flex-1 p-4 overflow-y-auto space-y-4" ref={ref}>
        {messages.map((message) => (
          <div key={message.id}>
            {message.sender === 'user' ? (
              // User message
              <div className="flex justify-end">
                <div className="bg-gray-200 p-3 rounded-lg max-w-[80%]">
                  <p>{message.content}</p>
                  {message.drawingElements && message.drawingElements.length > 0 && (
                    <div className="mt-2 bg-white border rounded p-2">
                      <div className="h-40 w-full">
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
              </div>
            ) : (
              // Agent message
              <div className="flex justify-start">
                <div className="bg-blue-100 p-3 rounded-lg max-w-[80%]">
                  <p>{message.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-pulse flex space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}
      </div>
    );
  }
);

ChatMessages.displayName = 'ChatMessages';

export default ChatMessages;
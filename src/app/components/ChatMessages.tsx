import React, { forwardRef } from 'react';
import dynamic from 'next/dynamic';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

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
  drawingElements?: readonly ExcalidrawElement[]; // Updated to readonly
};

interface ChatMessagesProps {
  messages: MessageType[];
  isLoading: boolean;
  isMockupGenerating?: boolean;
  error: string | null;
  isClient: boolean;
  hasMasterplan?: boolean;
  onGenerateMockups?: () => void;
}

const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ 
    messages, 
    isLoading, 
    isMockupGenerating, 
    error, 
    isClient, 
    hasMasterplan,
    onGenerateMockups 
  }, ref) => {
    // Function to format agent message content with HTML list items
    const formatAgentMessage = (content: string) => {
      // Check if the message contains HTML list items
      const hasHtmlLists = content.includes('<li>');
      
      if (hasHtmlLists) {
        // Process the content to properly render HTML lists
        const processedContent = content.split('\n').map((line, index) => {
          // Check if line contains list items
          if (line.includes('<li>')) {
            // Extract the list item content
            const listItemContent = line.replace(/<\/?li>/g, '').trim();
            return (
              <li key={`list-${index}`} className="text-xl ml-8 my-2">
                {listItemContent}
              </li>
            );
          } else if (line.trim() === '') {
            return <div key={`space-${index}`} className="h-3"></div>;
          } else {
            return (
              <p key={`p-${index}`} className="text-xl my-3" style={{ lineHeight: '1.6' }}>
                {line}
              </p>
            );
          }
        });
        
        // Group consecutive list items into ordered lists
        const result: JSX.Element[] = [];
        let currentList: JSX.Element[] = [];
        let listStarted = false;
        
        processedContent.forEach((element, index) => {
          if (React.isValidElement(element) && element.type === 'li') {
            // If this is the first list item, start a new list
            if (!listStarted) {
              listStarted = true;
            }
            currentList.push(element);
          } else {
            // If we have list items collected and this is not a list item,
            // add the list to the result and reset
            if (currentList.length > 0) {
              result.push(
                <ol key={`ol-${index}`} className="list-decimal my-4">
                  {currentList}
                </ol>
              );
              currentList = [];
              listStarted = false;
            }
            result.push(element);
          }
        });
        
        // If there are remaining list items, add them
        if (currentList.length > 0) {
          result.push(
            <ol key="ol-final" className="list-decimal my-4">
              {currentList}
            </ol>
          );
        }
        
        return result;
      } else {
        // Fall back to regular paragraph formatting if no HTML lists are found
        return content.split('\n').map((paragraph, index) => {
          if (paragraph.trim() === '') {
            return <div key={index} className="h-3"></div>;
          }
          
          return (
            <p key={index} className="text-xl my-3" style={{ lineHeight: '1.6' }}>
              {paragraph}
            </p>
          );
        });
      }
    };

    // Check if the last message is about masterplan creation
    const lastMessage = messages[messages.length - 1];
    const isMasterplanMessage = lastMessage && 
      lastMessage.sender === 'agent' && 
      lastMessage.content.includes('masterplan') && 
      hasMasterplan;

    return (
      <div className="flex-1 overflow-y-auto bg-transparent" ref={ref}>
        <div className="max-w-6xl mx-auto px-4 py-4 space-y-8">
          {messages.map((message, index) => (
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
                                  viewModeEnabled: true  // Changed from 'readOnly' to 'viewModeEnabled'
                                },
                                scrollToContent: true
                              }}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Agent message with formatted content
                  <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg">
                    <div className="agent-message">
                      {formatAgentMessage(message.content)}
                    </div>
                    
                    {/* Add "Generate Mockups" button if this is a masterplan message */}
                    {index === messages.length - 1 && 
                     isMasterplanMessage && 
                     onGenerateMockups && (
                      <div className="mt-4">
                        <button
                          onClick={onGenerateMockups}
                          disabled={isLoading || isMockupGenerating}
                          className={`mt-2 ${
                            isLoading || isMockupGenerating
                              ? 'bg-blue-300 cursor-not-allowed'
                              : 'bg-blue-500 hover:bg-blue-600'
                          } text-white px-4 py-2 rounded text-base font-medium transition-colors`}
                        >
                          {isMockupGenerating 
                            ? 'Generating UI/UX Mockups...' 
                            : 'Generate UI/UX Mockups'}
                        </button>
                      </div>
                    )}
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
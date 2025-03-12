'use client';

import { useRef } from 'react';
import { useChatMessages } from './hooks/useChatMessages';
import { useDrawingTool } from './hooks/useDrawingTool';
import { useClientSide } from './hooks/useClientSide';
import MessageInput from './components/MessageInput';
import ChatDrawingTool from './components/ChatDrawingTool';
import ChatMessages from './components/ChatMessages';
import RightPanel from './components/RightPanel';
import AgentSelector from './components/AgentSelector';

export default function Home() {
  // Refs for scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const answerContainerRef = useRef<HTMLDivElement>(null);
  
  // Client-side detection
  const isClient = useClientSide();
  
  // Chat message handling
  const {
    messages,
    currentAgent,
    isLoading,
    error,
    currentRightTab,
    masterplanContent,
    requirementsContent,
    uiUxContent,
    architectureContent,
    hasMasterplan,
    setCurrentRightTab,
    handleSendMessage,
    handleSubmitDrawing,
    handleResetChat,
    switchAgent,
    handleExportContent
  } = useChatMessages();
  
  // Drawing tool
  const {
    isDrawingMode,
    drawingHeight,
    currentDrawingElements,
    handleDrawingChange,
    handleResizeStart,
    handleSubmitDrawing: submitDrawing,
    toggleDrawingMode,
    closeDrawingMode
  } = useDrawingTool(handleSubmitDrawing);

  // Ensure chat scrolls to bottom when messages update
  if (chatContainerRef.current) {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Top header */}
        <div className="bg-white p-4 shadow-md">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">MVP Builder - Sketch Interface</h1>
            <AgentSelector 
              currentAgent={currentAgent}
              onAgentChange={switchAgent}
              isLoading={isLoading}
            />
          </div>
        </div>
        
        {/* Main workspace */}
        <div className="flex-1 flex p-4 gap-4 overflow-hidden">
          {/* Chat Interface */}
          <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">{currentAgent} Agent</h2>
              <button 
                onClick={handleResetChat}
                className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                disabled={isLoading}
              >
                Reset Chat
              </button>
            </div>
            
            {/* Chat messages */}
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              error={error}
              isClient={isClient}
              ref={chatContainerRef}
            />
            
            {/* Drawing tool - appears above the input when in drawing mode */}
            {isDrawingMode && isClient && (
              <ChatDrawingTool
                isClient={isClient}
                drawingHeight={drawingHeight}
                onDrawingChange={handleDrawingChange}
                onHandleResizeStart={handleResizeStart}
                onCancelDrawing={closeDrawingMode}
                onSubmitDrawing={submitDrawing}
                isLoading={isLoading}
              />
            )}
            
            {/* Message input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isDrawingMode={isDrawingMode}
              onToggleDrawingMode={toggleDrawingMode}
            />
          </div>
          
          {/* Right Panel with Tabs */}
          <RightPanel
            currentTab={currentRightTab}
            onTabChange={setCurrentRightTab}
            masterplanContent={masterplanContent}
            requirementsContent={requirementsContent}
            uiUxContent={uiUxContent}
            architectureContent={architectureContent}
            hasMasterplan={hasMasterplan}
            onExportContent={handleExportContent}
            ref={answerContainerRef}
          />
        </div>
      </div>
    </div>
  );
}
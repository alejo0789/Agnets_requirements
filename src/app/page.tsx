'use client';

import { useRef, useEffect } from 'react';
import { useChatMessages } from './hooks/useChatMessages';
import { useDrawingTool } from './hooks/useDrawingTool';
import { useClientSide } from './hooks/useClientSide';
import { useResizablePanel } from './hooks/useResizablePanel';
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
    isMockupGenerating,
    error,
    currentRightTab,
    masterplanContent,
    requirementsContent,
    uiUxContent,
    architectureContent,
    hasMasterplan,
    mockups,
    setCurrentRightTab,
    handleSendMessage,
    handleSubmitDrawing,
    handleResetChat,
    switchAgent,
    handleExportContent,
    handleGenerateMockups
  } = useChatMessages();
  
  // Drawing tool
  const {
    isDrawingMode,
    drawingHeight,
    currentDrawingElements,
    handleDrawingChange,
    handleResizeStart: handleDrawingResizeStart,
    handleSubmitDrawing: submitDrawing,
    toggleDrawingMode,
    closeDrawingMode
  } = useDrawingTool(handleSubmitDrawing);

  // Resizable panel - use percentage instead of direct window reference
  const {
    panelWidth,
    handleResizeStart: handlePanelResizeStart,
    isResizing
  } = useResizablePanel(40); // Use 40% as default width percentage

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Add a class to the body when drawing mode is active
  useEffect(() => {
    if (isDrawingMode) {
      document.body.classList.add('drawing-mode-active');
    } else {
      document.body.classList.remove('drawing-mode-active');
    }
    
    return () => {
      document.body.classList.remove('drawing-mode-active');
    };
  }, [isDrawingMode]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Top header */}
        <div className="bg-white p-5 shadow-md">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">MVP Builder - Sketch Interface</h1>
            {isClient && (
              <AgentSelector 
                currentAgent={currentAgent}
                onAgentChange={switchAgent}
                isLoading={isLoading || isMockupGenerating}
              />
            )}
          </div>
        </div>
        
        {/* Main workspace */}
        <div className="flex-1 flex p-6 gap-16 overflow-hidden">
          {/* Left panel */}
          <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col h-full overflow-hidden ml-12">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-2xl font-semibold">{currentAgent} Agent</h2>
              <button 
                onClick={handleResetChat}
                className="text-base px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                disabled={isLoading || isMockupGenerating}
                type="button"
              >
                Reset Chat
              </button>
            </div>
            
            {/* Chat messages */}
            {isClient && (
              <ChatMessages
                messages={messages}
                isLoading={isLoading}
                isMockupGenerating={isMockupGenerating}
                error={error}
                isClient={isClient}
                hasMasterplan={hasMasterplan}
                onGenerateMockups={handleGenerateMockups}
                ref={chatContainerRef}
              />
            )}
            
            {/* Drawing tool - appears above the input when in drawing mode */}
            {isDrawingMode && isClient && (
              <ChatDrawingTool
                isClient={isClient}
                drawingHeight={drawingHeight}
                onDrawingChange={handleDrawingChange}
                onHandleResizeStart={handleDrawingResizeStart}
                onCancelDrawing={closeDrawingMode}
                onSubmitDrawing={submitDrawing}
                isLoading={isLoading || isMockupGenerating}
              />
            )}
            
            {/* Message input */}
            {isClient && (
              <MessageInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading || isMockupGenerating}
                isDrawingMode={isDrawingMode}
                onToggleDrawingMode={toggleDrawingMode}
              />
            )}
          </div
          
          {/* Right Panel with Tabs */}
          {isClient && !isDrawingMode && (
            <RightPanel
              currentTab={currentRightTab}
              onTabChange={setCurrentRightTab}
              masterplanContent={masterplanContent}
              requirementsContent={requirementsContent}
              uiUxContent={uiUxContent}
              architectureContent={architectureContent}
              hasMasterplan={hasMasterplan}
              mockups={mockups}
              onExportContent={handleExportContent}
              panelWidth={panelWidth}
              handleResizeStart={handlePanelResizeStart}
              ref={answerContainerRef}
            />
          )}
        </div>
      </div>
    </div>
  );
}
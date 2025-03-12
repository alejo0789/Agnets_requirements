// Updated page.tsx to improve reset functionality and toolbar behavior

'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { sendMessage, resetSession } from './services/api';

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

// Define types
type MessageType = {
  id: string;
  sender: "user" | "agent";
  content: string;
  timestamp: Date;
  drawingElements?: any[];
};

type AgentType = "Requirements" | "UI/UX" | "Frontend" | "Database" | "Backend";

// For right panel tabs
type RightPanelTabType = "Masterplan" | "UI/UX" | "Architecture" | "Requirements";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const answerContainerRef = useRef<HTMLDivElement>(null);
  
  // For resizing
  const [isResizing, setIsResizing] = useState(false);
  const [drawingHeight, setDrawingHeight] = useState(250);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Chat state
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      sender: 'agent',
      content: "Hi there! I'm your AI assistant for app development planning. I'll help you understand and plan your app idea through a series of questions. Once we have a clear picture, I'll generate a comprehensive masterplan.md file as a blueprint for your application. Let's start: Could you describe your app idea at a high level?",
      timestamp: new Date(),
    },
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [currentAgent, setCurrentAgent] = useState<AgentType>("Requirements");
  
  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentDrawingElements, setCurrentDrawingElements] = useState<any[]>([]);

  // Right panel tab state
  const [currentRightTab, setCurrentRightTab] = useState<RightPanelTabType>("Requirements");
  
  // Content for right panel tabs
  const [masterplanContent, setMasterplanContent] = useState<string>("");
  const [requirementsContent, setRequirementsContent] = useState<string>("Requirements will appear here as they are defined through the conversation. The agent will extract key points and organize them into a structured format.");
  const [architectureContent, setArchitectureContent] = useState<string>("Architecture details will be displayed here once generated.");
  const [uiUxContent, setUiUxContent] = useState<string>("UI/UX mockups and specifications will be displayed here once generated.");
  
  // Flag to indicate if a masterplan has been generated
  const [hasMasterplan, setHasMasterplan] = useState(false);

  useEffect(() => {
    // Scroll to the bottom of the chat when messages update
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle drag to resize
  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = drawingHeight;
    
    // Prevent default to avoid text selection during drag
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Set up listeners when component mounts and clean up when it unmounts
  useEffect(() => {
    const handleResizeMoveEvent = (e: MouseEvent) => {
      if (isResizing) {
        // Calculate how much the mouse has moved
        const delta = startYRef.current - e.clientY;
        
        // Update the height (moving up increases height, moving down decreases)
        // Set minimum and maximum heights
        const newHeight = Math.max(150, Math.min(window.innerHeight * 0.7, startHeightRef.current + delta));
        setDrawingHeight(newHeight);
        
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    const handleResizeEndEvent = () => {
      setIsResizing(false);
    };
    
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMoveEvent);
      document.addEventListener('mouseup', handleResizeEndEvent);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleResizeMoveEvent);
      document.removeEventListener('mouseup', handleResizeEndEvent);
    };
  }, [isResizing]);
  
  // Reset the chat session but maintain right panel content
  const handleResetChat = async () => {
    try {
      setIsLoading(true);
      await resetSession();
      
      // Reset only the conversation, keep right panel content
      setMessages([{
        id: '1',
        sender: 'agent',
        content: 'What kind of MVP are we building today?',
        timestamp: new Date(),
      }]);
      
      // Don't reset the right panel content
      // setCurrentAnswer("Requirements will appear here as they are defined through the conversation. The agent will extract key points and organize them into a structured format.");
      // setHasMasterplan(false);
      setError(null);
    } catch (err) {
      setError("Failed to reset chat session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      try {
        setIsLoading(true);
        
        // Add user message
        const newUserMessage: MessageType = {
          id: Date.now().toString(),
          sender: 'user',
          content: inputValue.trim(),
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        
        // Get response from backend
        const apiResponse = await sendMessage(newUserMessage.content);
        
        // Check if the API response includes a masterplan
        const masterplanContent = apiResponse.masterplan || checkForMasterplan(apiResponse.response);
        let displayContent = apiResponse.response;
        
        // If this is a masterplan, replace it with a shorter message in the chat
        if (masterplanContent) {
          displayContent = "I've generated the masterplan for your application! You can see the full document in the panel on the right. Let me know if you'd like any clarification or have questions about specific sections.";
          
          // Save masterplan content and set tab to show it
          setMasterplanContent(masterplanContent);
          setHasMasterplan(true);
          setCurrentRightTab("Masterplan");
        } else if (!hasMasterplan) {
          // Only update requirements panel if masterplan hasn't been generated yet
          updateRequirementsPanel(newUserMessage.content, apiResponse.response);
        }
        
        // Create agent message from response (with modified content if it's a masterplan)
        const newAgentMessage: MessageType = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          content: displayContent,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, newAgentMessage]);
        
        // Check if the response contains UI/UX or architecture information
        checkForSpecializedContent(apiResponse.response);
        
      } catch (err: any) {
        setError(err.message || "Failed to send message. Please try again.");
        
        // Add error message to chat
        const errorMessage: MessageType = {
          id: Date.now().toString(),
          sender: 'agent',
          content: "Sorry, there was an error processing your request. Please try again.",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Check if the message contains specialized content (UI/UX or Architecture)
  const checkForSpecializedContent = (message: string) => {
    // Check for UI/UX content
    if (currentAgent === "UI/UX" || message.includes("UI mockup") || message.includes("user interface") || message.includes("UX flow")) {
      // Simple implementation - in a real app, you'd use more sophisticated detection
      setUiUxContent(prev => `${prev}\n\n## UI/UX Updates\n${message}`);
    }
    
    // Check for architecture content
    if (currentAgent === "Backend" || currentAgent === "Frontend" || currentAgent === "Database" || 
        message.includes("architecture") || message.includes("technical stack") || message.includes("data model")) {
      setArchitectureContent(prev => `${prev}\n\n## Architecture Updates\n${message}`);
    }
  };
  
  // Check if the message contains a masterplan.md file
  const checkForMasterplan = (message: string): string | null => {
    // Look for markdown patterns that indicate a masterplan document
    if (message.includes("# ") && 
        (message.includes("## App Overview") || 
         message.includes("## Core Features") || 
         message.includes("## Target Audience"))) {
      return message;
    }
    
    // Try to extract content between triple backticks if it looks like markdown
    const mdPattern = /```(?:md|markdown)?\s([\s\S]*?)```/g;
    const mdMatch = mdPattern.exec(message);
    
    if (mdMatch && mdMatch[1]) {
      const content = mdMatch[1].trim();
      if (content.includes("# ") && 
          (content.includes("## App Overview") || 
           content.includes("## Core Features") || 
           content.includes("## Target Audience"))) {
        return content;
      }
    }
    
    return null;
  };
  
  // Simple function to update requirements panel 
  // In a real implementation, this would be more sophisticated
  const updateRequirementsPanel = (userMessage: string, agentResponse: string) => {
    // Extract requirements from the agent response
    // This is a simple implementation - in a real app you'd use more sophisticated parsing
    
    // Check which section to update based on current agent
    let sectionPrefix = '';
    switch(currentAgent) {
      case 'Requirements':
        sectionPrefix = '## Core Requirements';
        break;
      case 'UI/UX':
        sectionPrefix = '## User Interface';
        break;
      case 'Frontend': 
        sectionPrefix = '## Frontend';
        break;
      case 'Database':
        sectionPrefix = '## Data Model';
        break;
      case 'Backend':
        sectionPrefix = '## Backend';
        break;
    }
    
    // Check if the section already exists
    if (requirementsContent.includes(sectionPrefix)) {
      // If it exists, append to it
      setRequirementsContent(prev => {
        const sections = prev.split('\n\n');
        const updatedSections = sections.map(section => {
          if (section.startsWith(sectionPrefix)) {
            // Extract a key point from agent response (simple implementation)
            const newPoint = `- ${userMessage.slice(0, 50)}${userMessage.length > 50 ? '...' : ''}`;
            return `${section}\n${newPoint}`;
          }
          return section;
        });
        return updatedSections.join('\n\n');
      });
    } else {
      // If the section doesn't exist, create it
      const newSection = `${sectionPrefix}\n- ${userMessage.slice(0, 50)}${userMessage.length > 50 ? '...' : ''}`;
      setRequirementsContent(prev => `${prev}\n\n${newSection}`);
    }
  };

  // Handle drawing changes
  const handleDrawingChange = (elements: any[]) => {
    setCurrentDrawingElements(elements);
  };

  // Submit the drawing as a message
  const handleSubmitDrawing = async () => {
    if (currentDrawingElements.length > 0) {
      try {
        setIsLoading(true);
        
        // Create a new message with the drawing
        const newDrawingMessage: MessageType = {
          id: Date.now().toString(),
          sender: 'user',
          content: 'Here is my sketch:',
          timestamp: new Date(),
          drawingElements: [...currentDrawingElements] // Save a copy of the current drawing
        };
        
        setMessages(prev => [...prev, newDrawingMessage]);
        setCurrentDrawingElements([]);
        setIsDrawingMode(false);
        
        // For now, we'll send a message to the API that includes sketch information
        // In a real implementation, you might serialize the drawing and send it to the backend
        const apiResponse = await sendMessage("I've created a sketch of the interface. [Sketch data included in frontend]");
        
        // Create agent message from response
        const newAgentMessage: MessageType = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          content: apiResponse.response,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, newAgentMessage]);
        
        // Check if the API response includes a masterplan
        const masterplanContent = apiResponse.masterplan || checkForMasterplan(apiResponse.response);
        
        // If this is a masterplan, handle it
        if (masterplanContent) {
          setMasterplanContent(masterplanContent);
          setHasMasterplan(true);
          setCurrentRightTab("Masterplan");
        } else if (!hasMasterplan) {
          // Update requirements panel to include sketch information
          setRequirementsContent(prev => `${prev}\n\n## UI Mockup\n- User provided a sketch for the interface layout`);
          
          // Also update UI/UX content since a sketch was provided
          setUiUxContent(prev => `${prev}\n\n## UI Sketch\n- User provided a sketch for the interface layout`);
          // Automatically switch to the UI/UX tab
          setCurrentRightTab("UI/UX");
        }
        
        // Check if the response contains specialized content
        checkForSpecializedContent(apiResponse.response);
        
      } catch (err: any) {
        setError(err.message || "Failed to process sketch. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // If nothing was drawn, just close the drawing mode
      setIsDrawingMode(false);
    }
  };

  // Toggle drawing mode
  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
    // Reset drawing height when toggling drawing mode
    if (!isDrawingMode) {
      setDrawingHeight(250);
    }
  };

  // Switch active agent
  const switchAgent = async (agent: AgentType) => {
    try {
      setIsLoading(true);
      setCurrentAgent(agent);
      
      // Send a message to the API about the agent switch
      const apiResponse = await sendMessage(`Switching to ${agent} Agent. What specific ${agent.toLowerCase()} requirements would you like to discuss?`);
      
      // Add a system message indicating the agent switch
      const newSystemMessage: MessageType = {
        id: Date.now().toString(),
        sender: 'agent',
        content: apiResponse.response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newSystemMessage]);
      
      // Also switch the right tab automatically based on agent type
      if (agent === "UI/UX") {
        setCurrentRightTab("UI/UX");
      } else if (agent === "Backend" || agent === "Frontend" || agent === "Database") {
        setCurrentRightTab("Architecture");
      } else if (agent === "Requirements") {
        setCurrentRightTab(hasMasterplan ? "Masterplan" : "Requirements");
      }
      
    } catch (err: any) {
      setError(err.message || "Failed to switch agent. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Export the currently displayed content in the right panel
  const handleExportContent = () => {
    let content = "";
    let filename = "";
    
    // Get content based on current tab
    switch (currentRightTab) {
      case "Masterplan":
        content = masterplanContent;
        filename = "masterplan.md";
        break;
      case "Requirements":
        content = requirementsContent;
        filename = "requirements.md";
        break;
      case "Architecture":
        content = architectureContent;
        filename = "architecture.md";
        break;
      case "UI/UX":
        content = uiUxContent;
        filename = "ui-ux-design.md";
        break;
    }
    
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Render the markdown content for the right panel
  const renderMarkdown = (markdown: string) => {
    return markdown.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold mt-4">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold mt-4">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-semibold mt-3">{line.substring(4)}</h3>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-4">{line.substring(2)}</li>;
      } else if (line.startsWith('  - ')) {
        return <li key={index} className="ml-8">{line.substring(4)}</li>;
      } else if (line === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="my-2">{line}</p>;
      }
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content Area - Now takes full width */}
      <div className="flex-1 flex flex-col h-full">
        {/* Top header */}
        <div className="bg-white p-4 shadow-md">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">MVP Builder - Sketch Interface</h1>
            <div className="flex space-x-2">
              <button 
                onClick={() => switchAgent("Requirements")}
                className={`px-3 py-1 rounded ${currentAgent === "Requirements" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                disabled={isLoading}
              >
                Requirements
              </button>
              <button 
                onClick={() => switchAgent("UI/UX")}
                className={`px-3 py-1 rounded ${currentAgent === "UI/UX" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                disabled={isLoading}
              >
                UI/UX
              </button>
              <button 
                onClick={() => switchAgent("Frontend")}
                className={`px-3 py-1 rounded ${currentAgent === "Frontend" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                disabled={isLoading}
              >
                Frontend
              </button>
              <button 
                onClick={() => switchAgent("Database")}
                className={`px-3 py-1 rounded ${currentAgent === "Database" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                disabled={isLoading}
              >
                Database
              </button>
              <button 
                onClick={() => switchAgent("Backend")}
                className={`px-3 py-1 rounded ${currentAgent === "Backend" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                disabled={isLoading}
              >
                Backend
              </button>
            </div>
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
            <div className="flex-1 p-4 overflow-y-auto space-y-4" ref={chatContainerRef}>
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
            
            {/* Drawing tool - appears above the input when in drawing mode */}
            {isDrawingMode && isClient && (
              <div className="p-2 border-t">
                <div className="bg-gray-50 border rounded-lg p-2 relative">
                  {/* Resizable handle */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-6 cursor-ns-resize bg-gray-200 hover:bg-gray-300 flex items-center justify-center z-10"
                    onMouseDown={handleResizeStart}
                  >
                    <div className="w-20 h-1.5 bg-gray-400 rounded-full"></div>
                  </div>
                  
                  {/* Drawing area with dynamic height */}
                  <div 
                    style={{ height: `${drawingHeight}px` }} 
                    className="transition-none overflow-hidden pt-6"
                  >
                    <Excalidraw
                      onChange={(elements) => handleDrawingChange(elements)}
                      initialData={{
                        appState: { 
                          viewBackgroundColor: "#ffffff",
                          currentItemStrokeColor: "#000000",
                          currentItemBackgroundColor: "#ffffff"
                        },
                        scrollToContent: true
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-end mt-2">
                    <button
                      className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded mr-2"
                      onClick={() => setIsDrawingMode(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                      onClick={handleSubmitDrawing}
                      disabled={isLoading}
                    >
                      Send Sketch
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Message input - Centered with reduced width */}
            <form onSubmit={handleSendMessage} className="px-8 py-8 mt-4 flex justify-center">
              <div className="flex items-center bg-gray-100 rounded-2xl p-3 shadow-inner max-w-4xl w-full">
                {!isDrawingMode && (
                  <button
                    type="button"
                    onClick={toggleDrawingMode}
                    className="p-4 mx-3 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors"
                    title="Open sketch tool"
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                      <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                    </svg>
                  </button>
                )}
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 py-6 px-5 text-xl bg-transparent focus:outline-none"
                  disabled={isDrawingMode || isLoading}
                />
                <button 
                  type="submit"
                  className={`${isLoading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-xl p-5 w-20 h-20 flex items-center justify-center mx-3 transition-colors shadow-md`}
                  disabled={isDrawingMode || isLoading || !inputValue.trim()}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-10 h-10"
                  >
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
          
          {/* Right Panel with Tabs */}
          <div className="w-1/3 bg-white rounded-lg shadow-md flex flex-col h-full overflow-hidden">
            {/* Tab Buttons */}
            <div className="flex border-b">
              {hasMasterplan && (
                <button
                  onClick={() => setCurrentRightTab("Masterplan")}
                  className={`flex-1 py-3 font-medium text-sm transition-colors
                    ${currentRightTab === "Masterplan" 
                      ? "border-b-2 border-blue-500 text-blue-600" 
                      : "text-gray-500 hover:text-gray-700"}`}
                >
                  Masterplan
                </button>
              )}
              <button
                onClick={() => setCurrentRightTab("Requirements")}
                className={`flex-1 py-3 font-medium text-sm transition-colors
                  ${currentRightTab === "Requirements" 
                    ? "border-b-2 border-blue-500 text-blue-600" 
                    : "text-gray-500 hover:text-gray-700"}`}
              >
                Requirements
              </button>
              <button
                onClick={() => setCurrentRightTab("UI/UX")}
                className={`flex-1 py-3 font-medium text-sm transition-colors
                  ${currentRightTab === "UI/UX" 
                    ? "border-b-2 border-blue-500 text-blue-600" 
                    : "text-gray-500 hover:text-gray-700"}`}
              >
                UI/UX
              </button>
              <button
                onClick={() => setCurrentRightTab("Architecture")}
                className={`flex-1 py-3 font-medium text-sm transition-colors
                  ${currentRightTab === "Architecture" 
                    ? "border-b-2 border-blue-500 text-blue-600" 
                    : "text-gray-500 hover:text-gray-700"}`}
              >
                Architecture
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 p-4 overflow-y-auto" ref={answerContainerRef}>
              <div className="prose max-w-none">
                {currentRightTab === "Masterplan" && renderMarkdown(masterplanContent)}
                {currentRightTab === "Requirements" && renderMarkdown(requirementsContent)}
                {currentRightTab === "UI/UX" && renderMarkdown(uiUxContent)}
                {currentRightTab === "Architecture" && renderMarkdown(architectureContent)}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="p-4 border-t">
              <div className="flex justify-between">
                <button 
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                  onClick={handleExportContent}
                >
                  Export {currentRightTab}
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                  Save Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
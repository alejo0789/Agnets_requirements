import { useState } from 'react';
import { sendMessage, resetSession } from '../services/api';

type MessageType = {
  id: string;
  sender: "user" | "agent";
  content: string;
  timestamp: Date;
  drawingElements?: any[];
};

type AgentType = "Requirements" | "UI/UX" | "Frontend" | "Database" | "Backend";
type RightPanelTabType = "Masterplan" | "UI/UX" | "Architecture" | "Requirements";

export const useChatMessages = () => {
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Chat state
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      sender: 'agent',
      content: "Hi there! I'm your AI assistant for app development planning. I'll help you understand and plan your app idea through a series of questions. Once we have a clear picture, I'll generate a comprehensive masterplan.md file as a blueprint for your application. Let's start: Could you describe your app idea at a high level?",
      timestamp: new Date(),
    },
  ]);
  
  const [currentAgent, setCurrentAgent] = useState<AgentType>("Requirements");
  
  // Right panel content
  const [masterplanContent, setMasterplanContent] = useState<string>("");
  const [requirementsContent, setRequirementsContent] = useState<string>("Requirements will appear here as they are defined through the conversation. The agent will extract key points and organize them into a structured format.");
  const [architectureContent, setArchitectureContent] = useState<string>("Architecture details will be displayed here once generated.");
  const [uiUxContent, setUiUxContent] = useState<string>("UI/UX mockups and specifications will be displayed here once generated.");
  
  // Tab states
  const [currentRightTab, setCurrentRightTab] = useState<RightPanelTabType>("Requirements");
  const [hasMasterplan, setHasMasterplan] = useState(false);

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
      
      setError(null);
    } catch (err) {
      setError("Failed to reset chat session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send a message to the API
  const handleSendMessage = async (content: string) => {
    if (content.trim() && !isLoading) {
      try {
        setIsLoading(true);
        
        // Add user message
        const newUserMessage: MessageType = {
          id: Date.now().toString(),
          sender: 'user',
          content: content.trim(),
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, newUserMessage]);
        
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

  // Handle submitting a drawing as a message
  const handleSubmitDrawing = async (drawingElements: any[]) => {
    if (drawingElements.length > 0) {
      try {
        setIsLoading(true);
        
        // Create a new message with the drawing
        const newDrawingMessage: MessageType = {
          id: Date.now().toString(),
          sender: 'user',
          content: 'Here is my sketch:',
          timestamp: new Date(),
          drawingElements: [...drawingElements] // Save a copy of the drawing
        };
        
        setMessages(prev => [...prev, newDrawingMessage]);
        
        // For now, we'll send a message to the API that includes sketch information
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

  // Check if the message contains specialized content (UI/UX or Architecture)
  const checkForSpecializedContent = (message: string) => {
    // Check for UI/UX content
    if (currentAgent === "UI/UX" || message.includes("UI mockup") || message.includes("user interface") || message.includes("UX flow")) {
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
  const updateRequirementsPanel = (userMessage: string, agentResponse: string) => {
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

  // Export content from the right panel
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

  return {
    // State
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
    
    // State setters
    setCurrentRightTab,
    
    // Actions
    handleSendMessage,
    handleSubmitDrawing,
    handleResetChat,
    switchAgent,
    handleExportContent
  };
};

export type { MessageType, AgentType, RightPanelTabType };
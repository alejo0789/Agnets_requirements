import { useState, useCallback } from 'react';
import { 
  sendMessage, 
  resetSession, 
  generateMockups, 
  generateArchitecture, 
  checkServerHealth 
} from '../services/api';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

type MessageType = {
  id: string;
  sender: "user" | "agent";
  content: string;
  timestamp: Date;
  drawingElements?: ExcalidrawElement[];
};

type AgentType = "Requirements" | "UI/UX" | "Frontend" | "Database" | "Backend";
type RightPanelTabType = "Requirements" | "UI/UX" | "Architecture";
type MockupType = {
  type: string;
  content: string;
};

export const useChatMessages = () => {
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Server status
  const [isServerHealthy, setIsServerHealthy] = useState(true);
  
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
  const [requirementsContent, setRequirementsContent] = useState<string>("");
  const [architectureContent, setArchitectureContent] = useState<string>("");
  const [uiUxContent, setUiUxContent] = useState<string>("");
  
  // Tab states
  const [currentRightTab, setCurrentRightTab] = useState<RightPanelTabType>("Requirements");
  const [hasMasterplan, setHasMasterplan] = useState(false);

  // Mockup states
  const [mockups, setMockups] = useState<MockupType[]>([]);
  const [architectureDiagrams, setArchitectureDiagrams] = useState<MockupType[]>([]);
  const [isMockupGenerating, setIsMockupGenerating] = useState(false);
  const [isArchitectureGenerating, setIsArchitectureGenerating] = useState(false);
  
  // Store submitted sketches
  const [submittedSketches, setSubmittedSketches] = useState<ExcalidrawElement[][]>([]);

  // Check server health on initialization
  useCallback(async () => {
    try {
      const health = await checkServerHealth();
      setIsServerHealthy(health.status === 'healthy');
    } catch (error) {
      console.error('Server health check failed:', error);
      setIsServerHealthy(false);
    }
  }, []);

  // Reset the chat session but maintain right panel content
  const handleResetChat = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await resetSession();
      
      // Reset only the conversation, keep right panel content
      setMessages([{
        id: '1',
        sender: 'agent',
        content: 'What kind of MVP are we building today?',
        timestamp: new Date(),
      }]);
    } catch (err: any) {
      setError("Failed to reset chat session. Please try again later.");
      console.error("Reset error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send a message to the API
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message
      const newUserMessage: MessageType = {
        id: Date.now().toString(),
        sender: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newUserMessage]);
      
      // Get response from backend
      const apiResponse = await sendMessage(newUserMessage.content, currentAgent);
      
      // Check if the API response includes a masterplan
      const masterplanContent = apiResponse.masterplan || checkForMasterplan(apiResponse.response);
      let displayContent = apiResponse.response;
      
      // If this is a masterplan, replace it with a shorter message in the chat
      if (masterplanContent) {
        displayContent = "I've generated the masterplan for your application! You can see the full document in the panel on the right. Let me know if you'd like any clarification or have questions about specific sections.";
        
        // Save masterplan content and set tab to show it
        setMasterplanContent(masterplanContent);
        setHasMasterplan(true);
        setCurrentRightTab("Requirements");
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
      const errorMessage = err.message || "Failed to send message. Please try again.";
      setError(errorMessage);
      
      // Add error message to chat
      const errorAgentMessage: MessageType = {
        id: Date.now().toString(),
        sender: 'agent',
        content: `Sorry, there was an error processing your request: ${errorMessage}`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorAgentMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submitting a drawing as a message
  const handleSubmitDrawing = async (drawingElements: ExcalidrawElement[]) => {
    if (drawingElements.length === 0 || isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Save the drawing elements to our state
      setSubmittedSketches(prev => [...prev, [...drawingElements]]);
      
      // Create a new message with the drawing
      const newDrawingMessage: MessageType = {
        id: Date.now().toString(),
        sender: 'user',
        content: 'Here is my sketch:',
        timestamp: new Date(),
        drawingElements: [...drawingElements] // Save a copy of the drawing
      };
      
      setMessages(prev => [...prev, newDrawingMessage]);
      
      // Send a message to the API that includes sketch information
      const apiResponse = await sendMessage(
        "I've created a sketch of the interface. [Sketch data included in frontend]", 
        currentAgent
      );
      
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
        setCurrentRightTab("Requirements");
      } else if (!hasMasterplan) {
        // Update requirements panel to include sketch information
        setRequirementsContent(prev => {
          if (prev.trim() === '') {
            return "## UI Mockup\n- User provided a sketch for the interface layout";
          } else {
            return `${prev}\n\n## UI Mockup\n- User provided a sketch for the interface layout`;
          }
        });
        
        // Also update UI/UX content since a sketch was provided
        setUiUxContent(prev => {
          if (prev.trim() === '') {
            return "## UI Sketch\n- User provided a sketch for the interface layout";
          } else {
            return `${prev}\n\n## UI Sketch\n- User provided a sketch for the interface layout`;
          }
        });
        // Automatically switch to the UI/UX tab
        setCurrentRightTab("UI/UX");
      }
      
      // Check if the response contains specialized content
      checkForSpecializedContent(apiResponse.response);
      
    } catch (err: any) {
      const errorMessage = err.message || "Failed to process sketch. Please try again.";
      setError(errorMessage);
      
      // Add error message to chat
      const errorAgentMessage: MessageType = {
        id: Date.now().toString(),
        sender: 'agent',
        content: `Sorry, there was an error processing your sketch: ${errorMessage}`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorAgentMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Switch active agent
  const switchAgent = async (agent: AgentType) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setCurrentAgent(agent);
      
      // Send a message to the API about the agent switch
      const apiResponse = await sendMessage(
        `Switching to ${agent} Agent. What specific ${agent.toLowerCase()} requirements would you like to discuss?`,
        agent
      );
      
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
        setCurrentRightTab(hasMasterplan ? "Requirements" : "Requirements");
      }
      
    } catch (err: any) {
      const errorMessage = err.message || "Failed to switch agent. Please try again.";
      setError(errorMessage);
      
      // Revert back to the previous agent
      setCurrentAgent(currentAgent);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate architecture diagram based on masterplan
  const handleGenerateArchitecture = async () => {
    if (!masterplanContent || isArchitectureGenerating) {
      setError("No masterplan available. Please generate a masterplan first.");
      return;
    }

    try {
      setIsArchitectureGenerating(true);
      setError(null);
      
      // Add a message from the user requesting architecture diagrams
      const newUserMessage: MessageType = {
        id: Date.now().toString(),
        sender: 'user',
        content: "Can you generate architecture diagrams based on our masterplan?",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newUserMessage]);
      
      // Add a processing message from the agent
      const processingMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        content: "I'm generating architecture diagrams based on the masterplan. This may take a minute...",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, processingMessage]);
      
      // Generate architecture diagrams
      const response = await generateArchitecture(masterplanContent);
      
      if (response.success && response.diagrams) {
        // Save the architecture diagrams
        setArchitectureDiagrams(response.diagrams);
        
        // Update the Architecture content with the text descriptions
        let architectureUpdatedContent = architectureContent + "\n\n## System Architecture\n\n";
        
        response.diagrams.forEach((diagram, index) => {
          if (diagram.type === 'text') {
            architectureUpdatedContent += diagram.content + "\n\n";
          }
        });
        
        setArchitectureContent(architectureUpdatedContent);
        
        // Replace the processing message with a success message
        const successMessage: MessageType = {
          id: processingMessage.id,
          sender: 'agent',
          content: "I've generated system architecture diagrams based on the masterplan. You can view them in the Architecture tab.",
          timestamp: new Date(),
        };
        
        setMessages(prev => 
          prev.map(msg => msg.id === processingMessage.id ? successMessage : msg)
        );
        
        // Switch to the Architecture tab
        setCurrentRightTab("Architecture");
      } else {
        throw new Error(response.message || "Failed to generate architecture diagram");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to generate architecture. Please try again.";
      setError(errorMessage);
      
      // Update the processing message to show the error
      setMessages(prev => 
        prev.map(msg => {
          if (msg.sender === 'agent' && msg.content.includes("I'm generating architecture diagrams")) {
            return {
              ...msg,
              content: `Sorry, I couldn't generate the architecture diagrams: ${errorMessage}`
            };
          }
          return msg;
        })
      );
    } finally {
      setIsArchitectureGenerating(false);
    }
  };

  // Generate architecture diagram without changing the tab
  const generateArchitectureInBackground = async () => {
    if (!masterplanContent || isArchitectureGenerating) return;

    try {
      setIsArchitectureGenerating(true);
      
      // Generate architecture diagrams
      const response = await generateArchitecture(masterplanContent);
      
      if (response.success && response.diagrams) {
        // Save the architecture diagrams
        setArchitectureDiagrams(response.diagrams);
        
        // Update the Architecture content with the text descriptions
        let architectureUpdatedContent = architectureContent + "\n\n## System Architecture\n\n";
        
        response.diagrams.forEach((diagram, index) => {
          if (diagram.type === 'text') {
            architectureUpdatedContent += diagram.content + "\n\n";
          }
        });
        
        setArchitectureContent(architectureUpdatedContent);
        
        // Add a message from the agent about architecture but don't switch tabs
        const architectureMessage: MessageType = {
          id: Date.now().toString(),
          sender: 'agent',
          content: "I've also generated a system architecture diagram based on the masterplan. You can view it in the Architecture tab when you're done reviewing the UI/UX mockups.",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, architectureMessage]);
      }
    } catch (err: any) {
      console.error("Error generating architecture in background:", err.message);
      // Don't show this error to the user since it's a background task
    } finally {
      setIsArchitectureGenerating(false);
    }
  };

  // Handle generating mockups based on masterplan and sketches
  const handleGenerateMockups = async () => {
    if (!masterplanContent || isMockupGenerating) {
      setError("No masterplan available. Please generate a masterplan first.");
      return;
    }

    try {
      setIsMockupGenerating(true);
      setError(null);
      
      // Add a message from the user requesting mockups
      const newUserMessage: MessageType = {
        id: Date.now().toString(),
        sender: 'user',
        content: "Can you generate UI/UX mockups based on our masterplan and sketches?",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newUserMessage]);
      
      // Add a processing message from the agent
      const processingMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        content: "I'm generating UI/UX mockups based on the masterplan and your sketches. This may take a minute...",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, processingMessage]);
      
      // Prepare sketch data for the API
      const sketchData = submittedSketches.length > 0 ? submittedSketches : [];
      
      // Call the API with both masterplan and sketches
      const response = await generateMockups(masterplanContent, sketchData);
      
      if (response.success && response.mockups) {
        // Save the mockups
        setMockups(response.mockups);
        
        // Update the UI/UX content with the text descriptions
        let uiUxUpdatedContent = uiUxContent + "\n\n## UI/UX Mockups\n\n";
        
        response.mockups.forEach((mockup, index) => {
          if (mockup.type === 'text') {
            uiUxUpdatedContent += mockup.content + "\n\n";
          }
        });
        
        setUiUxContent(uiUxUpdatedContent);
        
        // Replace the processing message with a success message
        const successMessage: MessageType = {
          id: processingMessage.id,
          sender: 'agent',
          content: "I've generated UI/UX mockups based on our masterplan and your sketches! You can see them in the UI/UX tab.",
          timestamp: new Date(),
        };
        
        setMessages(prev => 
          prev.map(msg => msg.id === processingMessage.id ? successMessage : msg)
        );
        
        // Switch to the UI/UX tab
        setCurrentRightTab("UI/UX");
        
        // Also generate architecture diagrams after mockups, but don't change the tab
        generateArchitectureInBackground();
      } else {
        throw new Error(response.message || "Failed to generate mockups");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to generate mockups. Please try again.";
      setError(errorMessage);
      
      // Update the processing message to show the error
      setMessages(prev => 
        prev.map(msg => {
          if (msg.sender === 'agent' && msg.content.includes("I'm generating UI/UX mockups")) {
            return {
              ...msg,
              content: `Sorry, I couldn't generate the UI/UX mockups: ${errorMessage}`
            };
          }
          return msg;
        })
      );
    } finally {
      setIsMockupGenerating(false);
    }
  };

  // Check if the message contains specialized content (UI/UX or Architecture)
  const checkForSpecializedContent = (message: string) => {
    // Check for UI/UX content
    if (currentAgent === "UI/UX" || message.includes("UI mockup") || message.includes("user interface") || message.includes("UX flow")) {
      setUiUxContent(prev => {
        if (prev.trim() === '') {
          return `## UI/UX Updates\n${message}`;
        } else {
          return `${prev}\n\n## UI/UX Updates\n${message}`;
        }
      });
    }
    
    // Check for architecture content
    if (currentAgent === "Backend" || currentAgent === "Frontend" || currentAgent === "Database" || 
        message.includes("architecture") || message.includes("technical stack") || message.includes("data model")) {
      setArchitectureContent(prev => {
        if (prev.trim() === '') {
          return `## Architecture Updates\n${message}`;
        } else {
          return `${prev}\n\n## Architecture Updates\n${message}`;
        }
      });
    }
  };
  
  // Check if the message contains a masterplan.md file
  const checkForMasterplan = (message: string): string | null => {
    // A real masterplan should have multiple sections
    const requiredSections = [
      "## App Overview", 
      "## Core Features", 
      "## Target Audience",
      "## Technical Stack"
    ];
    
    // Count how many required sections are present
    const sectionCount = requiredSections.filter(section => 
      message.includes(section)
    ).length;
    
    // Only consider it a masterplan if it has at least 3 of the required sections
    // AND starts with a markdown title
    if (message.includes("# ") && sectionCount >= 3) {
      return message;
    }
    
    // Check for markdown code blocks with similar criteria
    const mdPattern = /```(?:md|markdown)?\s([\s\S]*?)```/g;
    const mdMatch = mdPattern.exec(message);
    
    if (mdMatch && mdMatch[1]) {
      const content = mdMatch[1].trim();
      const contentSectionCount = requiredSections.filter(section => 
        content.includes(section)
      ).length;
      
      if (content.includes("# ") && contentSectionCount >= 3) {
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
    
    // Check if the requirementsContent already has content
    if (requirementsContent.trim() !== '') {
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
    } else {
      // If requirementsContent is empty, initialize it with the new section
      const newSection = `${sectionPrefix}\n- ${userMessage.slice(0, 50)}${userMessage.length > 50 ? '...' : ''}`;
      setRequirementsContent(newSection);
    }
  };

  // Export content from the right panel
  const handleExportContent = () => {
    let content = "";
    let filename = "";
    
    // Get content based on current tab
    switch (currentRightTab) {
      case "Requirements":
        content = hasMasterplan ? masterplanContent : requirementsContent;
        filename = hasMasterplan ? "masterplan.md" : "requirements.md";
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
    
    if (!content.trim()) {
      setError("No content to export.");
      return;
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
    mockups,
    architectureDiagrams,
    isMockupGenerating,
    isArchitectureGenerating,
    submittedSketches,
    isServerHealthy,
    
    // State setters
    setCurrentRightTab,
    setError,
    
    // Actions
    handleSendMessage,
    handleSubmitDrawing,
    handleResetChat,
    switchAgent,
    handleExportContent,
    handleGenerateMockups,
    handleGenerateArchitecture
  };
};

export type { MessageType, AgentType, RightPanelTabType, MockupType };
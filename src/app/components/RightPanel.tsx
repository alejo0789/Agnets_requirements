import React, { forwardRef } from 'react';
import MockupRenderer from './MockupRenderer';
import LoadingIndicator from './LoadingIndicator';

type RightPanelTabType = "Requirements" | "UI/UX" | "Architecture";

type MockupType = {
  type: string;
  content: string;
};

interface RightPanelProps {
  currentTab: RightPanelTabType;
  onTabChange: (tab: RightPanelTabType) => void;
  masterplanContent: string;
  requirementsContent: string;
  uiUxContent: string;
  architectureContent: string;
  hasMasterplan: boolean;
  mockups: MockupType[];
  architectureDiagrams?: MockupType[];
  onExportContent: () => void;
  panelWidth: number;
  handleResizeStart: (e: React.MouseEvent) => void;
  // Add new props for loading states
  isMockupGenerating?: boolean;
  isArchitectureGenerating?: boolean;
}

// Helper function to handle inline markdown formatting like bold text
const formatInlineMarkdown = (text: string) => {
  // Handle bold text with **
  const parts = [];
  let lastIndex = 0;
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the bold part
    if (match.index > lastIndex) {
      parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
    }
    
    // Add the bold part
    parts.push(<strong key={`bold-${match.index}`} className="font-bold">{match[1]}</strong>);
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  }
  
  return parts.length > 0 ? parts : text;
};

const RightPanel = forwardRef<HTMLDivElement, RightPanelProps>(
  ({ 
    currentTab, 
    onTabChange, 
    masterplanContent, 
    requirementsContent, 
    uiUxContent, 
    architectureContent, 
    hasMasterplan,
    mockups,
    architectureDiagrams = [],
    onExportContent,
    panelWidth,
    handleResizeStart,
    isMockupGenerating = false,
    isArchitectureGenerating = false
  }, ref) => {
    
    // Improved markdown rendering function
    const renderMarkdown = (markdown: string) => {
      const lines = markdown.split('\n');
      const result = [];
      let currentListItems = [];
      let inList = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Handle headings
        if (line.startsWith('# ')) {
          // Close any open list
          if (inList) {
            result.push(
              <ul key={`list-${i}`} className="my-2 pl-6 list-disc">
                {currentListItems}
              </ul>
            );
            currentListItems = [];
            inList = false;
          }
          
          result.push(
            <h1 key={i} className="text-xl font-bold mt-4 mb-2">
              {line.substring(2)}
            </h1>
          );
        } 
        else if (line.startsWith('## ')) {
          // Close any open list
          if (inList) {
            result.push(
              <ul key={`list-${i}`} className="my-2 pl-6 list-disc">
                {currentListItems}
              </ul>
            );
            currentListItems = [];
            inList = false;
          }
          
          result.push(
            <h2 key={i} className="text-lg font-semibold mt-3 mb-2">
              {line.substring(3)}
            </h2>
          );
        } 
        else if (line.startsWith('### ')) {
          // Close any open list
          if (inList) {
            result.push(
              <ul key={`list-${i}`} className="my-2 pl-6 list-disc">
                {currentListItems}
              </ul>
            );
            currentListItems = [];
            inList = false;
          }
          
          result.push(
            <h3 key={i} className="text-base font-semibold mt-3 mb-1">
              {line.substring(4)}
            </h3>
          );
        }
        // Handle bullet points
        else if (line.match(/^\s*[\*\-]\s/)) {
          inList = true;
          
          // Extract the content after the bullet
          const content = line.replace(/^\s*[\*\-]\s+/, '');
          
          currentListItems.push(
            <li key={`item-${i}`} className="my-1 text-sm">
              {formatInlineMarkdown(content)}
            </li>
          );
        }
        // Handle empty lines
        else if (line.trim() === '') {
          // Close any open list
          if (inList) {
            result.push(
              <ul key={`list-${i}`} className="my-2 pl-6 list-disc">
                {currentListItems}
              </ul>
            );
            currentListItems = [];
            inList = false;
          }
          
          // Add spacing between paragraphs
          result.push(<div key={i} className="h-2"></div>);
        }
        // Regular paragraph text
        else {
          // Close any open list
          if (inList) {
            result.push(
              <ul key={`list-${i}`} className="my-2 pl-6 list-disc">
                {currentListItems}
              </ul>
            );
            currentListItems = [];
            inList = false;
          }
          
          result.push(
            <p key={i} className="my-2 text-sm">
              {formatInlineMarkdown(line)}
            </p>
          );
        }
      }
      
      // Close any open list at the end of processing
      if (inList) {
        result.push(
          <ul key="final-list" className="my-2 pl-6 list-disc">
            {currentListItems}
          </ul>
        );
      }
      
      return result;
    };

    // Determine what content to show in the Requirements tab (only show masterplan)
    const getRequirementsContent = () => {
      // Only show masterplan if it exists
      if (hasMasterplan) {
        return masterplanContent;
      }
      
      // Otherwise, return empty string to trigger empty state
      return "";
    };

    // Get the content to display based on the tab
    const getTabContent = () => {
      switch (currentTab) {
        case "Requirements":
          // Only display masterplan if it exists
          if (hasMasterplan && masterplanContent) {
            return renderMarkdown(masterplanContent);
          } else {
            // Empty state - waiting for masterplan
            return (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-center">The masterplan will appear here once it's generated from your conversation with the assistant.</p>
              </div>
            );
          }
        case "UI/UX":
          // Check if we're generating mockups
          if (isMockupGenerating) {
            return (
              <LoadingIndicator 
                message="Generating UI/UX mockups based on your requirements and sketches..." 
                type="spinner"
              />
            );
          } else if (uiUxContent.trim() || mockups.length > 0) {
            return (
              <>
                {/* Text content first */}
               
                
                {/* Then mockups with their own descriptions */}
                {mockups.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-3">UI/UX Mockups</h2>
                    <div className="p-1 bg-white rounded-lg shadow-sm">
                      <MockupRenderer mockups={mockups} />
                    </div>
                  </div>
                )}
              </>
            );
          } else {
            // Empty state - waiting for UI/UX content
            return (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                <p className="text-center">UI/UX information will appear here as you discuss design aspects or generate mockups.</p>
              </div>
            );
          }
        case "Architecture":
          // Check if we're generating architecture diagrams
          if (isArchitectureGenerating) {
            return (
              <LoadingIndicator 
                message="Generating architecture diagrams based on your application requirements..." 
                type="dots"
              />
            );
          } else if ((architectureContent && architectureContent.trim()) || 
              (architectureDiagrams && architectureDiagrams.length > 0)) {
            return (
              <>
                {/* Text content first */}
                
                {/* Display architecture diagrams */}
                {architectureDiagrams && architectureDiagrams.length > 0 && (
                  <div className="mt-4">
                    <h2 className="text-lg font-semibold mb-3">System Architecture Diagram</h2>
                    <div className="p-1 bg-white rounded-lg shadow-sm">
                      <MockupRenderer mockups={architectureDiagrams} />
                    </div>
                  </div>
                )}
              </>
            );
          } else {
            // Empty state - waiting for architecture content
            return (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-center">Technical architecture details will appear here as you discuss technical considerations.</p>
              </div>
            );
          }
        default:
          return null;
      }
    };

    // Use a default width if panelWidth is 0 (initial state)
    const effectiveWidth = panelWidth || 400; // Default to 400px if not set yet

    return (
      <div 
        style={{ width: `${effectiveWidth}px` }} 
        className="relative bg-white rounded-lg shadow-md flex flex-col h-full overflow-hidden"
      >
        {/* Resizable handle */}
        <div 
          className="absolute top-0 bottom-0 left-0 w-4 cursor-ew-resize z-10 hover:bg-blue-100 opacity-0 hover:opacity-30 transition-opacity"
          onMouseDown={handleResizeStart}
        ></div>
        {/* Tab Buttons */}
        <div className="flex border-b">
          <button
            onClick={() => onTabChange("Requirements")}
            className={`flex-1 py-2 font-medium text-sm transition-colors
              ${currentTab === "Requirements" 
                ? "border-b-2 border-blue-500 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"}`}
          >
            {hasMasterplan ? "Masterplan" : "Requirements"}
          </button>
          <button
            onClick={() => onTabChange("UI/UX")}
            className={`flex-1 py-2 font-medium text-sm transition-colors
              ${currentTab === "UI/UX" 
                ? "border-b-2 border-blue-500 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"}`}
          >
            UI/UX
            {isMockupGenerating && (
              <span className="ml-1 inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            )}
          </button>
          <button
            onClick={() => onTabChange("Architecture")}
            className={`flex-1 py-2 font-medium text-sm transition-colors
              ${currentTab === "Architecture" 
                ? "border-b-2 border-blue-500 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"}`}
          >
            Architecture
            {isArchitectureGenerating && (
              <span className="ml-1 inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            )}
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="flex-1 p-4 overflow-y-auto" ref={ref}>
          <div className="prose prose-sm max-w-none">
            {getTabContent()}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="p-3 border-t">
          <div className="flex justify-between">
            <button 
              className={`${(!hasMasterplan && currentTab === "Requirements") || (currentTab === "UI/UX" && isMockupGenerating) || (currentTab === "Architecture" && isArchitectureGenerating) ? 'opacity-50 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'} px-3 py-2 rounded text-sm font-medium`}
              onClick={onExportContent}
              disabled={
                (!hasMasterplan && currentTab === "Requirements") || 
                (currentTab === "UI/UX" && isMockupGenerating) || 
                (currentTab === "Architecture" && isArchitectureGenerating)
              }
            >
              Export {currentTab === "Requirements" && hasMasterplan ? "Masterplan" : currentTab}
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium">
              Save Project
            </button>
          </div>
        </div>
      </div>
    );
  }
);

RightPanel.displayName = 'RightPanel';

export default RightPanel;
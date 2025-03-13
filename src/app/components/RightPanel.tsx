import React, { forwardRef } from 'react';

type RightPanelTabType = "Masterplan" | "UI/UX" | "Architecture" | "Requirements";

interface RightPanelProps {
  currentTab: RightPanelTabType;
  onTabChange: (tab: RightPanelTabType) => void;
  masterplanContent: string;
  requirementsContent: string;
  uiUxContent: string;
  architectureContent: string;
  hasMasterplan: boolean;
  onExportContent: () => void;
  panelWidth: number;
  handleResizeStart: (e: React.MouseEvent) => void;
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
    onExportContent,
    panelWidth,
    handleResizeStart 
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
              <ul key={`list-${i}`} className="my-4 pl-8 list-disc">
                {currentListItems}
              </ul>
            );
            currentListItems = [];
            inList = false;
          }
          
          result.push(
            <h1 key={i} className="text-3xl font-bold mt-6 mb-3">
              {line.substring(2)}
            </h1>
          );
        } 
        else if (line.startsWith('## ')) {
          // Close any open list
          if (inList) {
            result.push(
              <ul key={`list-${i}`} className="my-4 pl-8 list-disc">
                {currentListItems}
              </ul>
            );
            currentListItems = [];
            inList = false;
          }
          
          result.push(
            <h2 key={i} className="text-2xl font-semibold mt-5 mb-2">
              {line.substring(3)}
            </h2>
          );
        } 
        else if (line.startsWith('### ')) {
          // Close any open list
          if (inList) {
            result.push(
              <ul key={`list-${i}`} className="my-4 pl-8 list-disc">
                {currentListItems}
              </ul>
            );
            currentListItems = [];
            inList = false;
          }
          
          result.push(
            <h3 key={i} className="text-xl font-semibold mt-4 mb-2">
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
            <li key={`item-${i}`} className="my-2">
              {formatInlineMarkdown(content)}
            </li>
          );
        }
        // Handle empty lines
        else if (line.trim() === '') {
          // Close any open list
          if (inList) {
            result.push(
              <ul key={`list-${i}`} className="my-4 pl-8 list-disc">
                {currentListItems}
              </ul>
            );
            currentListItems = [];
            inList = false;
          }
          
          // Add spacing between paragraphs
          result.push(<div key={i} className="h-3"></div>);
        }
        // Regular paragraph text
        else {
          // Close any open list
          if (inList) {
            result.push(
              <ul key={`list-${i}`} className="my-4 pl-8 list-disc">
                {currentListItems}
              </ul>
            );
            currentListItems = [];
            inList = false;
          }
          
          result.push(
            <p key={i} className="my-3 text-lg">
              {formatInlineMarkdown(line)}
            </p>
          );
        }
      }
      
      // Close any open list at the end of processing
      if (inList) {
        result.push(
          <ul key="final-list" className="my-4 pl-8 list-disc">
            {currentListItems}
          </ul>
        );
      }
      
      return result;
    };

    return (
      <div 
        style={{ width: `${panelWidth}px` }} 
        className="relative bg-white rounded-lg shadow-md flex flex-col h-full overflow-hidden"
      >
        {/* Resizable handle */}
        <div 
          className="absolute top-0 bottom-0 left-0 w-4 cursor-ew-resize z-10 hover:bg-blue-100 opacity-0 hover:opacity-30 transition-opacity"
          onMouseDown={handleResizeStart}
        ></div>
        {/* Tab Buttons */}
        <div className="flex border-b">
          {hasMasterplan && (
            <button
              onClick={() => onTabChange("Masterplan")}
              className={`flex-1 py-4 font-medium text-base transition-colors
                ${currentTab === "Masterplan" 
                  ? "border-b-2 border-blue-500 text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"}`}
            >
              Masterplan
            </button>
          )}
          <button
            onClick={() => onTabChange("Requirements")}
            className={`flex-1 py-4 font-medium text-base transition-colors
              ${currentTab === "Requirements" 
                ? "border-b-2 border-blue-500 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"}`}
          >
            Requirements
          </button>
          <button
            onClick={() => onTabChange("UI/UX")}
            className={`flex-1 py-4 font-medium text-base transition-colors
              ${currentTab === "UI/UX" 
                ? "border-b-2 border-blue-500 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"}`}
          >
            UI/UX
          </button>
          <button
            onClick={() => onTabChange("Architecture")}
            className={`flex-1 py-4 font-medium text-base transition-colors
              ${currentTab === "Architecture" 
                ? "border-b-2 border-blue-500 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"}`}
          >
            Architecture
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="flex-1 p-5 overflow-y-auto" ref={ref}>
          <div className="prose prose-lg max-w-none">
            {currentTab === "Masterplan" && renderMarkdown(masterplanContent)}
            {currentTab === "Requirements" && renderMarkdown(requirementsContent)}
            {currentTab === "UI/UX" && renderMarkdown(uiUxContent)}
            {currentTab === "Architecture" && renderMarkdown(architectureContent)}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="p-4 border-t">
          <div className="flex justify-between">
            <button 
              className="bg-gray-200 hover:bg-gray-300 px-5 py-3 rounded text-base font-medium"
              onClick={onExportContent}
            >
              Export {currentTab}
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded text-base font-medium">
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
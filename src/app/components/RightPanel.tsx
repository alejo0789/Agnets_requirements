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
    
    // Render the markdown content for the right panel
    const renderMarkdown = (markdown: string) => {
      return markdown.split('\n').map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold mt-6 mb-3">{line.substring(2)}</h1>;
        } else if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold mt-5 mb-2">{line.substring(3)}</h2>;
        } else if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
        } else if (line.startsWith('- ')) {
          return <li key={index} className="ml-6 text-lg my-2">{line.substring(2)}</li>;
        } else if (line.startsWith('  - ')) {
          return <li key={index} className="ml-10 text-lg my-2">{line.substring(4)}</li>;
        } else if (line === '') {
          return <div key={index} className="h-3"></div>;
        } else {
          return <p key={index} className="my-3 text-lg">{line}</p>;
        }
      });
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
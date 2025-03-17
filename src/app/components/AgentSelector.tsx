import React from 'react';

type AgentType = "Requirements" | "UI/UX" | "Frontend" | "Database" | "Backend";

interface AgentSelectorProps {
  currentAgent: AgentType;
  onAgentChange: (agent: AgentType) => void;
  isLoading: boolean;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({ 
  currentAgent, 
  onAgentChange, 
  isLoading 
}) => {
  return (
    <div className="flex space-x-1">
      <button 
        onClick={() => onAgentChange("Requirements")}
        className={`px-2 py-1 rounded text-xs ${currentAgent === "Requirements" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        disabled={isLoading}
      >
        Requirements
      </button>
      <button 
        onClick={() => onAgentChange("UI/UX")}
        className={`px-2 py-1 rounded text-xs ${currentAgent === "UI/UX" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        disabled={isLoading}
      >
        UI/UX
      </button>
      <button 
        onClick={() => onAgentChange("Frontend")}
        className={`px-2 py-1 rounded text-xs ${currentAgent === "Frontend" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        disabled={isLoading}
      >
        Frontend
      </button>
      <button 
        onClick={() => onAgentChange("Database")}
        className={`px-2 py-1 rounded text-xs ${currentAgent === "Database" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        disabled={isLoading}
      >
        Database
      </button>
      <button 
        onClick={() => onAgentChange("Backend")}
        className={`px-2 py-1 rounded text-xs ${currentAgent === "Backend" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        disabled={isLoading}
      >
        Backend
      </button>
    </div>
  );
};

export default AgentSelector;
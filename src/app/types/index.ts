export type MessageType = {
    id: string;
    sender: "user" | "agent";
    content: string;
    timestamp: Date;
  };
  
  export type AgentType = "Requirements" | "UI/UX" | "Frontend" | "Database" | "Backend";
// services/api.ts
// Updated to support improved reset functionality

/**
 * Service to handle API calls to the Flask backend
 */

// Base URL for API calls - adjust based on your deployment setup
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type AgentType = "Requirements" | "UI/UX" | "Frontend" | "Database" | "Backend";

/**
 * Send a message to the chat API
 * @param message The user message to send
 * @param agentType The current agent type
 * @returns The response from the API
 */
export async function sendMessage(
  message: string, 
  agentType: AgentType = "Requirements",
  preserveMasterplan: boolean = true
): Promise<{ 
  response: string, 
  requirements?: any,
  isFirstMessage?: boolean,
  masterplan?: string,
  uiUx?: string,
  architecture?: string
}> {
  try {
    console.log(`Sending message to ${agentType} agent: ${message.substring(0, 50)}...`);
    
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message,
        agent_type: agentType,
        preserve_masterplan: preserveMasterplan
      }),
      credentials: 'include', // Important for session cookies
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Received response: ${data.response.substring(0, 50)}...`);
    
    // If the response includes a masterplan, log it
    if (data.masterplan) {
      console.log('Masterplan received with length:', data.masterplan.length);
    }
    
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Generate a masterplan directly
 * This function explicitly requests a masterplan generation
 * @returns The response from the API with masterplan content
 */
export async function generateMasterplan(): Promise<{ 
  response: string,
  masterplan?: string
}> {
  try {
    // Send a direct and clear request to generate the masterplan
    const response = await sendMessage("Please generate a comprehensive masterplan for my app based on our conversation so far.");
    return response;
  } catch (error) {
    console.error('Error generating masterplan:', error);
    throw error;
  }
}

/**
 * Switch to a different agent
 * @param agentType The agent type to switch to
 * @returns The response from the API
 */
export async function switchAgent(agentType: AgentType): Promise<{ 
  response: string,
  requirements?: any,
  masterplan?: string,
  uiUx?: string,
  architecture?: string
}> {
  try {
    // Send a message to the backend indicating agent switch
    const switchMessage = `I'd like to switch to discussing ${agentType.toLowerCase()} considerations now. What specific ${agentType.toLowerCase()} requirements should we explore?`;
    
    const response = await sendMessage(switchMessage, agentType);
    return response;
  } catch (error) {
    console.error('Error switching agent:', error);
    throw error;
  }
}

/**
 * Reset the chat session while preserving masterplan content
 * @param preserveMasterplan Whether to preserve masterplan in session
 * @returns A success status
 */
export async function resetSession(preserveMasterplan: boolean = true): Promise<{ status: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ preserve_masterplan: preserveMasterplan }),
      credentials: 'include', // Important for session cookies
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error resetting session:', error);
    throw error;
  }
}
// services/api.ts
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

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

/**
 * Generate UI/UX mockups using Claude AI based on the masterplan and sketches
 * @param masterplan The masterplan content to use for mockup generation
 * @param sketches Array of drawing elements from Excalidraw
 * @returns The response from the API with mockup content
 */
export async function generateMockups(
  masterplan?: string, 
  sketches?: ExcalidrawElement[][]
): Promise<{ 
  success: boolean,
  mockups?: Array<{type: string, content: string}>,
  message?: string
}> {
  try {
    console.log('Requesting mockup generation from Claude AI');
    console.log(`Sketches provided: ${sketches ? sketches.length : 0}`);
    
    // Prepare the request payload
    const payload: any = { masterplan };
    
    // If we have sketches, include them in the request
    if (sketches && sketches.length > 0) {
      // We need to convert the Excalidraw elements to a more Claude-friendly format
      payload.sketches = sketches.map((sketch, index) => {
        // Get unique types without using Set spread
        const typeSet = new Set<string>();
        sketch.forEach(element => {
          if (element.type) {
            typeSet.add(element.type);
          }
        });
        
        // Convert Set to Array using Array.from
        const types = Array.from(typeSet);
        
        return {
          id: `sketch-${index}`,
          elementCount: sketch.length,
          types: types,
          // Include a textual description of what's in the sketch
          description: `User sketch ${index+1} with ${sketch.length} elements including ${types.join(', ')}`
        };
      });
      
      console.log('Processed sketches for API:', payload.sketches);
    }
    
    const response = await fetch(`${API_BASE_URL}/generate-mockups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include', // Important for session cookies
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Received mockups from Claude AI');
    
    return data;
  } catch (error) {
    console.error('Error generating mockups:', error);
    throw error;
  }
}

/**
 * Generate system architecture diagram based on masterplan
 * @param masterplan The masterplan content to use for architecture generation
 * @returns The response from the API with architecture diagram content
 */
export async function generateArchitecture(
  masterplan?: string
): Promise<{
  success: boolean,
  diagrams?: Array<{type: string, content: string}>,
  message?: string
}> {
  try {
    console.log('Requesting architecture diagram generation');
    
    // Prepare the request payload
    const payload: any = { masterplan };
    
    const response = await fetch(`${API_BASE_URL}/generate-architecture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include', // Important for session cookies
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Received architecture diagrams');
    
    return data;
  } catch (error) {
    console.error('Error generating architecture diagrams:', error);
    throw error;
  }
}
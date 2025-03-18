// src/app/services/api.ts - updated version with image sending capabilities

import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import { convertDrawingToImage, extractBase64FromDataUrl } from '../utils/drawingUtils';

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
  preserveMasterplan: boolean = true,
  drawingImage?: string // Optional parameter for drawing image
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
    
    const payload: any = { 
      message,
      agent_type: agentType,
      preserve_masterplan: preserveMasterplan
    };
    
    // If drawing image is provided, include it in the payload
    if (drawingImage) {
      payload.drawing_image = drawingImage;
      console.log('Including drawing image in message');
    }
    
    const response = await fetch(`${API_BASE_URL}/chat`, {
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
 * Submit a drawing as a message with the image sent to the backend
 * @param elements Excalidraw drawing elements
 * @param message Optional message to accompany the drawing
 * @param agentType The current agent type
 * @returns The response from the API
 */
export async function submitDrawing(
  elements: ExcalidrawElement[],
  message: string = "Here is my sketch:",
  agentType: AgentType = "UI/UX"
): Promise<{
  response: string,
  requirements?: any,
  masterplan?: string,
  uiUx?: string
}> {
  try {
    console.log('Converting drawing to image...');
    
    // Convert the drawing to an image
    const imageDataUrl = await convertDrawingToImage(elements);
    
    // Extract the base64 content without the data URL prefix
    const base64Image = extractBase64FromDataUrl(imageDataUrl);
    
    console.log('Drawing converted to image, sending to backend...');
    
    // Send the message with the drawing image
    return await sendMessage(message, agentType, true, base64Image);
  } catch (error) {
    console.error('Error submitting drawing:', error);
    throw error;
  }
}

// Rest of your API functions remain the same...
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
    
    // If we have sketches, convert them to images and include them
    if (sketches && sketches.length > 0) {
      // Convert each sketch to an image
      const sketchImages = await Promise.all(
        sketches.map(async (sketch) => {
          try {
            const imageDataUrl = await convertDrawingToImage(sketch);
            return extractBase64FromDataUrl(imageDataUrl);
          } catch (error) {
            console.error('Error converting sketch to image:', error);
            // Return null for failed conversions
            return null;
          }
        })
      );
      
      // Filter out any null values from failed conversions
      payload.sketch_images = sketchImages.filter(Boolean);
      
      console.log(`Converted ${payload.sketch_images.length} sketches to images`);
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
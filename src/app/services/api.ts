// src/app/services/api.ts - updated version with improved error handling and session management

import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import { convertDrawingToImage, extractBase64FromDataUrl } from '../utils/drawingUtils';

// Base URL for API calls - adjust based on your deployment setup
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type AgentType = "Requirements" | "UI/UX" | "Frontend" | "Database" | "Backend";

// Add request timeout functionality
const withTimeout = (promise: Promise<any>, timeoutMs: number = 30000) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
};

/**
 * Send a message to the chat API with improved error handling
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
    console.log(`Sending messages to ${agentType} agent: ${message.substring(0, 50)}...`);
    
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
    
    const fetchPromise = fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include', // Important for session cookies
    });
    
    // Add timeout handling
    const response = await withTimeout(fetchPromise);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      
      // Check for specific error types
      if (response.status === 401 || response.status === 403) {
        throw new Error('Session expired or unauthorized. Please refresh the page.');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(`API error: ${response.status} - ${errorText || 'Unknown error'}`);
      }
    }

    const data = await response.json();
    console.log(`Received response from ${agentType} agent`);
    
    // If the response includes a masterplan, log it
    if (data.masterplan) {
      console.log('Masterplan received with length:', data.masterplan.length);
    }
    
    return data;
  } catch (error: any) {
    // Handle network errors specifically
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('Network error:', error);
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
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

/**
 * Reset the session on the server
 * @param preserveMasterplan Whether to preserve the masterplan in the session
 * @returns Status response from the server
 */
export async function resetSession(preserveMasterplan: boolean = true): Promise<{ status: string }> {
  try {
    const fetchPromise = fetch(`${API_BASE_URL}/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ preserve_masterplan: preserveMasterplan }),
      credentials: 'include', // Important for session cookies
    });
    
    // Add timeout handling
    const response = await withTimeout(fetchPromise);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Reset session failed: ${response.status} - ${errorText || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error resetting session:', error);
    throw error;
  }
}

/**
 * Generate UI/UX mockups based on masterplan and sketches
 * @param masterplan The masterplan content
 * @param sketches Array of Excalidraw elements representing sketches
 * @returns Generated mockups and status
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
    console.log('Requesting mockup generation');
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
    
    const fetchPromise = fetch(`${API_BASE_URL}/generate-mockups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include', // Important for session cookies
    });
    
    // Use a longer timeout for mockup generation (60 seconds)
    const response = await withTimeout(fetchPromise, 60000);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Mockup generation failed: ${response.status} - ${errorText || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Check the status
    if (data.status === 'processing' && data.job_id) {
      // If processing, start polling for completion
      return await pollForMockupCompletion(data.job_id);
    }
    
    return data;
  } catch (error) {
    console.error('Error generating mockups:', error);
    throw error;
  }
}

/**
 * Poll for mockup generation completion
 * @param jobId The job ID to check
 * @returns The completed mockups
 */
async function pollForMockupCompletion(jobId: string): Promise<{ 
  success: boolean,
  mockups?: Array<{type: string, content: string}>,
  message?: string
}> {
  // Poll every 2 seconds for up to 2 minutes
  const maxAttempts = 60;
  const pollInterval = 2000;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      console.log(`Checking mockup status (attempt ${attempt + 1}/${maxAttempts})...`);
      
      const response = await fetch(`${API_BASE_URL}/check-mockup-status?job_id=${jobId}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error(`Status check failed: ${response.status}`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        continue;
      }
      
      const status = await response.json();
      
      if (status.status === 'completed' && status.mockups) {
        console.log('Mockup generation completed successfully');
        return {
          success: true,
          mockups: status.mockups
        };
      } else if (status.status === 'error') {
        console.error('Mockup generation failed:', status.message);
        throw new Error(status.message || 'Mockup generation failed');
      }
      
      // Still processing, wait and try again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error('Error checking mockup status:', error);
      // Continue polling despite errors
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  
  // If we get here, polling timed out
  throw new Error('Mockup generation timed out. Please try again.');
}

/**
 * Generate architecture diagrams based on masterplan
 * @param masterplan The masterplan content
 * @returns Generated architecture diagrams and status
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
    
    const fetchPromise = fetch(`${API_BASE_URL}/generate-architecture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include', // Important for session cookies
    });
    
    // Use a longer timeout for architecture generation (60 seconds)
    const response = await withTimeout(fetchPromise, 60000);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Architecture generation failed: ${response.status} - ${errorText || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Check the status
    if (data.status === 'processing' && data.job_id) {
      // If processing, start polling for completion
      return await pollForArchitectureCompletion(data.job_id);
    }
    
    return data;
  } catch (error) {
    console.error('Error generating architecture diagrams:', error);
    throw error;
  }
}

/**
 * Poll for architecture generation completion
 * @param jobId The job ID to check
 * @returns The completed architecture diagrams
 */
async function pollForArchitectureCompletion(jobId: string): Promise<{
  success: boolean,
  diagrams?: Array<{type: string, content: string}>,
  message?: string
}> {
  // Poll every 2 seconds for up to 2 minutes
  const maxAttempts = 60;
  const pollInterval = 2000;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      console.log(`Checking architecture status (attempt ${attempt + 1}/${maxAttempts})...`);
      
      const response = await fetch(`${API_BASE_URL}/check-architecture-status?job_id=${jobId}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error(`Status check failed: ${response.status}`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        continue;
      }
      
      const status = await response.json();
      
      if (status.status === 'completed' && status.diagrams) {
        console.log('Architecture generation completed successfully');
        return {
          success: true,
          diagrams: status.diagrams
        };
      } else if (status.status === 'error') {
        console.error('Architecture generation failed:', status.message);
        throw new Error(status.message || 'Architecture generation failed');
      }
      
      // Still processing, wait and try again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error('Error checking architecture status:', error);
      // Continue polling despite errors
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  
  // If we get here, polling timed out
  throw new Error('Architecture generation timed out. Please try again.');
}

/**
 * Check server health
 * @returns Health status of the server
 */
export async function checkServerHealth(): Promise<{ 
  status: string, 
  timestamp: string,
  version: string
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Server health check failed:', error);
    throw error;
  }
}
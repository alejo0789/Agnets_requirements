// src/app/utils/drawingUtils.ts
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

/**
 * Converts Excalidraw elements to a PNG data URL
 * @param elements Excalidraw drawing elements
 * @returns Promise that resolves to a data URL string
 */
export const convertDrawingToImage = async (
  elements: ExcalidrawElement[]
): Promise<string> => {
  // Dynamically import Excalidraw to avoid SSR issues
  const { exportToBlob } = await import('@excalidraw/excalidraw');
  
  try {
    // Export the drawing to a blob
    const blob = await exportToBlob({
      elements,
      appState: {
        exportWithDarkMode: false,
        exportBackground: true,
        viewBackgroundColor: "#ffffff"
      },
      files: null,
      // Set dimensions for the exported image
      getDimensions: () => ({
        width: 800,
        height: 600,
        scale: 2 // Higher scale for better quality
      })
    });

    // Convert the blob to a data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to data URL'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting drawing to image:', error);
    throw error;
  }
};

/**
 * Extracts base64 content from a data URL
 * @param dataUrl The data URL string (e.g., data:image/png;base64,iVBORw0KG...)
 * @returns The base64 string without the data URL prefix
 */
export const extractBase64FromDataUrl = (dataUrl: string): string => {
  // Data URLs are formatted as: data:[<mediatype>][;base64],<data>
  const base64Marker = ';base64,';
  const base64Index = dataUrl.indexOf(base64Marker) + base64Marker.length;
  return dataUrl.substring(base64Index);
};
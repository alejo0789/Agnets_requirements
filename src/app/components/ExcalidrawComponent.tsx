import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/types/types';

// Import Excalidraw dynamically with no SSR to avoid server-side rendering issues
const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <p>Loading drawing tool...</p>
      </div>
    ),
  }
);

interface ExcalidrawComponentProps {
  onChange?: (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => void;
}

// Make sure to use 'export default' here
export default function ExcalidrawComponent({ onChange }: ExcalidrawComponentProps) {
  const [isClient, setIsClient] = useState(false);
  
  // Create a reference to the Excalidraw app instance
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set the active tool after Excalidraw is initialized
  useEffect(() => {
    if (excalidrawAPI) {
      try {
        // Use setTimeout to ensure the component is fully loaded
        setTimeout(() => {
          // Explicitly cast to any to bypass TypeScript type checking
          (excalidrawAPI as any).updateScene({
            appState: {
              // Set the active tool to freedraw
              currentTool: "freedraw"
            }
          });
        }, 100);
      } catch (error) {
        console.error("Error setting active tool:", error);
      }
    }
  }, [excalidrawAPI]);

  const handleChange = (
    elements: readonly ExcalidrawElement[], 
    appState: AppState, 
    files: BinaryFiles
  ) => {
    if (onChange) {
      onChange(elements, appState, files);
    }
  };

  if (!isClient) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading drawing tool...</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Excalidraw
      
      
        initialData={{
          appState: {
            viewBackgroundColor: "#f8f9fa",
            currentItemStrokeColor: "#1971c2",
            currentItemBackgroundColor: "#fff",
            currentItemStrokeWidth: 2,
            
          }
        }}
        // Get a reference to the Excalidraw API
        ref={(api) => setExcalidrawAPI(api)}
      />
    </div>
  );
}
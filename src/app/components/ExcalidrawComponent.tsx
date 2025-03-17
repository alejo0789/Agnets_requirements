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

  useEffect(() => {
    setIsClient(true);
  }, []);

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
        onChange={handleChange}
        gridModeEnabled={false}
        zenModeEnabled={false}
        initialData={{
          appState: {
            viewBackgroundColor: "#f8f9fa"
          }
        }}
      />
    </div>
  );
}
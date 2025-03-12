import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

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
  onChange?: (elements: any[], appState: any) => void;
}

export default function ExcalidrawComponent({ onChange }: ExcalidrawComponentProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (elements: any[], appState: any) => {
    if (onChange) {
      onChange(elements, appState);
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
        viewBackgroundColor="#f8f9fa"
      />
    </div>
  );
}
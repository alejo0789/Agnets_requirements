import { useRef } from 'react';
import dynamic from 'next/dynamic';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/types/types';

const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-500">Loading drawing tool...</p>
      </div>
    ),
  }
);

interface ExcalidrawComponentProps {
  onChange?: (elements: readonly ExcalidrawElement[], state: AppState, files: BinaryFiles) => void;
  initialElements?: readonly ExcalidrawElement[];
  viewModeEnabled?: boolean;
}

export default function ExcalidrawComponent({
  onChange,
  initialElements = [],
  viewModeEnabled = false,
}: ExcalidrawComponentProps) {
  const excalidrawAPI = useRef<any>(null);

  // Default to freedraw (non-custom) so customType is null.
  const lastActiveTool = useRef<AppState["activeTool"]>({
    lastActiveTool: { type: "freedraw", customType: null },
    type: "freedraw",
    customType: null,
    locked: true,
  });

  const handleChange = (
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles
  ) => {
    onChange?.(elements, appState, files);

    if (!viewModeEnabled && excalidrawAPI.current) {
      // Create an updated LastActiveTool value based on the current active tool.
      const updatedLastActiveTool =
        appState.activeTool.type === "custom"
          ? { type: "custom", customType: appState.activeTool.customType! }
          : { type: appState.activeTool.type, customType: null };

  

      excalidrawAPI.current.updateScene({
        appState: {
          ...appState,
          activeTool: lastActiveTool.current,
        },
      });
    }
  };

  return (
    <div className="h-full w-full">
      <Excalidraw
        ref={excalidrawAPI}
        onChange={handleChange}
        initialData={{
          elements: initialElements,
          appState: {
            viewBackgroundColor: "#ffffff",
            currentItemStrokeColor: "#1971c2",
            currentItemBackgroundColor: "#fff",
            currentItemStrokeWidth: 2,
            viewModeEnabled,
            activeTool: lastActiveTool.current,
          },
        }}
        viewModeEnabled={viewModeEnabled}
      />
    </div>
  );
}

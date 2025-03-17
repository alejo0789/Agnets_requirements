import React, { useRef, memo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import type { AppState } from '@excalidraw/excalidraw/types/types';

// Import Excalidraw dynamically to prevent SSR issues
const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <p>Loading drawing tool...</p>
      </div>
    ),
  }
);

interface ChatDrawingToolProps {
  isClient: boolean;
  drawingHeight: number;
  onDrawingChange: (elements: readonly ExcalidrawElement[]) => void;
  onHandleResizeStart: (e: React.MouseEvent) => void;
  onCancelDrawing: () => void;
  onSubmitDrawing: () => void;
  isLoading: boolean;
}

// Use React.memo to prevent unnecessary re-renders
const ChatDrawingTool = memo(({
  isClient,
  drawingHeight,
  onDrawingChange,
  onHandleResizeStart,
  onCancelDrawing,
  onSubmitDrawing,
  isLoading
}: ChatDrawingToolProps) => {
  // Use ref to track the initial render
  const isInitialRender = useRef(true);
  const excalidrawRef = useRef<any>(null);
  
  // Initial app state with locked tool settings to prevent reverting to selection tool
  const [appState] = useState<Partial<AppState>>({
    viewBackgroundColor: "#ffffff",
    currentItemStrokeColor: "#000000",
    currentItemBackgroundColor: "#ffffff",
    persistentElementCount: 0,
    penMode: false,
    activeTool: {
      customType: null,
      locked: true, // This prevents the tool from automatically switching back
      type: "rectangle"
    }
  });
  
  // A stable onChange handler that won't cause infinite updates
  const handleExcalidrawChange = useCallback(
    (elements: readonly ExcalidrawElement[], newAppState: AppState) => {
      // Skip the first onChange event which happens on initial render
      if (isInitialRender.current) {
        isInitialRender.current = false;
        return;
      }
      
      // Only trigger updates when elements actually change
      if (elements && elements.length > 0) {
        onDrawingChange(elements);
      }
    },
    [onDrawingChange]
  );
  
  return (
    <div className="p-2 border-t">
      <div className="bg-gray-50 border rounded-lg p-2 relative">
        {/* Resizable handle */}
        <div 
          className="absolute top-0 left-0 right-0 h-6 cursor-ns-resize bg-gray-200 hover:bg-gray-300 flex items-center justify-center z-10"
          onMouseDown={onHandleResizeStart}
        >
          <div className="w-20 h-1.5 bg-gray-400 rounded-full"></div>
        </div>
        
        {/* Drawing area with dynamic height */}
        <div 
          style={{ height: `${drawingHeight}px` }} 
          className="transition-none overflow-hidden pt-6"
        >
          {isClient && (
            <Excalidraw
              ref={excalidrawRef}
              onChange={handleExcalidrawChange}
              initialData={{
                appState: appState,
                scrollToContent: true
              }}
              UIOptions={{
                canvasActions: {
                  export: false,
                  loadScene: false,
                  saveToActiveFile: false,
                  saveAsImage: false,
                  theme: false,
                  changeViewBackgroundColor: false
                }
              }}
              detectScroll={true}
              handleKeyboardGlobally={true}
            />
          )}
        </div>
        
        <div className="flex justify-end mt-2">
          <button
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded mr-2"
            onClick={onCancelDrawing}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`${isLoading ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded`}
            onClick={onSubmitDrawing}
            disabled={isLoading}
            type="button"
          >
            Send Sketch
          </button>
        </div>
      </div>
    </div>
  );
});

// Add display name for debugging
ChatDrawingTool.displayName = 'ChatDrawingTool';

export default ChatDrawingTool;
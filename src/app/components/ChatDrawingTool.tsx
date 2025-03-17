import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

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
  onDrawingChange: (elements: readonly ExcalidrawElement[]) => void; // Updated type here
  onHandleResizeStart: (e: React.MouseEvent) => void;
  onCancelDrawing: () => void;
  onSubmitDrawing: () => void;
  isLoading: boolean;
}

const ChatDrawingTool = ({
  isClient,
  drawingHeight,
  onDrawingChange,
  onHandleResizeStart,
  onCancelDrawing,
  onSubmitDrawing,
  isLoading
}: ChatDrawingToolProps) => {
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
              onChange={onDrawingChange}
              initialData={{
                appState: { 
                  viewBackgroundColor: "#ffffff",
                  currentItemStrokeColor: "#000000",
                  currentItemBackgroundColor: "#ffffff"
                },
                scrollToContent: true
              }}
            />
          )}
        </div>
        
        <div className="flex justify-end mt-2">
          <button
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded mr-2"
            onClick={onCancelDrawing}
          >
            Cancel
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            onClick={onSubmitDrawing}
            disabled={isLoading}
          >
            Send Sketch
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDrawingTool;
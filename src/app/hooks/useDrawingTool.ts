import { useState, useRef, useEffect } from 'react';

export const useDrawingTool = (onSubmitDrawing: (elements: any[]) => Promise<void>) => {
  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentDrawingElements, setCurrentDrawingElements] = useState<any[]>([]);
  
  // For resizing
  const [isResizing, setIsResizing] = useState(false);
  const [drawingHeight, setDrawingHeight] = useState(250);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  
  // Handle drag to resize
  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = drawingHeight;
    
    // Prevent default to avoid text selection during drag
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Set up listeners when component mounts and clean up when it unmounts
  useEffect(() => {
    const handleResizeMoveEvent = (e: MouseEvent) => {
      if (isResizing) {
        // Calculate how much the mouse has moved
        const delta = startYRef.current - e.clientY;
        
        // Update the height (moving up increases height, moving down decreases)
        // Set minimum and maximum heights
        const newHeight = Math.max(150, Math.min(window.innerHeight * 0.7, startHeightRef.current + delta));
        setDrawingHeight(newHeight);
        
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    const handleResizeEndEvent = () => {
      setIsResizing(false);
    };
    
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMoveEvent);
      document.addEventListener('mouseup', handleResizeEndEvent);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleResizeMoveEvent);
      document.removeEventListener('mouseup', handleResizeEndEvent);
    };
  }, [isResizing]);
  
  // Handle drawing changes
  const handleDrawingChange = (elements: any[]) => {
    setCurrentDrawingElements(elements);
  };

  // Submit the drawing as a message
  const handleSubmitDrawing = async () => {
    if (currentDrawingElements.length > 0) {
      await onSubmitDrawing([...currentDrawingElements]);
      setCurrentDrawingElements([]);
      setIsDrawingMode(false);
    } else {
      // If nothing was drawn, just close the drawing mode
      setIsDrawingMode(false);
    }
  };

  // Toggle drawing mode
  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
    // Reset drawing height when toggling drawing mode
    if (!isDrawingMode) {
      setDrawingHeight(250);
    }
  };

  // Close drawing mode
  const closeDrawingMode = () => {
    setIsDrawingMode(false);
  };

  return {
    isDrawingMode,
    drawingHeight,
    currentDrawingElements,
    handleDrawingChange,
    handleResizeStart,
    handleSubmitDrawing,
    toggleDrawingMode,
    closeDrawingMode
  };
};
import { useState, useRef, useEffect, useCallback } from 'react';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

export const useDrawingTool = (onSubmitDrawing: (elements: ExcalidrawElement[]) => Promise<void>) => {
  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentDrawingElements, setCurrentDrawingElements] = useState<ExcalidrawElement[]>([]);
  
  // For resizing
  const [isResizing, setIsResizing] = useState(false);
  const [drawingHeight, setDrawingHeight] = useState(250); // Default initial height
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  
  // Use useRef to track if an update is already in progress
  const isUpdatingRef = useRef(false);
  
  // Handle drag to resize - use useCallback to prevent recreating this function on every render
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = drawingHeight;
    
    // Prevent default to avoid text selection during drag
    e.preventDefault();
    e.stopPropagation();
  }, [drawingHeight]);
  
  // Set up listeners when component mounts and clean up when it unmounts
  useEffect(() => {
    // Only set up listeners if isResizing is true
    if (!isResizing) return;
    
    const handleResizeMoveEvent = (e: MouseEvent) => {
      if (!isUpdatingRef.current) {
        isUpdatingRef.current = true;
        
        // Calculate how much the mouse has moved
        const delta = startYRef.current - e.clientY;
        
        // Update the height (moving up increases height, moving down decreases)
        // Set minimum height of 150px and maximum of 70% of viewport height
        let maxHeight = window.innerHeight * 0.7;
        const newHeight = Math.max(150, Math.min(maxHeight, startHeightRef.current + delta));
        
        setDrawingHeight(newHeight);
        
        // Reset flag after update
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 0);
        
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    const handleResizeEndEvent = () => {
      setIsResizing(false);
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleResizeMoveEvent);
    document.addEventListener('mouseup', handleResizeEndEvent);
    
    // Remove event listeners when effect cleanup runs
    return () => {
      document.removeEventListener('mousemove', handleResizeMoveEvent);
      document.removeEventListener('mouseup', handleResizeEndEvent);
    };
  }, [isResizing]);
  
  // Handle drawing changes - memoize this function to prevent recreating it on every render
  const handleDrawingChange = useCallback((elements: readonly ExcalidrawElement[]) => {
    if (!isUpdatingRef.current) {
      isUpdatingRef.current = true;
      
      // Convert readonly array to regular array by spreading
      setCurrentDrawingElements([...elements]);
      
      // Reset flag after update
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, []);

  // Submit the drawing as a message - memoize to prevent recreation
  const handleSubmitDrawing = useCallback(async () => {
    if (currentDrawingElements.length > 0) {
      await onSubmitDrawing([...currentDrawingElements]);
      setCurrentDrawingElements([]);
      setIsDrawingMode(false);
    } else {
      // If nothing was drawn, just close the drawing mode
      setIsDrawingMode(false);
    }
  }, [currentDrawingElements, onSubmitDrawing]);

  // Toggle drawing mode - memoize to prevent recreation
  const toggleDrawingMode = useCallback(() => {
    setIsDrawingMode(prevMode => {
      // When entering drawing mode, set initial height to 55% of viewport height
      if (!prevMode) {
        const initialHeight = window.innerHeight * 0.55;
        setDrawingHeight(initialHeight);
      }
      return !prevMode;
    });
  }, []);

  // Close drawing mode - memoize to prevent recreation
  const closeDrawingMode = useCallback(() => {
    setIsDrawingMode(false);
  }, []);

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
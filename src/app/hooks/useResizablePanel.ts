// Add this to your hooks folder as useResizablePanel.ts

import { useState, useRef, useEffect } from 'react';

export const useResizablePanel = (initialWidth: number) => {
  // Panel state
  const [panelWidth, setPanelWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  
  // For resizing
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  
  // Handle drag to resize
  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = panelWidth;
    
    // Prevent default to avoid text selection during drag
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Set up listeners when component mounts and clean up when it unmounts
  useEffect(() => {
    const handleResizeMoveEvent = (e: MouseEvent) => {
      if (isResizing) {
        // Calculate how much the mouse has moved
        const delta = startXRef.current - e.clientX;
        
        // Update the width (moving left increases width, moving right decreases)
        // Set minimum and maximum widths - 25% to 60% of screen width
        const minWidth = window.innerWidth * 0.25;
        const maxWidth = window.innerWidth * 0.6;
        const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + delta));
        setPanelWidth(newWidth);
        
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

  return {
    panelWidth,
    handleResizeStart,
    isResizing
  };
};
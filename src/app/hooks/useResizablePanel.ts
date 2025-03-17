import { useState, useRef, useEffect } from 'react';

export const useResizablePanel = (initialWidthPercentage: number = 40) => {
  // Panel state
  const [panelWidth, setPanelWidth] = useState<number>(0);
  const [isResizing, setIsResizing] = useState(false);
  
  // For resizing
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  
  // Initialize panel width after component mounts (client-side only)
  useEffect(() => {
    // Only set the initial width when it hasn't been set before or window is resized
    if (panelWidth === 0) {
      setPanelWidth(window.innerWidth * (initialWidthPercentage / 100));
    }

    // Handle window resize
    const handleWindowResize = () => {
      // Only resize if not actively being dragged
      if (!isResizing) {
        setPanelWidth(prevWidth => {
          // Calculate what percentage of the window the current width represents
          const currentPercentage = (prevWidth / window.innerWidth) * 100;
          // Apply that same percentage to the new window width, but
          // use initialWidthPercentage if prevWidth was 0 (initial state)
          const percentageToUse = prevWidth === 0 ? initialWidthPercentage : currentPercentage;
          return window.innerWidth * (percentageToUse / 100);
        });
      }
    };

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [initialWidthPercentage, isResizing]);
  
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
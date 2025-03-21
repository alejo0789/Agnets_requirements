import { useState, useRef, useEffect, useCallback } from 'react';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import { convertDrawingToImage } from '../utils/drawingUtils';

export const useDrawingTool = (onSubmitDrawing: (elements: ExcalidrawElement[]) => Promise<void>) => {
  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentDrawingElements, setCurrentDrawingElements] = useState<ExcalidrawElement[]>([]);
  
  // For image preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  
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
      
      // Reset image preview when drawing changes
      setPreviewImage(null);
      
      // Reset flag after update
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, []);
  
  // Generate image preview when requested
  const generatePreview = useCallback(async () => {
    if (currentDrawingElements.length > 0 && !previewImage) {
      try {
        setIsGeneratingPreview(true);
        const imageDataUrl = await convertDrawingToImage(currentDrawingElements);
        setPreviewImage(imageDataUrl);
        
        // Add a toast notification to improve UX
        if (window && (window as any).excalidrawAPI?.setToast) {
          (window as any).excalidrawAPI.setToast({
            message: "Preview generated",
            duration: 2000,
          });
        }
      } catch (error) {
        console.error('Error generating preview:', error);
        
        // Show error toast if possible
        if (window && (window as any).excalidrawAPI?.setToast) {
          (window as any).excalidrawAPI.setToast({
            message: "Error generating preview",
            duration: 2000,
          });
        }
      } finally {
        setIsGeneratingPreview(false);
      }
    }
  }, [currentDrawingElements, previewImage]);

  // Submit the drawing as a message - memoize to prevent recreation
  const handleSubmitDrawing = useCallback(async () => {
    if (currentDrawingElements.length > 0) {
      try {
        // Generate preview if not already done
        if (!previewImage && !isGeneratingPreview) {
          await generatePreview();
        }
        
        await onSubmitDrawing([...currentDrawingElements]);
        setCurrentDrawingElements([]);
        setPreviewImage(null);
        setIsDrawingMode(false);
      } catch (error) {
        console.error('Error submitting drawing:', error);
      }
    } else {
      // If nothing was drawn, just close the drawing mode
      setIsDrawingMode(false);
    }
  }, [currentDrawingElements, onSubmitDrawing, previewImage, isGeneratingPreview, generatePreview]);

  // Toggle drawing mode - memoize to prevent recreation
  const toggleDrawingMode = useCallback(() => {
    setIsDrawingMode(prevMode => {
      // When entering drawing mode, set initial height to 55% of viewport height
      if (!prevMode) {
        const initialHeight = window.innerHeight * 0.55;
        setDrawingHeight(initialHeight);
        // Reset preview and elements when opening drawing mode
        setPreviewImage(null);
        setCurrentDrawingElements([]);
      }
      return !prevMode;
    });
  }, []);

  // Close drawing mode - memoize to prevent recreation
  const closeDrawingMode = useCallback(() => {
    setIsDrawingMode(false);
    setPreviewImage(null);
    setCurrentDrawingElements([]);
  }, []);

  return {
    isDrawingMode,
    drawingHeight,
    currentDrawingElements,
    previewImage,
    isGeneratingPreview,
    handleDrawingChange,
    handleResizeStart,
    handleSubmitDrawing,
    generatePreview,
    toggleDrawingMode,
    closeDrawingMode
  };
};
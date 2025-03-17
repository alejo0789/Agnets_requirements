// src/app/types/excalidraw.ts
import type { 
    ExcalidrawElement, 
    ExcalidrawImageElement, 
    ExcalidrawTextElement,
    ExcalidrawLinearElement,
    ExcalidrawFreeDrawElement,
    ExcalidrawRectangleElement,
    ExcalidrawDiamondElement,
    ExcalidrawEllipseElement,
    ExcalidrawArrowElement
  } from '@excalidraw/excalidraw/types/element/types';
  
  import type {
    AppState,
    BinaryFiles
  } from '@excalidraw/excalidraw/types/types';
  
  export type {
    ExcalidrawElement,
    ExcalidrawImageElement,
    ExcalidrawTextElement,
    ExcalidrawLinearElement,
    ExcalidrawFreeDrawElement,
    ExcalidrawRectangleElement,
    ExcalidrawDiamondElement,
    ExcalidrawEllipseElement,
    ExcalidrawArrowElement,
    AppState,
    BinaryFiles
  };
  
  // Define types for the onChange handler and Excalidraw props/state
  export interface ExcalidrawChangeEvent {
    elements: readonly ExcalidrawElement[];
    appState: AppState;
    files?: BinaryFiles;
  }
  
  export type OnChangeCallback = (elements: readonly ExcalidrawElement[], state: AppState, files?: BinaryFiles) => void;
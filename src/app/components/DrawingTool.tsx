import { useState } from 'react';
import ExcalidrawComponent from './ExcalidrawComponent';

export default function DrawingTool() {
  const [isExcalidrawVisible, setIsExcalidrawVisible] = useState(false);
  const [drawingElements, setDrawingElements] = useState<any[]>([]);

  const handleDrawingChange = (elements: any[], appState: any) => {
    setDrawingElements(elements);
    // You could save the state to localStorage or your backend here
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex space-x-2">
          <button className="w-8 h-8 bg-gray-300 rounded-full"></button>
          <button className="w-8 h-8 bg-gray-300 rounded border"></button>
          <button className="w-8 h-8 flex items-center justify-center">
            <div className="w-6 h-6 transform rotate-180 border-t-8 border-r-8 border-l-8 border-gray-400 border-solid" 
                 style={{ borderBottomWidth: 0 }}></div>
          </button>
          <button className="w-8 h-8 rounded-full border border-gray-400"></button>
          <button className="w-8 h-8 flex items-center justify-center">
            <div className="w-6 h-0.5 bg-gray-400 transform -rotate-45"></div>
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button className="w-8 h-8 bg-red-400 rounded-full"></button>
          <button className="w-8 h-8 bg-blue-500 rounded-full"></button>
          <button className="w-8 h-8 bg-green-400 rounded-full"></button>
          <button className="w-8 h-8 bg-yellow-300 rounded-full"></button>
        </div>
      </div>
      
      <div className="flex-1 relative">
        {isExcalidrawVisible ? (
          <div className="absolute inset-0">
            <ExcalidrawComponent onChange={handleDrawingChange} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-center text-gray-400 p-4">
            <div>
              <div className="bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                <div className="text-center">
                  <p className="text-gray-500">Header/Navigation</p>
                </div>
              </div>
              
              <div className="flex space-x-4 mb-4">
                <div className="bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-300 flex-1 h-40">
                  <div className="text-center h-full flex items-center justify-center">
                    <p className="text-gray-500">Featured Products</p>
                  </div>
                </div>
                
                <div className="bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-300 flex-1 h-40">
                  <div className="text-center h-full flex items-center justify-center">
                    <p className="text-gray-500">Categories</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <p className="text-gray-500">Footer</p>
                </div>
              </div>
              
              <button 
                className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                onClick={() => setIsExcalidrawVisible(true)}
              >
                Open Excalidraw Editor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
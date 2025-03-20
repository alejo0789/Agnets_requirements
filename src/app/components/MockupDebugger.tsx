// src/app/components/MockupDebugger.tsx
import React, { useState } from 'react';

type MockupType = {
  type: string;
  content: string;
};

interface MockupDebuggerProps {
  mockups: MockupType[];
  title?: string;
}

const MockupDebugger: React.FC<MockupDebuggerProps> = ({ mockups, title = "Debug Mockups" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  if (mockups.length === 0) {
    return null;
  }
  
  return (
    <div className="mockup-debugger mt-4 border border-gray-300 rounded-lg">
      <div 
        className="flex items-center justify-between p-2 bg-gray-100 border-b cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="font-medium text-sm">{title} ({mockups.length})</h4>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={`transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      
      {isOpen && (
        <div className="p-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {mockups.map((mockup, index) => (
              <button 
                key={index}
                className={`px-2 py-1 text-xs rounded ${
                  selectedIndex === index 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                onClick={() => setSelectedIndex(index === selectedIndex ? null : index)}
              >
                Item {index+1} ({mockup.type})
              </button>
            ))}
          </div>
          
          {selectedIndex !== null && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-medium text-sm">
                  Mockup {selectedIndex+1} ({mockups[selectedIndex].type})
                </h5>
                <span className="text-xs text-gray-500">
                  Content length: {mockups[selectedIndex].content.length} chars
                </span>
              </div>
              
              {mockups[selectedIndex].type === 'svg' ? (
                <>
                  <p className="text-xs mb-2">SVG Source:</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-40">
                    {mockups[selectedIndex].content.substring(0, 500)}
                    {mockups[selectedIndex].content.length > 500 ? '...' : ''}
                  </pre>
                  
                  <p className="text-xs mt-3 mb-1">Issues to check:</p>
                  <ul className="text-xs list-disc pl-5">
                    <li className={mockups[selectedIndex].content.includes('\\n') ? 'text-red-500' : 'text-green-500'}>
                      Contains escaped newlines: {mockups[selectedIndex].content.includes('\\n') ? 'Yes ⚠️' : 'No ✓'}
                    </li>
                    <li className={mockups[selectedIndex].content.includes('xmlns=') ? 'text-green-500' : 'text-red-500'}>
                      Has xmlns attribute: {mockups[selectedIndex].content.includes('xmlns=') ? 'Yes ✓' : 'No ⚠️'}
                    </li>
                    <li className={mockups[selectedIndex].content.includes('<svg') ? 'text-green-500' : 'text-red-500'}>
                      Starts with svg tag: {mockups[selectedIndex].content.includes('<svg') ? 'Yes ✓' : 'No ⚠️'}
                    </li>
                  </ul>
                </>
              ) : (
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-80">
                  {mockups[selectedIndex].content}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MockupDebugger;
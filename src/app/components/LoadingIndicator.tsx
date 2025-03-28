import React from 'react';

/**
 * A versatile loading indicator component that provides visual feedback 
 * for ongoing processes with different styles
 */
interface LoadingIndicatorProps {
  message: string;
  progress?: number; // Optional progress percentage (0-100)
  type?: 'spinner' | 'progress' | 'dots';
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message, 
  progress, 
  type = 'spinner' 
}) => {
  // Normalize progress to ensure it's between 0-100
  const normalizedProgress = progress !== undefined 
    ? Math.min(Math.max(0, progress), 100) 
    : undefined;
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {type === 'spinner' && (
        <div className="w-16 h-16 mb-4 border-4 border-t-blue-500 border-r-blue-300 border-b-blue-200 border-l-blue-400 rounded-full animate-spin"></div>
      )}
      
      {type === 'dots' && (
        <div className="flex space-x-2 mb-4">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )}
      
      {type === 'progress' && normalizedProgress !== undefined && (
        <div className="w-full max-w-md mb-4">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${normalizedProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1 text-right">{normalizedProgress}%</p>
        </div>
      )}
      
      <p className="text-gray-700">{message}</p>
    </div>
  );
};

export default LoadingIndicator;
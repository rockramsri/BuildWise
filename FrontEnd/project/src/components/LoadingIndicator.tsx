import React from 'react';

export function LoadingIndicator() {
  return (
    <div className="flex items-center space-x-3 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm max-w-[60%] transition-colors duration-200">
      <div className="flex space-x-2">
        <div className="w-3 h-3 rounded-full bg-blue-400 dark:bg-blue-500 animate-pulse"></div>
        <div className="w-3 h-3 rounded-full bg-blue-400 dark:bg-blue-500 animate-pulse delay-150"></div>
        <div className="w-3 h-3 rounded-full bg-blue-400 dark:bg-blue-500 animate-pulse delay-300"></div>
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400">Buildwise is thinking...</span>
    </div>
  );
}
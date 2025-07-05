import React from 'react';

const NoProjectSelected = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center text-gray-500 dark:text-gray-400">
        <p>Select a project to start chatting with Claude</p>
      </div>
    </div>
  );
};

export default NoProjectSelected;
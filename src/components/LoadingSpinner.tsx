import React from 'react';

/**
 * A simple, accessible loading spinner component using Tailwind CSS.
 * Displays a visual spinner and includes screen-reader-only text.
 * This component accepts no props.
 */
const LoadingSpinner: React.FC = () => {
  return (
    <div role="status">
      {/* The visual spinner element */}
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>
      {/* Screen-reader accessible text */}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
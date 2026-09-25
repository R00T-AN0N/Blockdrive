import React from 'react';

const Loader = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
      {/* Simple Bouncing Balls - No Text */}
      <div className="flex justify-center space-x-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-4 h-4 bg-white rounded-full animate-bounce"
            style={{ 
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.6s'
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Loader;

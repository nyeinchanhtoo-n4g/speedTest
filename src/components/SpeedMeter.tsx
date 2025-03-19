'use client';

import React, { memo } from 'react';

interface SpeedMeterProps {
  progress: number;
  currentSpeed: number;
  testing: boolean;
  results: {
    download: number;
    upload: number;
    ping: number;
  };
}

// Optimize the SpeedMeter component with memoization to prevent unnecessary re-renders
const SpeedMeter = memo(function SpeedMeter({ progress, currentSpeed, testing, results }: SpeedMeterProps) {
  // Format the current speed with proper decimal places based on the value
  const formattedSpeed = currentSpeed < 1 
    ? currentSpeed.toFixed(3) 
    : currentSpeed < 10 
      ? currentSpeed.toFixed(2) 
      : currentSpeed.toFixed(1);

  return (
    <div className="relative p-8 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10">
      <h2 className="text-2xl font-bold text-center text-white mb-8">TESTING SPEED</h2>

      {/* Speed Display with enhanced animation */}
      <div className="text-center mb-8">
        <div 
          className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent transition-all duration-300"
          style={{ transform: testing ? 'scale(1.05)' : 'scale(1)' }}
        >
          {formattedSpeed}
        </div>
        <div className="text-gray-400 text-xl mt-2">Mbps</div>
      </div>

      {/* Enhanced Progress Bar with smoother animation */}
      <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 ease-out"
          style={{ 
            width: `${progress}%`,
            boxShadow: testing ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'
          }}
        />
      </div>

      {/* Testing Status with enhanced animation */}
      <div className="text-center mb-4">
        <div className={`font-semibold text-lg transition-all duration-300 ${
          testing ? 'text-blue-400' : 'text-gray-400'
        }`}>
          {testing 
            ? `Testing... ${Math.round(progress)}%` 
            : progress === 100 
              ? 'Test Complete' 
              : 'Ready to start test'
          }
        </div>
      </div>

      {/* Additional information */}
      {!testing && progress === 100 && (
        <div className="text-center text-sm text-gray-500 animate-fadeIn">
          Click "Start Test" to run a new test
        </div>
      )}
    </div>
  );
});

// Add display name for better debugging
SpeedMeter.displayName = 'SpeedMeter';

export default SpeedMeter;

'use client';

import React, { memo } from 'react';

interface SpeedMeterProps {
  downloadProgress: number;
  uploadProgress: number;
  currentSpeed: number;
  testing: boolean;
  results: {
    download: number;
    upload: number;
    ping: number;
  };
}

// Optimize the SpeedMeter component with memoization to prevent unnecessary re-renders
const SpeedMeter = memo(function SpeedMeter({ downloadProgress, uploadProgress, currentSpeed, testing, results }: SpeedMeterProps) {
  // Format the current speed with proper decimal places based on the value
  const formattedSpeed = currentSpeed < 1 
    ? currentSpeed.toFixed(3) 
    : currentSpeed < 10 
      ? currentSpeed.toFixed(2) 
      : currentSpeed.toFixed(1);

  // Determine which test is running
  const isDownloadTesting = testing && downloadProgress > 0 && downloadProgress < 100;
  const isUploadTesting = testing && uploadProgress > 0 && uploadProgress < 100;

  // Calculate iteration number
  const getCurrentIteration = (progress: number): number => {
    return Math.min(50, Math.ceil(progress / 2));
  };

  return (
    <div className="w-full">
      {/* Speed Display with enhanced animation */}
      <div className="text-center mb-8">
        <div 
          className={`text-6xl font-bold transition-all duration-300 ${
            isDownloadTesting 
              ? 'bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'
              : isUploadTesting
                ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
                : 'text-white'
          }`}
          style={{ transform: testing ? 'scale(1.05)' : 'scale(1)' }}
        >
          {formattedSpeed}
        </div>
        <div className="text-gray-400 text-xl mt-2">Mbps</div>
      </div>

      {/* Download Progress Bar */}
      {isDownloadTesting && (
        <div className="mb-4 animate-fadeIn">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              Download Test ({getCurrentIteration(downloadProgress)}/50)
            </span>
            <span className="text-sm text-blue-400">{Math.round(downloadProgress)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 ease-out"
              style={{ 
                width: `${downloadProgress}%`,
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
              }}
            />
          </div>
        </div>
      )}

      {/* Upload Progress Bar */}
      {isUploadTesting && (
        <div className="mb-4 animate-fadeIn">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              Upload Test ({getCurrentIteration(uploadProgress)}/50)
            </span>
            <span className="text-sm text-purple-400">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out"
              style={{ 
                width: `${uploadProgress}%`,
                boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)'
              }}
            />
          </div>
        </div>
      )}

      {/* Testing Status */}
      <div className="text-center mb-4">
        <div className={`font-semibold text-lg transition-all duration-300 ${
          isDownloadTesting 
            ? 'text-blue-400' 
            : isUploadTesting 
              ? 'text-purple-400' 
              : 'text-gray-400'
        }`}>
          {isDownloadTesting
            ? 'Running Download Tests...'
            : isUploadTesting
              ? 'Running Upload Tests...'
              : testing
                ? 'Preparing Test...'
                : downloadProgress === 100 && uploadProgress === 100
                  ? 'Test Complete'
                  : 'Ready to start test'
          }
        </div>
      </div>

      {/* Additional information */}
      {!testing && downloadProgress === 100 && uploadProgress === 100 && (
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

import React from 'react';

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

export default function SpeedMeter({ progress, currentSpeed, testing, results }: SpeedMeterProps) {
  return (
    
    <div className="relative p-8 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10">
      <h2 className="text-2xl font-bold text-center text-white mb-8">TESTING SPEED</h2>

      {/* Speed Display */}
      <div className="text-center mb-8">
        <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          {currentSpeed.toFixed(2)}
        </div>
        <div className="text-gray-400 text-xl mt-2">Mbps</div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Testing Status */}
      <div className="text-center mb-8">
        <div className="text-blue-400 font-semibold text-lg">
          {testing ? `Testing... ${Math.round(progress)}%` : 'Ready to start test'}
        </div>
      </div>
    </div>
  );
}

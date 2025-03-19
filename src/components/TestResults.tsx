'use client';

import React, { memo } from 'react';

interface TestResultsProps {
  results: {
    download: number;
    upload: number;
    ping: number;
    ip: string;
    location: {
      city: string;
      country: string;
      region: string;
    };
    jitter: number;
    latency: number;
    isp: string;
  };
  testing: boolean;
  setError: (error: string | null) => void;
}

// Format a speed value with appropriate precision
const formatSpeed = (speed: number): string => {
  if (speed === 0) return '0.00';
  if (speed < 1) return speed.toFixed(3);
  if (speed < 10) return speed.toFixed(2);
  return speed.toFixed(1);
};

// Format a time value (ms) with appropriate units
const formatTime = (time: number): string => {
  if (time === 0) return '0 ms';
  if (time < 1) return '<1 ms';
  if (time < 100) return `${Math.round(time)} ms`;
  if (time < 1000) return `${Math.round(time)} ms`;
  return `${(time / 1000).toFixed(1)} s`;
};

// Memoized component to prevent unnecessary re-renders
const TestResults = memo(function TestResults({ results, testing, setError }: TestResultsProps) {
  // Calculate speed grade based on download and upload speeds
  const getSpeedGrade = (): string => {
    const avgSpeed = (results.download + results.upload) / 2;
    if (avgSpeed === 0) return '';
    if (avgSpeed > 100) return 'Excellent';
    if (avgSpeed > 50) return 'Very Good';
    if (avgSpeed > 25) return 'Good';
    if (avgSpeed > 10) return 'Fair';
    if (avgSpeed > 5) return 'Poor';
    return 'Very Poor';
  };

  // Get color class based on speed grade
  const getGradeColorClass = (): string => {
    const grade = getSpeedGrade();
    switch (grade) {
      case 'Excellent': return 'text-green-400';
      case 'Very Good': return 'text-green-500';
      case 'Good': return 'text-blue-400';
      case 'Fair': return 'text-yellow-400';
      case 'Poor': return 'text-orange-400';
      case 'Very Poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-center text-white mb-8">Test Results</h2>

      {/* Speed Test Results */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900/50 p-5 rounded-xl border border-white/5 transition-all duration-300 hover:border-blue-500/30 hover:bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Download</span>
            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-blue-400 transition-all duration-300">
            {formatSpeed(results.download)}
            <span className="text-base ml-1">Mbps</span>
          </div>
        </div>

        <div className="bg-gray-900/50 p-5 rounded-xl border border-white/5 transition-all duration-300 hover:border-purple-500/30 hover:bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Upload</span>
            <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-purple-400 transition-all duration-300">
            {formatSpeed(results.upload)}
            <span className="text-base ml-1">Mbps</span>
          </div>
        </div>
      </div>

      {/* Ping, Jitter, Latency */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900/50 p-4 rounded-xl border border-white/5 transition-all duration-300 hover:border-cyan-500/30 hover:bg-gray-800/50">
          <div className="text-gray-400 text-xs mb-1">Ping</div>
          <div className="text-xl font-bold text-cyan-400">
            {formatTime(results.ping)}
          </div>
        </div>

        <div className="bg-gray-900/50 p-4 rounded-xl border border-white/5 transition-all duration-300 hover:border-teal-500/30 hover:bg-gray-800/50">
          <div className="text-gray-400 text-xs mb-1">Jitter</div>
          <div className="text-xl font-bold text-teal-400">
            {formatTime(results.jitter)}
          </div>
        </div>

        <div className="bg-gray-900/50 p-4 rounded-xl border border-white/5 transition-all duration-300 hover:border-indigo-500/30 hover:bg-gray-800/50">
          <div className="text-gray-400 text-xs mb-1">Latency</div>
          <div className="text-xl font-bold text-indigo-400">
            {formatTime(results.latency)}
          </div>
        </div>
      </div>

      {/* Connection Grade */}
      {!testing && (results.download > 0 || results.upload > 0) && (
        <div className="bg-gray-900/50 p-4 rounded-xl border border-white/5 transition-all duration-300 hover:border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-gray-400 text-xs mb-1">Connection Grade</div>
              <div className={`text-xl font-bold ${getGradeColorClass()}`}>
                {getSpeedGrade()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-xs mb-1">Average Speed</div>
              <div className="text-xl font-bold text-white">
                {formatSpeed((results.download + results.upload) / 2)} <span className="text-sm">Mbps</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Information */}
      <div className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
        <div className="text-gray-400 text-xs mb-2">Connection Information</div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">IP Address</span>
            <span className="text-white text-sm font-medium">{results.ip || 'Unknown'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">ISP</span>
            <span className="text-white text-sm font-medium">{results.isp || 'Unknown'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Location</span>
            <span className="text-white text-sm font-medium">
              {results.location.city && results.location.country 
                ? `${results.location.city}, ${results.location.country}`
                : 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Share Results Button */}
      {!testing && (results.download > 0 || results.upload > 0) && (
        <button 
          onClick={() => {
            try {
              const text = `My Internet Speed Test Results:
Download: ${formatSpeed(results.download)} Mbps
Upload: ${formatSpeed(results.upload)} Mbps
Ping: ${formatTime(results.ping)}
ISP: ${results.isp}
Location: ${results.location.city}, ${results.location.country}`;
              
              navigator.clipboard.writeText(text);
              setError('Results copied to clipboard!');
              setTimeout(() => setError(null), 3000);
            } catch (error) {
              console.error('Failed to copy results:', error);
              setError('Failed to copy results to clipboard');
            }
          }}
          className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>Share Results</span>
        </button>
      )}
    </div>
  );
});

// Add display name for better debugging
TestResults.displayName = 'TestResults';

export default TestResults;

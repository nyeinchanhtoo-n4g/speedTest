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
  hasCompletedTest: boolean;
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
const TestResults = memo(function TestResults({ results, testing, setError, hasCompletedTest }: TestResultsProps) {
  return (
    <div className="flex flex-col min-h-[500px]">
      <h2 className="text-xl font-bold text-center text-white mb-8">Test Results</h2>

      <div className="flex-grow space-y-6">
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

        {/* Latency & Jitter */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900/50 p-5 rounded-xl border border-white/5 transition-all duration-300 hover:border-green-500/30 hover:bg-gray-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Ping</span>
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-green-400 transition-all duration-300">
              {formatTime(results.ping)}
            </div>
          </div>

          <div className="bg-gray-900/50 p-5 rounded-xl border border-white/5 transition-all duration-300 hover:border-yellow-500/30 hover:bg-gray-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Jitter</span>
              <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-yellow-400 transition-all duration-300">
              {formatTime(results.jitter)}
            </div>
          </div>
        </div>

        {/* IP and Location */}
        <div className="bg-gray-900/50 p-5 rounded-xl border border-white/5 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">Connection Details</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">IP Address:</span>
              <span className="text-white">{results.ip || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Location:</span>
              <span className="text-white">
                {[results.location.city, results.location.region, results.location.country]
                  .filter(Boolean)
                  .join(', ') || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ISP:</span>
              <span className="text-white">{results.isp || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TestResults;

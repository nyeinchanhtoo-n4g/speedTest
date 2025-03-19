'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SpeedMeter from '@/components/SpeedMeter';
import TestResults from '@/components/TestResults';
import { debounce } from 'lodash';

interface Results {
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
}

// Initial results state
const initialResults: Results = {
  download: 0,
  upload: 0,
  ping: 0,
  ip: '',
  location: {
    city: '',
    country: '',
    region: '',
  },
  jitter: 0,
  latency: 0,
  isp: '',
};

export default function Home() {
  // State management
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [results, setResults] = useState<Results>(initialResults);
  const [error, setError] = useState<string | null>(null);
  const [showSlowConnectionMessage, setShowSlowConnectionMessage] = useState(false);
  
  // Refs for timeouts and abort controllers
  const testTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const speedTestDataRef = useRef<{
    downloadSpeeds: number[];
    uploadSpeeds: number[];
    pings: number[];
  }>({
    downloadSpeeds: [],
    uploadSpeeds: [],
    pings: []
  });

  // Load previous results from localStorage
  useEffect(() => {
    try {
      const lastTest = localStorage.getItem('lastTest');
      if (lastTest) {
        const parsedResults = JSON.parse(lastTest);
        setResults(parsedResults);
      }
    } catch (error) {
      console.error('Error loading previous results:', error);
    }
  }, []);

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (testTimeoutRef.current) clearTimeout(testTimeoutRef.current);
      if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // Handle slow connection detection
  useEffect(() => {
    if (testing) {
      // Set a timeout for 20 seconds
      testTimeoutRef.current = setTimeout(() => {
        if (testing && progress < 90) {
          setShowSlowConnectionMessage(true);
          setError("အင်တာနက်လိုင်း အလွန်နှေးနေပါတယ်");
          
          // Set another timeout to reload the page after 5 seconds
          reloadTimeoutRef.current = setTimeout(() => {
            window.location.reload();
          }, 5000);
        }
      }, 20000);
    } else {
      // Clear the timeout if testing stops
      if (testTimeoutRef.current) {
        clearTimeout(testTimeoutRef.current);
        testTimeoutRef.current = null;
      }
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
        reloadTimeoutRef.current = null;
      }
    }

    return () => {
      if (testTimeoutRef.current) clearTimeout(testTimeoutRef.current);
      if (reloadTimeoutRef.current) clearTimeout(reloadTimeoutRef.current);
    };
  }, [testing, progress]);

  // Optimized ping measurement with abort controller
  const measurePing = useCallback(async (): Promise<number> => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    try {
      const start = Date.now();
      const response = await fetch('/api/speedtest/ping', { signal });
      
      if (!response.ok) throw new Error('Ping failed');
      
      const data = await response.json();
      return data.duration || (Date.now() - start);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Ping measurement aborted');
        return 0;
      }
      console.error('Ping measurement failed:', error);
      throw error;
    }
  }, []);

  // Optimized download measurement with abort controller
  const measureDownload = useCallback(async (): Promise<number> => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    try {
      const startTime = Date.now();
      const response = await fetch('/api/speedtest/download', { signal });
      
      if (!response.ok) throw new Error('Download failed');
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Stream not available');

      let bytesReceived = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytesReceived += value.length;
      }

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // Convert to seconds
      const bitsPerSecond = (bytesReceived * 8) / duration;
      const mbps = bitsPerSecond / (1024 * 1024); // Convert to Mbps

      return mbps;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Download measurement aborted');
        return 0;
      }
      console.error('Download measurement failed:', error);
      throw error;
    }
  }, []);

  // Optimized upload measurement with abort controller
  const measureUpload = useCallback(async (): Promise<number> => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    try {
      // Create 5MB of random data for more accurate testing
      const size = 5 * 1024 * 1024;
      const data = new Uint8Array(size);
      
      // Fill with random data in chunks
      const chunkSize = 64 * 1024;
      for (let i = 0; i < size; i += chunkSize) {
        const end = Math.min(i + chunkSize, size);
        for (let j = i; j < end; j++) {
          data[j] = Math.floor(Math.random() * 256);
        }
      }

      const start = Date.now();
      const response = await fetch('/api/speedtest/upload', {
        method: 'POST',
        body: data,
        signal
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const result = await response.json();
      return result.speed;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Upload measurement aborted');
        return 0;
      }
      console.error('Upload measurement failed:', error);
      throw error;
    }
  }, []);

  // Debounced function to update results to prevent too many re-renders
  const updateResults = useCallback(debounce((newResults: Partial<Results>) => {
    setResults(prev => ({
      ...prev,
      ...newResults
    }));
  }, 300), []);

  // Start the speed test
  const startTest = useCallback(async () => {
    // Reset state
    setTesting(true);
    setProgress(0);
    setError(null);
    setShowSlowConnectionMessage(false);
    setCurrentSpeed(0);
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    // Reset speed test data
    speedTestDataRef.current = {
      downloadSpeeds: [],
      uploadSpeeds: [],
      pings: []
    };

    try {
      // Get IP data
      const ipResponse = await fetch('/api/ip', {
        signal: abortControllerRef.current.signal
      });
      
      if (!ipResponse.ok) {
        throw new Error('Failed to fetch IP data');
      }
      
      const ipData = await ipResponse.json();
      
      updateResults({
        ip: ipData.ip,
        location: {
          city: ipData.city || 'Unknown',
          country: ipData.country || 'Unknown',
          region: ipData.region || 'Unknown',
        },
        isp: ipData.isp || ipData.org || 'Unknown'
      });

      // Measure ping (5 times for accuracy)
      setProgress(10);
      const pings = [];
      
      for (let i = 0; i < 5; i++) {
        const pingResult = await measurePing();
        pings.push(pingResult);
        speedTestDataRef.current.pings.push(pingResult);
      }
      
      const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
      const jitter = Math.max(...pings) - Math.min(...pings);

      updateResults({
        ping: avgPing,
        jitter: jitter,
        latency: avgPing
      });

      // Measure download (30 times for accuracy)
      setProgress(30);
      let totalDownloadSpeed = 0;
      const downloadMeasurements = 30;
      
      for (let i = 0; i < downloadMeasurements; i++) {
        const speed = await measureDownload();
        totalDownloadSpeed += speed;
        speedTestDataRef.current.downloadSpeeds.push(speed);
        
        setCurrentSpeed(speed);
        setProgress(30 + (i * 40 / downloadMeasurements));
        
        // Update results periodically
        if ((i + 1) % 5 === 0 || i === downloadMeasurements - 1) {
          const currentAvgDownload = totalDownloadSpeed / (i + 1);
          updateResults({ download: currentAvgDownload });
        }
      }

      // Measure upload (30 times for accuracy)
      setProgress(70);
      let totalUploadSpeed = 0;
      const uploadMeasurements = 30;
      
      for (let i = 0; i < uploadMeasurements; i++) {
        const speed = await measureUpload();
        totalUploadSpeed += speed;
        speedTestDataRef.current.uploadSpeeds.push(speed);
        
        setCurrentSpeed(speed);
        setProgress(70 + (i * 30 / uploadMeasurements));
        
        // Update results periodically
        if ((i + 1) % 5 === 0 || i === uploadMeasurements - 1) {
          const currentAvgUpload = totalUploadSpeed / (i + 1);
          updateResults({ upload: currentAvgUpload });
        }
      }

      // Calculate final results
      const finalDownload = speedTestDataRef.current.downloadSpeeds.reduce((a, b) => a + b, 0) / 
                            speedTestDataRef.current.downloadSpeeds.length;
      const finalUpload = speedTestDataRef.current.uploadSpeeds.reduce((a, b) => a + b, 0) / 
                          speedTestDataRef.current.uploadSpeeds.length;

      // Set final results
      const finalResults = {
        download: finalDownload,
        upload: finalUpload,
        ping: avgPing,
        ip: ipData.ip || '',  // Ensure IP is included
        location: {
          city: ipData.city || 'Unknown',
          country: ipData.country || 'Unknown',
          region: ipData.region || 'Unknown',
        },
        jitter: jitter,
        latency: avgPing,
        isp: ipData.isp || ipData.org || 'Unknown',
      };
      
      setResults(finalResults);
      localStorage.setItem('lastTest', JSON.stringify(finalResults));
    } catch (error) {
      console.error('Test failed:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('Test was cancelled');
        } else {
          setError(error.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      // Clean up
      setTesting(false);
      setProgress(100);
      
      if (testTimeoutRef.current) {
        clearTimeout(testTimeoutRef.current);
        testTimeoutRef.current = null;
      }
      
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
        reloadTimeoutRef.current = null;
      }
      
      if (abortControllerRef.current) {
        abortControllerRef.current = null;
      }
    }
  }, [measureDownload, measurePing, measureUpload, updateResults]);

  // Memoized UI elements for better performance
  const speedMeterComponent = useMemo(() => (
    <SpeedMeter
      progress={progress}
      currentSpeed={currentSpeed}
      testing={testing}
      results={results}
    />
  ), [progress, currentSpeed, testing, results]);

  const testResultsComponent = useMemo(() => (
    <TestResults
      results={results}
      testing={testing}
      setError={setError}
    />
  ), [results, testing]);

  return (
    <main className="min-h-screen bg-gray-900 text-white antialiased p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Internet Speed Testing
        </h1>

        {/* Slow Connection Message */}
        {showSlowConnectionMessage && (
          <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-yellow-400 text-center">
            <p className="text-lg font-medium">အင်တာနက်လိုင်း အလွန်နှေးနေပါတယ်</p>
            <p className="mt-2">စာမျက်နှာကို ၅ စက္ကန့်အတွင်း ပြန်လည်ဖွင့်ပေးပါမည်...</p>
          </div>
        )}

        {/* Responsive Layout Container */}
        <div className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0">
          {/* Left Side - Speed Meter and Button */}
          <div className="w-full md:w-1/2">
            <div className="h-full relative p-8 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col">
              {speedMeterComponent}
              
              {/* Test Button */}
              <div className="mt-auto pt-8">
                <button
                  onClick={startTest}
                  disabled={testing}
                  className={`w-full px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300
                    ${testing ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 hover:shadow-lg'}`}
                >
                  {testing ? 'Testing...' : 'Start Test'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Test Results */}
          <div className="w-full md:w-1/2">
            <div className="h-full relative p-8 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10">
              {testResultsComponent}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && !showSlowConnectionMessage && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}

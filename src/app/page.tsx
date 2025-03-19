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

// Constants for test configuration
const TEST_CONFIG = {
  ITERATIONS: 10,
  TIMEOUT_MS: 10000,
  DELAY_BETWEEN_TESTS_MS: 100,
  UPLOAD_SIZE: 1 * 1024 * 1024, // 1MB
  MIN_VALID_SPEED: 0.1, // 0.1 Mbps
  MAX_REASONABLE_SPEED: 10000, // 10 Gbps
  IQR_MULTIPLIER: 1.5, // For outlier detection
};

// Helper function to calculate statistics
function calculateStats(speeds: number[]) {
  const sortedSpeeds = [...speeds].sort((a, b) => a - b);
  const q1Index = Math.floor(sortedSpeeds.length * 0.25);
  const q3Index = Math.floor(sortedSpeeds.length * 0.75);
  const q1 = sortedSpeeds[q1Index];
  const q3 = sortedSpeeds[q3Index];
  const iqr = q3 - q1;
  const lowerBound = q1 - TEST_CONFIG.IQR_MULTIPLIER * iqr;
  const upperBound = q3 + TEST_CONFIG.IQR_MULTIPLIER * iqr;
  
  const filteredSpeeds = sortedSpeeds.filter(speed => 
    speed >= Math.max(lowerBound, TEST_CONFIG.MIN_VALID_SPEED) && 
    speed <= Math.min(upperBound, TEST_CONFIG.MAX_REASONABLE_SPEED)
  );
  
  const average = filteredSpeeds.reduce((a, b) => a + b, 0) / filteredSpeeds.length;
  const median = filteredSpeeds[Math.floor(filteredSpeeds.length / 2)];
  
  return {
    average,
    median,
    min: filteredSpeeds[0],
    max: filteredSpeeds[filteredSpeeds.length - 1],
    validCount: speeds.length,
    filteredCount: filteredSpeeds.length,
  };
}

// Helper function to log test progress
function logTestProgress(type: string, iteration: number, total: number, speed: number, stats?: any) {
  console.log(`${type} iteration ${iteration + 1}/${total}: ${speed.toFixed(2)} Mbps`);
  if (stats) {
    console.log(`${type} test completed:`, {
      ...stats,
      average: stats.average.toFixed(2) + ' Mbps',
      median: stats.median.toFixed(2) + ' Mbps',
      min: stats.min.toFixed(2) + ' Mbps',
      max: stats.max.toFixed(2) + ' Mbps',
    });
  }
}

export default function Home() {
  // State management
  const [testing, setTesting] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [results, setResults] = useState<Results>(initialResults);
  const [error, setError] = useState<string | null>(null);
  const [showSlowConnectionMessage, setShowSlowConnectionMessage] = useState(false);
  const [hasCompletedTest, setHasCompletedTest] = useState(false);
  
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

  // Load previous results from localStorage only if needed for reference
  useEffect(() => {
    try {
      const lastTest = localStorage.getItem('lastTest');
      if (lastTest) {
        // Store in results but don't show until a new test is completed
        const parsedResults = JSON.parse(lastTest);
        // Don't update the UI with these results
        // We'll only show results after a test is completed in this session
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
        if (testing && downloadProgress < 90 && uploadProgress < 90) {
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
  }, [testing, downloadProgress, uploadProgress]);

  // Helper function to add cache-busting parameter to URLs
  const addCacheBuster = useCallback((url: string) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_=${Date.now()}`;
  }, []);

  // Helper function to log progress
  const logProgress = useCallback((phase: string, progress: number, speed: number) => {
    console.log(`${phase} - Progress: ${progress.toFixed(2)}%, Speed: ${speed.toFixed(2)} Mbps`);
  }, []);

  // Helper function to calculate average
  const calculateAverage = useCallback((numbers: number[]): number => {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }, []);

  // Helper function to delay execution
  const delay = useCallback((ms: number) => new Promise(resolve => setTimeout(resolve, ms)), []);

  // Helper function to generate random data
  const generateRandomData = (size: number): Uint8Array => {
    const data = new Uint8Array(size);
    const pattern = new Uint8Array(1024); // 1KB pattern
    for (let i = 0; i < pattern.length; i++) {
      pattern[i] = Math.floor(Math.random() * 256);
    }
    
    // Repeat the pattern to fill the entire buffer
    for (let i = 0; i < size; i += pattern.length) {
      data.set(pattern.slice(0, Math.min(pattern.length, size - i)), i);
    }
    return data;
  };

  // Helper function to measure a single download test
  const singleDownloadTest = useCallback(async (signal: AbortSignal): Promise<number> => {
    const response = await fetch(addCacheBuster('/api/speedtest/download'), { 
      signal,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) throw new Error('Download failed');
    
    const startTime = Date.now();
    let bytesReceived = 0;
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Stream not available');

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytesReceived += value.length;
      }
    } finally {
      reader.releaseLock();
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds
    if (duration <= 0 || bytesReceived <= 0) throw new Error('Invalid measurement');
    return (bytesReceived * 8) / duration / (1024 * 1024); // Convert to Mbps
  }, [addCacheBuster]);

  // Helper function to measure a single upload test
  const singleUploadTest = useCallback(async (blob: Blob, signal: AbortSignal): Promise<number> => {
    const formData = new FormData();
    formData.append('file', blob, 'speedtest.dat');

    const response = await fetch(addCacheBuster('/api/speedtest/upload'), {
      method: 'POST',
      body: formData,
      signal,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Upload failed');
    }
    
    const data = await response.json();
    if (!data.metrics || typeof data.metrics.mbps !== 'number') {
      throw new Error('Invalid server response');
    }

    return data.metrics.mbps;
  }, [addCacheBuster]);

  // Optimized download measurement with multiple iterations
  const measureDownload = useCallback(async (onProgress: (progress: number) => void): Promise<number> => {
    const controller = new AbortController();
    const signal = controller.signal;
    const speeds: number[] = [];
    
    try {
      console.log('Starting download test with', TEST_CONFIG.ITERATIONS, 'iterations...');
      
      for (let i = 0; i < TEST_CONFIG.ITERATIONS; i++) {
        try {
          // Create a new controller for each test
          const testController = new AbortController();
          const testSignal = testController.signal;
          
          // Add a timeout for each test
          const timeoutId = setTimeout(() => testController.abort(), TEST_CONFIG.TIMEOUT_MS);
          
          const speed = await singleDownloadTest(testSignal);
          clearTimeout(timeoutId);
          
          if (speed >= TEST_CONFIG.MIN_VALID_SPEED && speed <= TEST_CONFIG.MAX_REASONABLE_SPEED) {
            speeds.push(speed);
            setCurrentSpeed(speed);
            onProgress((i + 1) * (100 / TEST_CONFIG.ITERATIONS));
            logTestProgress('Download', i, TEST_CONFIG.ITERATIONS, speed);
          }
          
          // Add a small delay between tests
          if (i < TEST_CONFIG.ITERATIONS - 1) {
            await delay(TEST_CONFIG.DELAY_BETWEEN_TESTS_MS);
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            if (signal.aborted) throw error; // Only rethrow if main controller was aborted
            console.warn(`Download iteration ${i + 1} timed out`);
          } else {
            console.warn(`Download iteration ${i + 1} failed:`, error);
          }
          // Continue with next iteration on error
          continue;
        }
      }

      if (speeds.length === 0) {
        throw new Error('All download tests failed');
      }

      const stats = calculateStats(speeds);
      logTestProgress('Download', TEST_CONFIG.ITERATIONS, TEST_CONFIG.ITERATIONS, stats.average, stats);
      return stats.average;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Download measurement aborted');
        return 0;
      }
      console.error('Download measurement failed:', error);
      throw error;
    }
  }, [setCurrentSpeed, singleDownloadTest, delay]);

  // Optimized upload measurement with multiple iterations
  const measureUpload = useCallback(async (onProgress: (progress: number) => void): Promise<number> => {
    const controller = new AbortController();
    const signal = controller.signal;
    const speeds: number[] = [];
    
    try {
      console.log('Starting upload test with', TEST_CONFIG.ITERATIONS, 'iterations...');
      
      // Create test data once using the pattern method
      const data = generateRandomData(TEST_CONFIG.UPLOAD_SIZE);
      const blob = new Blob([data]);

      for (let i = 0; i < TEST_CONFIG.ITERATIONS; i++) {
        try {
          // Create a new controller for each test
          const testController = new AbortController();
          const testSignal = testController.signal;
          
          // Add a timeout for each test
          const timeoutId = setTimeout(() => testController.abort(), TEST_CONFIG.TIMEOUT_MS);
          
          const speed = await singleUploadTest(blob, testSignal);
          clearTimeout(timeoutId);
          
          if (speed >= TEST_CONFIG.MIN_VALID_SPEED && speed <= TEST_CONFIG.MAX_REASONABLE_SPEED) {
            speeds.push(speed);
            setCurrentSpeed(speed);
            onProgress((i + 1) * (100 / TEST_CONFIG.ITERATIONS));
            logTestProgress('Upload', i, TEST_CONFIG.ITERATIONS, speed);
          }
          
          // Add a small delay between tests
          if (i < TEST_CONFIG.ITERATIONS - 1) {
            await delay(TEST_CONFIG.DELAY_BETWEEN_TESTS_MS);
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            if (signal.aborted) throw error; // Only rethrow if main controller was aborted
            console.warn(`Upload iteration ${i + 1} timed out`);
          } else {
            console.warn(`Upload iteration ${i + 1} failed:`, error);
          }
          // Continue with next iteration on error
          continue;
        }
      }

      if (speeds.length === 0) {
        throw new Error('All upload tests failed');
      }

      const stats = calculateStats(speeds);
      logTestProgress('Upload', TEST_CONFIG.ITERATIONS, TEST_CONFIG.ITERATIONS, stats.average, stats);
      return stats.average;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Upload measurement aborted');
        return 0;
      }
      console.error('Upload measurement failed:', error);
      throw error;
    }
  }, [setCurrentSpeed, singleUploadTest, delay]);

  // Optimized ping measurement with abort controller
  const measurePing = useCallback(async (): Promise<number> => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    try {
      const start = Date.now();
      const response = await fetch(addCacheBuster('/api/speedtest/ping'), { 
        signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
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
  }, [addCacheBuster]);

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
    setError(null);
    setShowSlowConnectionMessage(false);
    setDownloadProgress(0);
    setUploadProgress(0);
    setCurrentSpeed(0);
    
    // Reset results to initial state at the start of a new test
    setResults(initialResults);
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    // Reset speed test data
    speedTestDataRef.current = {
      downloadSpeeds: [],
      uploadSpeeds: [],
      pings: []
    };

    try {
      console.log('Starting speed test...');
      // Get IP data
      const ipResponse = await fetch(addCacheBuster('/api/ip'), {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!ipResponse.ok) {
        throw new Error('Failed to fetch IP data');
      }
      
      const ipData = await ipResponse.json();
      console.log('IP data retrieved:', ipData);
      
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
      console.log('Measuring ping...');
      const pings = [];
      
      for (let i = 0; i < 5; i++) {
        const pingResult = await measurePing();
        pings.push(pingResult);
        speedTestDataRef.current.pings.push(pingResult);
      }
      
      const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
      const jitter = Math.max(...pings) - Math.min(...pings);
      console.log('Ping results:', { avgPing, jitter });

      updateResults({
        ping: avgPing,
        jitter: jitter,
        latency: avgPing
      });

      // Measure download speed
      console.log('Starting download test...');
      const downloadSpeed = await measureDownload((progress) => {
        setDownloadProgress(progress);
      });
      speedTestDataRef.current.downloadSpeeds.push(downloadSpeed);
      updateResults({ download: downloadSpeed });
      console.log('Download test completed:', downloadSpeed.toFixed(2), 'Mbps');

      // Reset current speed before upload test
      setCurrentSpeed(0);

      // Measure upload speed
      console.log('Starting upload test...');
      const uploadSpeed = await measureUpload((progress) => {
        setUploadProgress(progress);
      });
      speedTestDataRef.current.uploadSpeeds.push(uploadSpeed);
      updateResults({ upload: uploadSpeed });
      console.log('Upload test completed:', uploadSpeed.toFixed(2), 'Mbps');

      // Set final results
      const finalResults = {
        download: downloadSpeed,
        upload: uploadSpeed,
        ping: avgPing,
        ip: ipData.ip || '',
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
      setHasCompletedTest(true);
      localStorage.setItem('lastTest', JSON.stringify(finalResults));
      console.log('Speed test completed successfully:', finalResults);
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
      setCurrentSpeed(0);
      
      if (testTimeoutRef.current) {
        clearTimeout(testTimeoutRef.current);
      }
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [addCacheBuster, measureDownload, measurePing, measureUpload, updateResults]);

  // Memoized UI elements for better performance
  const speedMeterComponent = useMemo(() => (
    <SpeedMeter
      downloadProgress={downloadProgress}
      uploadProgress={uploadProgress}
      currentSpeed={currentSpeed}
      testing={testing}
      results={results}
    />
  ), [downloadProgress, uploadProgress, currentSpeed, testing, results]);

  const testResultsComponent = useMemo(() => (
    <TestResults
      results={results}
      testing={testing}
      setError={setError}
      hasCompletedTest={downloadProgress === 100 && uploadProgress === 100}
    />
  ), [results, testing, downloadProgress, uploadProgress]);

  return (
    <main className="min-h-screen bg-gray-900 text-white antialiased p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 animate-fadeIn">
            Internet Speed Test
          </h1>
          <p className="text-gray-400 animate-slideUp">
            Test your connection speed with our optimized speed test tool
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side - Speed Meter */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-8">
            <div className="flex flex-col min-h-[500px]">
              <div className="flex-grow flex flex-col items-center justify-center py-8">
                {speedMeterComponent}
              </div>
              
              {testing && (
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-blue-400 mb-2">Testing Speed</h3>
                  <p className="text-gray-400">Please wait while we measure your connection...</p>
                </div>
              )}
              
              <div className="mt-auto">
                <button
                  onClick={startTest}
                  disabled={testing}
                  className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 ${
                    testing
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {testing ? 'Testing...' : 'Start Test'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Test Results */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-8 min-h-[500px]">
            {testResultsComponent}
          </div>
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 animate-fadeIn">
            <p className="font-semibold">Error: {error}</p>
            {showSlowConnectionMessage && (
              <p className="mt-2 text-sm">
                The page will reload automatically in a few seconds...
              </p>
            )}
          </div>
        )}

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p> {new Date().getFullYear()} Internet Speed Test. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}

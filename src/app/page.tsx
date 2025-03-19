'use client';

import { useState } from 'react';
import SpeedMeter from '@/components/SpeedMeter';
import TestResults from '@/components/TestResults';

export default function Home() {
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [results, setResults] = useState({
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
  });
  const [error, setError] = useState<string | null>(null);

  const measurePing = async () => {
    try {
      const start = Date.now();
      const response = await fetch('/api/speedtest/ping');
      if (!response.ok) throw new Error('Ping failed');
      return Date.now() - start;
    } catch (error) {
      console.error('Ping measurement failed:', error);
      throw error;
    }
  };

  const measureDownload = async (): Promise<number> => {
    try {
      const startTime = Date.now();
      
      // Fetch the data
      const response = await fetch('/api/speedtest/download');
      if (!response.ok) throw new Error('Download failed');
      
      // Read the response as a stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Stream not available');

      let bytesReceived = 0;
      
      // Read the stream chunks
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
      console.error('Download measurement failed:', error);
      throw error;
    }
  };

  const measureUpload = async () => {
    try {
      // Create 1MB of random data
      const size = 1024 * 1024;
      const data = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        data[i] = Math.floor(Math.random() * 256);
      }

      const start = Date.now();
      const response = await fetch('/api/speedtest/upload', {
        method: 'POST',
        body: data,
      });
      if (!response.ok) throw new Error('Upload failed');
      const result = await response.json();
      return result.speed;
    } catch (error) {
      console.error('Upload measurement failed:', error);
      throw error;
    }
  };

  const startTest = async () => {
    setTesting(true);
    setProgress(0);
    setError(null);

    try {
      // Get IP data
      const ipResponse = await fetch('/api/ip');
      if (!ipResponse.ok) {
        throw new Error('Failed to fetch IP data');
      }
      const ipData = await ipResponse.json();

      // Measure ping
      setProgress(10);
      const pings = [];
      for (let i = 0; i < 5; i++) {
        pings.push(await measurePing());
      }
      const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
      const jitter = Math.max(...pings) - Math.min(...pings);

      // Measure download and update results immediately
      setProgress(30);
      let totalSpeed = 0;
      let downloadResults = [];
      
      for (let i = 0; i < 50; i++) {
        const speed = await measureDownload();
        totalSpeed += speed;
        downloadResults.push(speed);
        setCurrentSpeed(speed);
        setProgress(40 + i * 0.2);
        
        // Update results after every 5 measurements
        if ((i + 1) % 5 === 0) {
          const currentAvgDownload = totalSpeed / (i + 1);
          setResults(prev => ({
            ...prev,
            download: currentAvgDownload,
            ping: avgPing,
            ip: ipData.ip,
            location: {
              city: ipData.city || 'Unknown',
              country: ipData.country || 'Unknown',
              region: ipData.region || 'Unknown',
            },
            jitter: jitter,
            latency: avgPing,
            isp: ipData.isp || 'Unknown',
          }));
        }
      }
      const avgDownload = totalSpeed / 50;

      // Measure upload
      setProgress(70);
      totalSpeed = 0;
      let uploadResults = [];
      
      for (let i = 0; i < 50; i++) {
        const speed = await measureUpload();
        totalSpeed += speed;
        uploadResults.push(speed);
        setCurrentSpeed(speed);
        setProgress(80 + i * 0.2);
        
        // Update results after every 5 measurements
        if ((i + 1) % 5 === 0) {
          const currentAvgUpload = totalSpeed / (i + 1);
          setResults(prev => ({
            ...prev,
            upload: currentAvgUpload,
          }));
        }
      }
      const avgUpload = totalSpeed / 50;

      // Final results update
      setResults(prev => ({
        ...prev,
        download: avgDownload,
        upload: avgUpload,
        ping: avgPing,
        ip: ipData.ip,
        location: {
          city: ipData.city || 'Unknown',
          country: ipData.country || 'Unknown',
          region: ipData.region || 'Unknown',
        },
        jitter: jitter,
        latency: avgPing,
        isp: ipData.isp || 'Unknown',
      }));

      localStorage.setItem('lastTest', JSON.stringify(results));
    } catch (error) {
      console.error('Speed test failed:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setTesting(false);
      setProgress(100);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white antialiased">
      <div className="flex flex-col items-center justify-center p-5">
        <h1 className="text-3xl font-bold text-center mb-6">
          Network Speed Test
        </h1>

        <div className="max-w-lg w-full">
          <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
            <SpeedMeter
              progress={progress}
              currentSpeed={currentSpeed}
              testing={testing}
            />

            <div className="flex flex-col items-center mt-5">
              {error && <div className="text-red-500 mb-3">{error}</div>}
              <button
                onClick={startTest}
                disabled={testing}
                className={`
                  py-2 px-8 rounded-full font-bold transition-all
                  ${
                    testing
                      ? 'bg-gray-700 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }
                `}
              >
                {testing ? 'Testing...' : 'Start Test'}
              </button>
            </div>
          </div>

          <TestResults
            results={results}
            testing={testing}
            startTest={startTest}
            setError={setError}
          />
        </div>
      </div>
    </main>
  );
}

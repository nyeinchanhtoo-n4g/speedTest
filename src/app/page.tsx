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

  const measureDownload = async () => {
    try {
      const start = Date.now();
      const response = await fetch('/api/speedtest/download');
      if (!response.ok) throw new Error('Download failed');
      const data = await response.arrayBuffer();
      const end = Date.now();
      const duration = (end - start) / 1000; // seconds
      const bytes = data.byteLength;
      const bits = bytes * 8;
      const speedMbps = bits / (1024 * 1024) / duration;
      return speedMbps;
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

      // Measure download
      setProgress(30);
      let totalSpeed = 0;
      for (let i = 0; i < 3; i++) {
        const speed = await measureDownload();
        totalSpeed += speed;
        setCurrentSpeed(speed);
        setProgress(40 + i * 10);
      }
      const avgDownload = totalSpeed / 3;

      // Measure upload
      setProgress(70);
      totalSpeed = 0;
      for (let i = 0; i < 3; i++) {
        const speed = await measureUpload();
        totalSpeed += speed;
        setCurrentSpeed(speed);
        setProgress(80 + i * 10);
      }
      const avgUpload = totalSpeed / 3;

      setResults({
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
      });

      localStorage.setItem('lastTest', JSON.stringify(results));
    } catch (error) {
      console.error('Test failed:', error);
      setError('Failed to complete the speed test. Please try again.');
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
            startTest={startTest}
            setError={setError}
          />
        </div>
      </div>
    </main>
  );
}

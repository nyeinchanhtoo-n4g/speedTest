import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // Use more efficient stream processing
    let bytesReceived = 0;
    const reader = request.body?.getReader();

    if (!reader) {
      throw new Error('Request body stream not available');
    }

    try {
      // Process data in chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytesReceived += value.length;
      }
    } finally {
      reader.releaseLock();
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // Convert ms to seconds

    // Validate measurements
    if (duration <= 0 || bytesReceived <= 0) {
      throw new Error('Invalid measurement values');
    }

    const bitsPerSecond = (bytesReceived * 8) / duration;
    const mbps = bitsPerSecond / (1024 * 1024);

    // Return detailed metrics for better analysis
    return NextResponse.json({
      status: 'success',
      size: bytesReceived,
      duration: duration,
      speed: mbps,
      timestamp: endTime,
      metrics: {
        bytesReceived,
        durationMs: endTime - startTime,
        startTime,
        endTime,
        bitsPerSecond,
        mbps,
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Upload test failed:', error);
    return NextResponse.json({ 
      error: 'Upload test failed', 
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  }
}

const measurePing = async () => {
  const start = Date.now();
  const response = await fetch('/api/speedtest/ping');
  return Date.now() - start;  // ping time in milliseconds
};

import { NextResponse } from 'next/server';

// Constants for upload test configuration
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB limit
const MIN_UPLOAD_SIZE = 1 * 1024; // 1MB minimum

// Helper function to calculate speed metrics
function calculateMetrics(bytesReceived: number, startTime: number, endTime: number) {
  const duration = (endTime - startTime) / 1000; // Convert ms to seconds
  const bitsPerSecond = (bytesReceived * 8) / duration;
  const mbps = bitsPerSecond / (1024 * 1024);

  return {
    bytesReceived,
    duration,
    durationMs: endTime - startTime,
    startTime,
    endTime,
    bitsPerSecond,
    mbps,
  };
}

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // Get content length if available
    const contentLength = request.headers.get('content-length');
    if (contentLength) {
      const size = parseInt(contentLength);
      if (size > MAX_UPLOAD_SIZE) {
        throw new Error('Upload size too large');
      }
      if (size < MIN_UPLOAD_SIZE) {
        throw new Error('Upload size too small');
      }
    }

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

        // Check size limit during streaming
        if (bytesReceived > MAX_UPLOAD_SIZE) {
          throw new Error('Upload size exceeded limit');
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Validate final size
    if (bytesReceived < MIN_UPLOAD_SIZE) {
      throw new Error('Upload size too small');
    }

    const endTime = Date.now();
    const metrics = calculateMetrics(bytesReceived, startTime, endTime);

    // Validate measurements
    if (metrics.duration <= 0 || metrics.bytesReceived <= 0) {
      throw new Error('Invalid measurement values');
    }

    // Return detailed metrics for better analysis
    return NextResponse.json({
      status: 'success',
      size: bytesReceived,
      duration: metrics.duration,
      speed: metrics.mbps,
      timestamp: endTime,
      metrics
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Upload test failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({ 
      error: 'Upload test failed', 
      message: errorMessage,
      timestamp: Date.now()
    }, { 
      status: errorMessage.includes('size') ? 413 : 500, // Use proper status code for size errors
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

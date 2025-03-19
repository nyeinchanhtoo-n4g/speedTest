import { NextResponse } from 'next/server';

// Constants for download test configuration
const DOWNLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const CHUNK_SIZE = 64 * 1024; // 64KB chunks
const BUFFER_POOL = new Map<number, Uint8Array>();

// Pre-generate random data buffers for reuse
function getOrCreateBuffer(size: number): Uint8Array {
  let buffer = BUFFER_POOL.get(size);
  if (!buffer) {
    buffer = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
    BUFFER_POOL.set(size, buffer);
  }
  return buffer;
}

// Optimized download endpoint with buffer reuse
export async function GET() {
  try {
    // Get pre-generated data from pool
    const data = getOrCreateBuffer(DOWNLOAD_SIZE);

    // Return the data as a stream with appropriate headers
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': DOWNLOAD_SIZE.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Download test failed:', error);
    return NextResponse.json({ error: 'Download test failed' }, { status: 500 });
  }
}

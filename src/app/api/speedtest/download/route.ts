// import { NextResponse } from 'next/server';

// export async function GET() {
//   // Generate a random buffer of 1MB
//   const size = 1024 * 1024; // 1MB
//   const buffer = Buffer.alloc(size);

//   return new NextResponse(buffer, {
//     headers: {
//       'Content-Type': 'application/octet-stream',
//       'Content-Length': size.toString(),
//       'Cache-Control': 'no-store',
//     },
//   });
// }

/////

import { NextResponse } from 'next/server';

// Optimized download endpoint with larger data size and better error handling
export async function GET() {
  try {
    // Generate 5MB of random data for more accurate speed measurement
    const size = 5 * 1024 * 1024; // 5MB in bytes
    
    // Use a more efficient method to generate random data
    const chunkSize = 1024 * 64; // 64KB chunks for better memory efficiency
    const chunks = Math.ceil(size / chunkSize);
    const data = new Uint8Array(size);
    
    // Fill data in chunks to avoid blocking the event loop
    for (let i = 0; i < chunks; i++) {
      const offset = i * chunkSize;
      const length = Math.min(chunkSize, size - offset);
      const chunk = data.subarray(offset, offset + length);
      
      // Fill with random data
      for (let j = 0; j < length; j++) {
        chunk[j] = Math.floor(Math.random() * 256);
      }
    }

    // Return the data as a stream with appropriate headers
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': size.toString(),
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

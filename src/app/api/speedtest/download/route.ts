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

export async function GET() {
  try {
    // Generate 1MB of random data
    const size = 1024 * 1024; // 1MB in bytes
    const data = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = Math.floor(Math.random() * 256);
    }

    // Return the data as a stream
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': size.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}

// import { NextResponse } from 'next/server';

// export async function POST(request: Request) {
//   const startTime = Date.now();

//   try {
//     const data = await request.arrayBuffer();
//     const endTime = Date.now();
//     const duration = endTime - startTime;
//     const bytes = data.byteLength;
//     const bitsPerSecond = (bytes * 8) / (duration / 1000);
//     const mbps = bitsPerSecond / (1024 * 1024);

//     return NextResponse.json({
//       status: 'ok',
//       size: bytes,
//       duration: duration,
//       speed: mbps,
//     });
//   } catch (error) {
//     return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    let bytesReceived = 0;
    const reader = request.body?.getReader();

    if (reader) {
      let chunk;
      while (!(chunk = await reader.read()).done) {
        bytesReceived += chunk.value.length;
      }
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // Convert ms to seconds
    const bitsPerSecond = (bytesReceived * 8) / duration;
    const mbps = bitsPerSecond / (1024 * 1024);

    return NextResponse.json({
      status: 'ok',
      size: bytesReceived,
      duration: duration,
      speed: mbps,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

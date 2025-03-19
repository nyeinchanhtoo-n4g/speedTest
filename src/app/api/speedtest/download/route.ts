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
  const size = 300 * 1 * 1;
  const buffer = Buffer.alloc(size);

  // Simulate real-world network delay (optional)
  await new Promise((resolve) => setTimeout(resolve, 300));

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': size.toString(),
      'Cache-Control': 'no-store',
    },
  });
}

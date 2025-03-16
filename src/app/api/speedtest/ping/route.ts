import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();

  return NextResponse.json({
    timestamp: startTime,
    status: 'ok',
  });
}

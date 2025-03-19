import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Simulate a small processing delay to ensure accurate timing
    await new Promise(resolve => setTimeout(resolve, 5));
    
    const endTime = Date.now();
    
    return NextResponse.json({
      timestamp: startTime,
      endTimestamp: endTime,
      duration: endTime - startTime,
      status: 'success',
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Ping test failed:', error);
    return NextResponse.json({ 
      error: 'Ping test failed',
      timestamp: Date.now()
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  }
}

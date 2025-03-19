import { NextResponse } from 'next/server';

const TOKEN = '8c177fe43ad724';

export async function GET() {
  try {
    // Use ipinfo.io service with token
    const response = await fetch(`https://ipinfo.io/json?token=${TOKEN}`);
    const data = await response.json();

    return NextResponse.json({
      ip: data.ip,
      city: data.city,
      country: data.country,
      region: data.region,
      isp: data.org, // ISP/Organization information
      latitude: data.loc ? data.loc.split(',')[0] : null,
      longitude: data.loc ? data.loc.split(',')[1] : null
    });
  } catch (error) {
    console.error('Failed to fetch IP data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch IP information' },
      { status: 500 }
    );
  }
}

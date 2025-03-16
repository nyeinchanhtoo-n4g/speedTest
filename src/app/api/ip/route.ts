import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Using a more reliable free API
    const response = await fetch('https://api64.ipify.org?format=json');
    if (!response.ok) {
      throw new Error('Failed to fetch IP');
    }
    const { ip } = await response.json();

    // Now get location data
    const geoResponse = await fetch(`https://ipwho.is/${ip}`);
    if (!geoResponse.ok) {
      throw new Error('Failed to fetch location');
    }
    const geoData = await geoResponse.json();

    return NextResponse.json({
      ip: ip,
      city: geoData.city,
      region: geoData.region,
      country: geoData.country,
      success: true,
    });
  } catch (error) {
    console.error('IP lookup error:', error);
    // Return a more graceful error response
    return NextResponse.json({
      ip: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      country: 'Unknown',
      success: false,
    });
  }
}

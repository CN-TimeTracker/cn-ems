import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC', {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch time: ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[TimeProxy] Error fetching online time:', error);
    // Fallback to local server time (the Next.js Node server time)
    return NextResponse.json({
      fallback: true,
      dateTime: new Date().toISOString()
    }, { status: 500 });
  }
}

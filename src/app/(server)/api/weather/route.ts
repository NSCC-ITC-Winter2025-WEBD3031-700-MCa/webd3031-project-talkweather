import { NextResponse } from 'next/server';

export const revalidate = 3600; // revalidate every hour

export async function GET() {
  try {
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=44.64&longitude=-63.57&current=temperature_2m,weather_code'
    );
    const data = await response.json();

    return NextResponse.json({
      temperature: `${data.current.temperature_2m}${data.current_units.temperature_2m}`,
      weather_code: data.current.weather_code,
      fetched_at: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
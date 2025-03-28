import wmoCodes from '@/data/wmo-codes.json';

export interface WeatherData {
  temperature: string;
  weather_code: number;
  fetched_at: string;
}

export async function getCurrentWeather(): Promise<WeatherData> {
    const res = await fetch('/api/weather');
    if (!res.ok) throw new Error('Failed to fetch weather data');
    return res.json();
}

export function getWeatherInfo(weatherCode: number) {
  return wmoCodes[weatherCode.toString() as keyof typeof wmoCodes];
}
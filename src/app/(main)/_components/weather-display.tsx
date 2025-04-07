"use client";

import kyInstance from "@/lib/ky";
import { useQuery } from "@tanstack/react-query";
import wmoCodes from '@/data/wmo-codes.json';

interface WeatherData {
  temperature: string;
  weatherCode: number;
  fetched_at: string;
}

const fetchWeatherData = async (): Promise<WeatherData> => {
  const response = await kyInstance.get("/api/weather").json<WeatherData>();
  return response;
};

export default function WeatherDisplay() {
  const { data: weather, isLoading, error } = useQuery<WeatherData>({
    queryKey: ["weather"],
    queryFn: fetchWeatherData,
    staleTime: 1000 * 60 * 30,
  });

  if (isLoading) return <div className="h-8 w-64 animate-pulse bg-gray-200 rounded" />;
  if (error || !weather) return null;

  const wmoCode = weather.weatherCode.toString() as keyof typeof wmoCodes;
  const weatherInfo = wmoCodes[wmoCode];

  return (
    <div className="flex items-center gap-2">
      {weatherInfo && (
        <img 
          src={weatherInfo.image} 
          alt={weatherInfo.description}
          width={32}
          height={32}
          className="w-8 h-8"
        />
      )}
      <div className="text-xl font-bold">{weatherInfo.description}, {weather.temperature}</div>
    </div>
  );
}
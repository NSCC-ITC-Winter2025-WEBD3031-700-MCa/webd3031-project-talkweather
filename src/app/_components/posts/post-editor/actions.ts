"use server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { postSchema } from "@/lib/validation";
import * as z from "zod";

// Extend your post schema to include weather fields
const postWithWeatherSchema = postSchema.extend({
  weatherCode: z.number().optional(),
  temperature: z.string().optional()
});

export async function createPost(values: z.infer<typeof postSchema>) {
  const { user } = await validateRequest();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { content, mediaIds } = postSchema.parse(values);

  if (!content) {
    throw new Error("Invalid content");
  }

  // Fetch current weather data
  let weatherData: { weather_code?: number; temperature?: string } = {};
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/weather`);
    if (response.ok) {
      weatherData = await response.json();
    }
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
  }

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: user.id,
      ...(weatherData.weather_code && { weatherCode: weatherData.weather_code }),
      ...(weatherData.temperature && { temperature: weatherData.temperature }),
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    include: getPostDataInclude(user.id),
  });

  return { success: true, newPost: newPost };
}
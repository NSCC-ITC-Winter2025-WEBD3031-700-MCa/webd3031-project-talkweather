"use server";
import { registerSchema } from "@/lib/validation";
import * as z from "zod";
import { hash } from "@node-rs/argon2";
import { lucia } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { isRedirectError } from "next/dist/client/components/redirect";
import streamServerClient from "@/lib/stream";
import type { User } from "@prisma/client";

export async function register(
  credential: z.infer<typeof registerSchema>
): Promise<{ error: string }> {
  try {
    // Validate input
    const { username, email, password } = registerSchema.parse(credential);

    if (!username || !email || !password) {
      return { error: "Invalid credentials" };
    }

    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: "insensitive" } },
          { email: { equals: email, mode: "insensitive" } }
        ]
      }
    });

    if (existingUser) {
      return { 
        error: existingUser.username.toLowerCase() === username.toLowerCase()
          ? "Username already taken"
          : "Email already taken" 
      };
    }

    // Hash password
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // Create user in transaction
    const user = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          displayName: username,
          email,
          passwordHash,
        },
      });
      
      // Attempt Stream chat user creation (but don't fail if it doesn't work)
      try {
        await streamServerClient.upsertUser({
          id: user.id,
          name: username,
          username,
        });
      } catch (streamError) {
        console.error("Stream Chat integration failed:", streamError);
        // Continue even if Stream fails
      }
      
      return user;
    });

    // Create session
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    
    // Set session cookie
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    // Force redirect by throwing the redirect error
    throw redirect("/");
    
  } catch (error) {
    if (isRedirectError(error)) {
      throw error; // Re-throw redirect errors
    }
    
    console.error("Registration error:", error);
    return { 
      error: error instanceof Error 
        ? error.message 
        : "Something went wrong. Please try again." 
    };
  }
}
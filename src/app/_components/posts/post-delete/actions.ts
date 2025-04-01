"use server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { cookies } from "next/headers";
import { lucia } from "@/auth";

export async function deletePost(postId: string) {
  
  
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  
  if (!sessionId) {
    throw new Error("Unauthorized");
  }

  const { user } = await lucia.validateSession(sessionId);

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!postId) {
    throw new Error("PostId is required");
  }

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: getPostDataInclude(user.id),
  });

  if (!post) throw new Error("Post not found - invalid postId");

  
  if (post.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("Unauthorized user");
  }

  const deletedPost = await prisma.post.delete({
    where: {
      id: postId,
    },
    include: getPostDataInclude(user.id),
  });

  return { success: true, deletedPost };
}
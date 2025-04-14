import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser || loggedInUser.role !== "ADMIN") {
      return Response.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    if (loggedInUser.id === params.userId) {
      return Response.json(
        { success: false, message: "Cannot delete yourself" },
        { status: 400 }
      );
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id: params.userId }
    });

    if (!userToDelete) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.notification.deleteMany({
        where: {
          OR: [
            { recipientId: params.userId },
            { issuerId: params.userId }
          ]
        }
      });

      await tx.follow.deleteMany({
        where: {
          OR: [
            { followerId: params.userId },
            { followingId: params.userId }
          ]
        }
      });

      await tx.like.deleteMany({
        where: { userId: params.userId }
      });

      await tx.bookmark.deleteMany({
        where: { userId: params.userId }
      });

      await tx.comment.deleteMany({
        where: { userId: params.userId }
      });

      await tx.media.deleteMany({
        where: { Post: { userId: params.userId } }
      });

      await tx.post.deleteMany({
        where: { userId: params.userId }
      });

      await tx.session.deleteMany({
        where: { userId: params.userId }
      });

      await tx.user.delete({
        where: { id: params.userId }
      });
    });

    return Response.json({
      success: true,
      message: "User and all related data deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
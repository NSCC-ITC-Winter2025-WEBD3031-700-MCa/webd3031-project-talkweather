// src/app/(server)/api/users/[userId]/verify/route.ts
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    // Find the user to verify
    const userToVerify = await prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true }
    });

    if (!userToVerify) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // If already verified, return success
    if (userToVerify.isVerified) {
      return Response.json({
        success: true,
        message: "User is already verified",
        data: { isVerified: true }
      });
    }

    // Update the user's verification status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verifiedSince: new Date()
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        isVerified: true,
        verifiedSince: true
      }
    });

    return Response.json({
      success: true,
      message: "User verified successfully",
      data: updatedUser
    });

  } catch (error) {
    console.error("Verification error:", error);
    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
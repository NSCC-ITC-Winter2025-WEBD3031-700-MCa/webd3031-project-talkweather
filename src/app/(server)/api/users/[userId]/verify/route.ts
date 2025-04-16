import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await prisma.user.update({
      where: { id: params.userId },
      data: { isVerified: true }
    });
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
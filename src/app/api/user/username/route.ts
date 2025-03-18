import sql from "@/lib/db";
import { auth } from "@clerk/nextjs";

export const runtime = "edge";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  const currentUserId = searchParams.get("userid");
  const bio = searchParams.get("bio");
  const { userId } = auth();

  // Ensure the user is authenticated
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check if the new username already exists (and is not the current user's username)
  try {
    const existingUser = await sql(
      "SELECT * FROM users WHERE username = $1 AND id != $2",
      [username, currentUserId],
    );

    if (existingUser.length > 0) {
      return new Response("Username already exists", { status: 409 });
    }

    // Update the user data in the database
    await sql("UPDATE users SET username = $1, bio = $2 WHERE id = $3", [
      username,
      bio,
      userId,
    ]);

    return new Response("OK");
  } catch (error) {
    console.error("Error updating user data:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

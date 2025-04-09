import { github } from "@/auth";
import { generateState } from "arctic";
import { cookies } from "next/headers";

export async function GET(): Promise<Response> {
	const state = generateState();

	// ✅ Explicitly pass scopes as 2nd argument
	const url = await github.createAuthorizationURL(state, [
        "read:user",
        "user:email"
      ]);
      

	cookies().set("github_oauth_state", state, {
		httpOnly: true,
		path: "/",
		maxAge: 60 * 10,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production"
	});

	return Response.redirect(url);
}

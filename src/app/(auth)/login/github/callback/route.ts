import { github, lucia } from "@/auth";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";

export async function GET(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const storedState = cookies().get("github_oauth_state")?.value ?? null;

	if (!code || !state || !storedState || state !== storedState) {
		return new Response("Invalid state", { status: 400 });
	}

	try {
		const tokens = await github.validateAuthorizationCode(code);

		// ✅ FIX: call accessToken as a method if needed
		const accessToken =
			typeof tokens.accessToken === "function"
				? tokens.accessToken()
				: tokens.accessToken;

		const githubUserResponse = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});

		if (!githubUserResponse.ok) {
			return new Response("Failed to fetch GitHub user", { status: 500 });
		}

		const githubUser: GitHubUser = await githubUserResponse.json();
		const githubId = githubUser.id.toString();

		// 🔍 Check for existing user
		let user = await prisma.user.findUnique({
			where: { githubId }
		});

		// 🧑 Create new user if not found
		if (!user) {
			user = await prisma.user.create({
				data: {
					id: generateIdFromEntropySize(10),
					username: githubUser.login,
					displayName: githubUser.name ?? githubUser.login,
					avatarUrl: githubUser.avatar_url,
					role: "USER",
					githubId
				}
			});
		}

		// ✅ Create session and set cookie
		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		});
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			return new Response("Invalid GitHub OAuth code", { status: 400 });
		}

		console.error("OAuth Callback Error:", e);
		return new Response("Internal Server Error", { status: 500 });
	}
}

interface GitHubUser {
	id: string;
	login: string;
	name?: string;
	avatar_url?: string;
}

import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import prisma from "@/lib/prisma"; // Your Prisma instance
import { Lucia } from "lucia";
import { cookies } from "next/headers";
import { GitHub } from "arctic";

// --- Initialize Prisma adapter ---
const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const github = new GitHub(
	process.env.GITHUB_CLIENT_ID!,
	process.env.GITHUB_CLIENT_SECRET!,
	process.env.GITHUB_REDIRECT_URI!
);


// --- Lucia Auth config ---
export const lucia = new Lucia(adapter, {
	sessionCookie: {
		expires: false,
		attributes: {
			secure: process.env.NODE_ENV === "production"
		}
	},
	getUserAttributes(databaseUserAttributes) {
		return {
			id: databaseUserAttributes.id,
			username: databaseUserAttributes.username,
			displayName: databaseUserAttributes.displayName,
			avatarUrl: databaseUserAttributes.avatarUrl,
			githubId: databaseUserAttributes.githubId,
			role: databaseUserAttributes.role,
			isVerified: databaseUserAttributes.isVerified,
		};
	}
});

// --- Session Validator ---
export async function validateRequest() {
	const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
	if (!sessionId) {
		return { user: null, session: null };
	}

	const result = await lucia.validateSession(sessionId);

	try {
		if (result.session && result.session.fresh) {
			const sessionCookie = lucia.createSessionCookie(result.session.id);
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		}
		if (!result.session) {
			const blankCookie = lucia.createBlankSessionCookie();
			cookies().set(blankCookie.name, blankCookie.value, blankCookie.attributes);
		}
	} catch {}

	return result;
}

// --- Role Helper (optional) ---
export async function isAdmin() {
	const { user } = await validateRequest();
	return user?.role === "ADMIN";
}

// --- Types for Lucia ---
interface DatabaseUserAttributes {
	id: string;
	username: string;
	displayName: string;
	avatarUrl: string | null;
	githubId: string | null;
	role: string;
	isVerified: boolean,
}

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

import Header from "@/components/Header/Header";
import { Metadata } from "next/types";
import getQueryClient from "@/lib/utils";
import User from "@/components/UserPage/User";
import Spinner from "@/components/Spinner";
import { Suspense } from "react";

interface Props {
  params: {
    username: string;
  };
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/user?username=${params.username}`
    );

    // Handle non-OK responses
    if (!response.ok) {
      if (response.status === 404) {
        console.error("User not found");
        return {
          title: "User Not Found – Vibe",
          description:
            "The requested user does not exist on Vibe. Discover and connect with others!",
          metadataBase: new URL("https://vibe.ambe.dev"),
          openGraph: {
            description:
              "The requested user does not exist on Vibe. Explore new connections!",
          },
        };
      }
      throw new Error(`API error: ${response.statusText}`);
    }

    // Handle empty response body
    const responseBody = await response.text();
    if (!responseBody) {
      console.error("Empty response body from API");
      return {
        title: "Error – Vibe",
        description: "User data could not be fetched. Please try again later.",
        metadataBase: new URL("https://vibe.ambe.dev"),
        openGraph: {
          description: "Something went wrong while fetching user data. Please try again later.",
        },
      };
    }

    // Parse the JSON response body
    const user = JSON.parse(responseBody);

    return {
      title: user.name ? `${user.name} – Vibe` : "Vibe",
      description:
        "Vibe is a social media web app all about connecting with people who share your interests, and it's the perfect place to share your thoughts, photos, and videos.",
      metadataBase: new URL("https://vibe.ambe.dev"),
      openGraph: {
        description: user.bio
          ? user.bio
          : "Vibe is a social media web app all about connecting with people who share your interests, and it's the perfect place to share your thoughts, photos, and videos.",
      },
    };
  } catch (error) {
    console.error("Error fetching user metadata:", error);
    return {
      title: "Error – Vibe",
      description:
        "Something went wrong while fetching user data. Please try again later.",
      metadataBase: new URL("https://vibe.ambe.dev"),
      openGraph: {
        description:
          "Something went wrong while fetching user data. Please try again later.",
      },
    };
  }
}


export default async function Page({ params }: Props) {
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["user", params.username],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/user?username=${params.username}`,
      );
      return res.json();
    },
  });

  return (
    <main className="max-w-2xl h-full flex flex-col w-full mx-auto px-2.5">
      <Header />
      <Suspense
        fallback={
          <div className="w-full flex h-full items-center justify-center">
            <Spinner size="xl" />
          </div>
        }
      >
        <User username={params.username} />
      </Suspense>
    </main>
  );
}

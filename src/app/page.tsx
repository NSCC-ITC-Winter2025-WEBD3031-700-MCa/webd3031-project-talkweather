import Feed from "@/components/Feed";
import Header from "@/components/Header/Header";
import Spinner from "@/components/Spinner";
const NewPost = dynamic(() => import("@/components/NewPost"), { ssr: false });
import { auth } from "@clerk/nextjs/server";
import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function Page({
  params,
  searchParams,
}: {
  params: { nanoid: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { userId } = auth();
  const queryClient = useQueryClient(); // Hook used inside a functional component

  useEffect(() => {
    // Prefetch the comments data on page load
    async function prefetchData() {
      await queryClient.prefetchInfiniteQuery({
        queryKey: ["comments", params.nanoid], // Correct query key
        queryFn: async ({ pageParam = 2147483647 }) => {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_URL}/api/comments?postid=${params.nanoid}&page=${pageParam}`
          );

          if (!res.ok) {
            throw new Error(`API error: ${res.statusText}`);
          }

          return res.json();
        },
        initialPageParam: 2147483647, // Required for infinite queries
      });
    }

    prefetchData();
  }, [queryClient, params.nanoid]); // Ensure this runs when params.nanoid changes

  return (
    <main className="max-w-2xl h-full flex flex-col w-full mx-auto px-2.5">
      <Header
        feed={
          searchParams.feed === "Home" || searchParams.feed === "Following"
            ? searchParams.feed
            : "Home"
        }
      />
      {userId && <NewPost />}
      <Suspense
        fallback={
          <div className="w-full flex h-full items-center justify-center">
            <Spinner size="xl" />
          </div>
        }
      >
        <Feed
          feed={
            searchParams.feed === "Home" || searchParams.feed === "Following"
              ? searchParams.feed
              : "Home"
          }
        />
      </Suspense>
    </main>
  );
}
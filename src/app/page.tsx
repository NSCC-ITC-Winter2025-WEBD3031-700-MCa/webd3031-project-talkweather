import dynamic from "next/dynamic";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import getQueryClient from "@/lib/utils"; 
import Feed from "@/components/Feed";
import Header from "@/components/Header/Header";
import Spinner from "@/components/Spinner";

const NewPost = dynamic(() => import("@/components/NewPost"), { ssr: false });

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { userId } = auth();
  const queryClient = getQueryClient();

  const feedType =
    searchParams.feed === "Home" || searchParams.feed === "Following"
      ? searchParams.feed
      : "Home";

  await queryClient.prefetchQuery({
    queryKey: ["homeFeed", feedType],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/posts?postid=2147483647&feed=${feedType}`
      );
      return res.json();
    },
  });

  return (
    <main className="max-w-2xl h-full flex flex-col w-full mx-auto px-2.5">
      <Header feed={feedType} />
      {userId && <NewPost />}
      <Suspense
        fallback={
          <div className="w-full flex h-full items-center justify-center">
            <Spinner size="xl" />
          </div>
        }
      >
        <Feed feed={feedType} />
      </Suspense>
    </main>
  );
}

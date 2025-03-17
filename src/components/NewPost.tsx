"use client";
import React, { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import Input from "./Input";
import { Post } from "@/lib/types";
import { Send } from "lucide-react";
import { nanoid } from "nanoid";

export default function NewPost() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  const inputRef = useRef<HTMLElement>(null);
  const [value, setValue] = useState<
    {
      sanitized: string;
      unsanitized: string;
      mention: boolean;
      selected: boolean;
    }[]
  >([]);

  const [inputFocus, setInputFocus] = useState(false);

  const notificationMutation = useMutation({
    mutationFn: async (d: string) => {
      const [username, data] = JSON.parse(d);
      await fetch(
        `/api/notification/mentioned?username=${username}&postid=${data}&type=post`,
        { method: "POST" },
      );
    },
  });

  const postMutation = useMutation({
    mutationFn: async ({ content, nanoid }: { content: string; nanoid: string }) => {
      console.log("Mutation started with nanoid:", nanoid);

      const response = await fetch("/api/post", {
        method: "POST",
        body: JSON.stringify({ content, nanoid }),
      });

      const result = await response.json();
      console.log("Mutation finished", result);

      return { id: result };
    },
    onMutate: ({ content, nanoid }) => {
      const name: string[] = [];

      if (user?.firstName) name.push(user.firstName);
      if (user?.lastName) name.push(user.lastName);

      if (!name.length && user?.emailAddresses[0]?.emailAddress) {
        name.push(user.emailAddresses[0].emailAddress.split("@")[0]);
      }

      queryClient.setQueryData(
        ["homeFeed", "Home"],
        (oldData: { pages: Post[][] } | undefined) => {
          if (oldData?.pages) {
            return {
              pages: [
                [
                  {
                    postid: "0",
                    nanoid,
                    content,
                    createdat: (Date.now() / 1000).toString(),
                    parentnanoid: null,
                    name: name.join(" "),
                    username: user?.username || "",
                    image: user?.imageUrl || "",
                    userid: user?.id || "",
                    likecount: "0",
                    crycount: "0",
                    laughcount: "0",
                    heartcount: "0",
                    surprisecount: "0",
                    commentcount: "0",
                    userlikestatus: null,
                    userrepoststatus: "",
                    deleted: "0",
                    edited: "0",
                  },
                  ...oldData.pages[0],
                ],
                ...oldData.pages.slice(1),
              ],
            };
          }
          return oldData;
        },
      );

      setValue([]);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["homeFeed", "Home"] });
    },
    onSuccess: (data) => {
      const mentionedUsers = value
        .filter((v) => v.mention)
        .map((v) => v.sanitized.slice(1));

      for (const username of mentionedUsers) {
        if (user?.username !== username) {
          notificationMutation.mutate(JSON.stringify([username, data.id]));
        }
      }
    },
    onError: (error) => {
      console.error("Error creating post:", error); // Logs the error
    },
  });
  

  const handlePostClick = () => {
    console.log("Button clicked!");
    const content = value
      .map((v) => v.unsanitized)
      .join(" ")
      .trim();

    if (!content) return;

    console.log("Triggering mutation with content:", content);

    postMutation.mutate({ content, nanoid: nanoid(12) });
  };

  return (
    <form
      className={`grid grid-cols-[1fr,auto] grid-rows-[auto,auto,1fr] gap-x-2 mb-2.5 hover:shadow-none items-center transition-colors shadow-sm rounded-md px-2 py-2 pl-2.5 border ${
        inputFocus ? "dark:border-foreground/25 border-ring" : ""
      }`}
    >
      <Input
        value={value}
        setValue={setValue}
        inputRef={inputRef}
        setInputFocus={setInputFocus}
        postMutation={postMutation}
      />
      <button
        type="button"
        aria-label="Post"
        onClick={handlePostClick}
        disabled={
          postMutation.isPending ||
          value.map((v) => v.sanitized).join(" ").length > 512
        }
        className="order-2 border disabled:!opacity-50 rounded-sm text-sm px-2 py-1 hover:bg-accent hover:border-ring transition-colors relative top-[0px] self-start flex items-end justify-center gap-1 leading-[1.2]"
      >
        <div className="h-4 w-4 flex items-center justify-center">
          <Send size={14} />
        </div>
        <span className="h-fit">Post</span>
      </button>
      <p
        className={`order-3 transition-colors text-xs text-right p-1 w-[43px] ${(() => {
          const length = value.map((v) => v.sanitized).join(" ").length;
          if (length < 412) return "hidden";
          if (length < 481) return "text-muted-foreground";
          if (length < 512) return "text-yellow-500/90";
          return "text-danger";
        })()}`}
      >
        {512 - value.map((v) => v.sanitized).join(" ").length}
      </p>
    </form>
  );
}

"use client";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { deletePost } from "./actions";
import { PostPage } from "@/app/(main)/_components/for-you-posts";
import { useToast } from "@/components/ui/use-toast";
import { usePathname, useRouter } from "next/navigation";

const useDeletePostMutation = () => {
  //toast trigger
  const { toast } = useToast();

  //router for navigation
  const router = useRouter();

  //pathname
  const pathname = usePathname();

  //getting query client
  const queryClient = useQueryClient();

  //Mutation for post Delete
  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async ({ deletedPost }) => {
      // Define the query filter with a correctly typed predicate
      const queryFilter: QueryFilters = {
        queryKey: ["posts"],
        predicate: (query) => {
          const queryData = query.state.data as InfiniteData<PostPage, string | null> | undefined;
          return queryData?.pages.some((page) =>
            page.posts.some((post) => post.id === deletedPost.id)
          ) ?? false;
        },
      };

      // Cancel any ongoing queries matching the filter
      await queryClient.cancelQueries(queryFilter);

      // Update the query data with the new profile information
      queryClient.setQueriesData<InfiniteData<PostPage, string | null>>(
        { queryKey: ["posts"] }, // Explicitly define the query key
        (oldData) => {
          if (!oldData) return oldData; // Return oldData if it's undefined

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              posts: page.posts.filter((post) => post.id !== deletedPost.id),
              nextCursor: page.nextCursor,
            })),
          };
        }
      );

      toast({
        description: "Post deleted successfully!",
      });

      if (pathname === `/posts/${deletedPost.id}`) {
        return router.push(`/users/${deletedPost.user.username}`);
      }
    },
    onError: (err) => {
      console.log(err);
      toast({
        variant: "destructive",
        description: "Failed to delete post. Please try again.",
      });
    },
  });

  return mutation;
};

export default useDeletePostMutation;
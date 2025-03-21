"use client";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { usePathname, useRouter } from "next/navigation";
import { deleteComment } from "./actions";
import { commentPage } from "@/lib/types";

const useDeleteCommentMutation = () => {
  //toast trigger
  const { toast } = useToast();

  //router for navifation
  const router = useRouter();

  //pathname
  const pathname = usePathname();

  //gettting query client
  const queryClient = useQueryClient();

  //Mutation for post Delete
  const mutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: async ({ data }) => {
      // Define the query filter with a correctly typed predicate
      const queryFilter: QueryFilters = {
        queryKey: ["comments", data.comment.postId],
        predicate: (query) => {
          // Rename the variable to avoid shadowing the outer `data`
          const queryData = query.state.data as InfiniteData<commentPage, string | null> | undefined;
          return queryData?.pages.some((page) =>
            page.comments.some((comment) => comment.id === data.comment.id)
          ) ?? false;
        },
      };
      
      // Cancel any ongoing queries matching the filter
      await queryClient.cancelQueries(queryFilter);

      // Update the query data with the new profile information
      queryClient.setQueriesData<InfiniteData<commentPage, string | null>>(
        { queryKey: ["comments", data.comment.postId] }, // Explicitly define the query key
        (oldData) => {
          if (!oldData) return oldData; // Return oldData if it's undefined

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              comments: page.comments.filter(
                (comment) => comment.id !== data.comment.id
              ),
              previousCursor: page.previousCursor,
            })),
          };
        }
      );

      toast({
        description: "comment deleted successfully!",
      });
    },
    onError: (err) => {
      console.log(err);
      toast({
        variant: "destructive",
        description: "Failed to delete comment. Please try again.",
      });
    },
  });

  return mutation;
};

export default useDeleteCommentMutation;
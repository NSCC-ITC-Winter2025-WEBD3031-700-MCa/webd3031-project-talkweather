import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { editProfile } from "./action";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/lib/uploadthing";
import { editUserProfileType } from "@/lib/validation";
import { PostPage } from "../../_components/for-you-posts";

export function useEditProfileMutation() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { startUpload: startAvatarUpload } = useUploadThing("avatar");

  const mutation = useMutation({
    mutationFn: async ({
      values,
      avatar,
    }: {
      values: editUserProfileType;
      avatar?: File;
    }) => {
      return Promise.all([
        editProfile(values),
        avatar && startAvatarUpload([avatar]),
      ]);
    },
    onSuccess: async ([editResponse, uploadResults]) => {
      const newAvatarUrl = uploadResults?.[0].serverData.avatarUrl || null;

      // Define the query filter with a correctly typed predicate
      const queryFilter: QueryFilters = {
        queryKey: ["posts"],
        predicate: (query) => {
          const data = query.state.data as InfiniteData<PostPage, string | null> | undefined;
          return data?.pages.some((page) =>
            page.posts.some((post) => post.userId === editResponse.data.updatedUser.id)
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
              nextCursor: page.nextCursor,
              posts: page.posts.map((post) => {
                if (post.userId === editResponse.data.updatedUser.id) {
                  return {
                    ...post,
                    user: {
                      ...editResponse.data.updatedUser,
                      avatarUrl:
                        newAvatarUrl || editResponse.data.updatedUser.avatarUrl,
                    },
                  };
                } else {
                  return post;
                }
              }),
            })),
          };
        }
      );

      // Refresh the router to reflect the changes
      router.refresh();

      // Show a success toast
      toast({
        description: "Profile updated successfully!",
      });
    },
    onError(error) {
      console.log(error);
      toast({
        variant: "destructive",
        description: "Profile edit failed. Please try again",
      });
    },
  });

  return mutation;
}
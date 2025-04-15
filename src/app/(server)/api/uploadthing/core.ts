import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import streamServerClient from "@/lib/stream"; // Only use if properly connected

const f = createUploadthing();

export const ourFileRouter = {
  avatar: f({ image: { maxFileSize: "1MB" } })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const prevAvatar = metadata.user.avatarUrl ?? undefined;

      // ✅ Only delete if previous avatar is from UploadThing
      if (
        prevAvatar &&
        (prevAvatar.includes("utfs.io") || prevAvatar.includes("ufs.sh"))
      ) {
        const key = prevAvatar.split("/f/")[1];
        if (key) {
          try {
            await new UTApi().deleteFiles(key);
          } catch (err) {
            console.error("❌ Failed to delete previous avatar:", err);
          }
        }
      }

      const newAvatarURL = file.url;

      // ✅ Safe avatar update in DB
      await prisma.user.update({
        where: { id: metadata.user.id },
        data: { avatarUrl: newAvatarURL },
      });

      // ⚠️ Skip Stream update if not connected properly
      try {
        await streamServerClient.partialUpdateUser({
          id: metadata.user.id,
          set: { image: newAvatarURL },
        });
      } catch (err) {
        console.warn("⚠️ Stream update skipped (token probably missing):", err);
      }

      return { avatarUrl: newAvatarURL };
    }),

  attachment: f({ image: { maxFileSize: "4MB", maxFileCount: 5 } })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      return { user };
    })
    .onUploadComplete(async ({ file }) => {
      const media = await prisma.media.create({
        data: {
          url: file.url,
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        },
      });

      console.log("✅ Uploaded:", media.url);
      return { mediaId: media.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

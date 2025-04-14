import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bookmark, Home, Badge, CircleUserRound} from "lucide-react";
import Link from "next/link";
import NotificationButton from "./notification-button";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

interface Props {
  className?: string;
}

const MenuBar = async ({ className }: Props) => {
  const { user } = await validateRequest();

  if (!user) return null;

  const count = await prisma.notification.count({
    where: {
      recipientId: user.id,
      isRead: false,
    },
  });

  return (
    <div className={cn("", className)}>
      <Button
        variant={"ghost"}
        className={`flex items-center justify-start gap-3`}
        title="Home"
        asChild
      >
        <Link href={"/"}>
          <Home />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      <NotificationButton
        initialData={{ data: { unreadCount: count }, success: true }}
      />
      <Button
        variant={"ghost"}
        className={`flex items-center justify-start gap-3`}
        title="Bookmarks"
        asChild
      >
        <Link href={"/bookmarks"}>
          <Bookmark />
          <span className="hidden lg:inline">Bookmarks</span>
        </Link>
      </Button>

      {(() => {
      if (user?.role === "ADMIN") {
          return (
            <Button
              variant={"ghost"}
              className={`flex items-center justify-start gap-3`}
              title="AdminDashboard"
              asChild
            >
              <Link href={"/admin"}>
                <CircleUserRound />
                <span className="hidden lg:inline">Admin Dashboard</span>
              </Link>
            </Button>
          );
      } if (user?.role !== "ADMIN" && !(user?.isVerified)) {
          return (
            <Button
            variant={"ghost"}
            className={`flex items-center justify-start gap-3`}
            title="Upgrade"
            asChild
          >
            <Link href={"/pricing"}>
              <Badge />
              <span className="hidden lg:inline">Upgrade</span>
            </Link>
          </Button>
          );
      }
      return (
        <Button
        variant={"ghost"}
        className={`flex items-center justify-start gap-3`}
        title="ManageMembership"
        asChild
      >
        <Link href={"/pricing"}>
          <Badge />
          <span className="hidden lg:inline">Manage Membership</span>
        </Link>
      </Button>
      );
    })()}
    </div>
  );
};

export default MenuBar;

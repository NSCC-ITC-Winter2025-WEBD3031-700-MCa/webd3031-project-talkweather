"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { postData } from "@/lib/types";
import { MoreVertical } from "lucide-react";
import { useState } from "react";
import DeletePostDialog from "./post-delete/delete-post-dialog";

interface Props {
  post: postData;
  className?: string;
}

const MoreOptionPostButton = ({ post }: Props) => {
  const [openDeleteDianlog, setOpenDeleteDianlog] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={"icon"}>
            <MoreVertical className="size-[19px] opacity-80" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-32" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => setOpenDeleteDianlog(true)}
              className="!cursor-pointer"
            >
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Post Delete Dianlog  */}
      <DeletePostDialog
        open={openDeleteDianlog}
        onClose={() => setOpenDeleteDianlog(false)}
        post={post}
      />
    </>
  );
};

export default MoreOptionPostButton;

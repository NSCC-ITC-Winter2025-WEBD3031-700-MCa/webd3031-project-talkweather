"use client";

import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button"; // Update path if needed

const GitHubSignupButton = () => {
  return (
    <a href="/login/github" className="w-full">
      <Button className="mt-4 w-full flex items-center justify-center gap-2">
        <FaGithub />
        <span>Sign up with GitHub</span>
      </Button>
    </a>
  );
};

export default GitHubSignupButton;

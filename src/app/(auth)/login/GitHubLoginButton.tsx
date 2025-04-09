'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa"; // GitHub icon

const GitHubLoginButton = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch("/api/auth/session"); // You can change this to your own endpoint
      const data = await res.json();
      if (data.user) {
        setUser(data.user); // Store the user info if needed
      }
    };

    fetchSession();
  }, []);

  return (
    <a href="/login/github" className="w-full">
      <Button
        className="mt-4 w-full flex items-center justify-center gap-2"
      >
        <FaGithub />
        <span>Sign in with GitHub</span>
      </Button>
    </a>
  );
};

export default GitHubLoginButton;

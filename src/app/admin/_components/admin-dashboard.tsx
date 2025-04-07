"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div>
        <iframe
          width="100%"
          height="800px"
          src="https://lookerstudio.google.com/embed/reporting/6951790e-4629-47a6-8055-c1c80c99d7df/page/3G6FF" 
          frameBorder="0"
          allowFullScreen
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}
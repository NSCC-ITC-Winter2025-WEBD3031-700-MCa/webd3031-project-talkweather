"use client";
import { Analytics } from '@vercel/analytics/next';
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div>
        <Analytics />
      </div>
    </div>
  );
}
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { AdminDashboard } from "./_components/admin-dashboard";
import { getDashboardStats } from "@/app/_services/stats.service";

export default async function AdminPage() {
  const { user } = await validateRequest();

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const initialStats = await getDashboardStats();

  return <AdminDashboard initialStats={initialStats} />;
}
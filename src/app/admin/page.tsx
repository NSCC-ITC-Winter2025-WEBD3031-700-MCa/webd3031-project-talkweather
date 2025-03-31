import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "./_components/admin-dashboard";

export default async function AdminPage() {
  const { user } = await validateRequest();

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return <AdminDashboard />;
}
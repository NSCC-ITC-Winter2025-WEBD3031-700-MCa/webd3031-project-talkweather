import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SessionProvider from "@/app/(main)/_providers/session-provider";
import Navbar from "./_components/navbar";
import MenuBar from "./_components/menu-bar";
import Link from "next/link";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user) return redirect("/login");

  return (
    <SessionProvider value={session}>
      <div className="flex min-h-screen flex-col items-center">
        {/* Navbar with Pricing Button */}
        <div className="w-full flex justify-between items-center px-5 py-3 bg-card shadow-md">
          <Navbar />
          {/* Long Oval Button for Pricing */}
          <Link href="/pricing">
            <button className="px-4 py-1 rounded-full bg-blue-600 text-white text-lg font-semibold shadow-md hover:bg-blue-700 transition">
              Upgrade
            </button>
          </Link>
        </div>

        <div className="flex w-full max-w-7xl grow gap-5 px-5 py-5 xl:px-0">
          <MenuBar className="sticky top-[5rem] hidden h-fit flex-none space-y-2 rounded-2xl bg-card px-3 py-5 shadow-md dark:border sm:block lg:px-5 xl:w-72" />
          {children}
        </div>
        
        <MenuBar className="sticky bottom-0 flex w-full justify-center gap-5 border-t-[2px] bg-card px-3 py-2 sm:hidden" />
      </div>
    </SessionProvider>
  );
}

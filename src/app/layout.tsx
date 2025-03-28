import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./_providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import ReactQueryProvider from "./(main)/_providers/tanstack-query-provider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./(server)/api/uploadthing/core";
import { TooltipProvider } from "@/components/ui/tooltip";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | HaliWeather",
    default: "HaliWeather",
  },
  description:
    "The social media application called HaliWeather build by the NSCC Capstone HaliWeather Team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} bg-gray-100 dark:bg-card`}>
        <TooltipProvider>
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          <ReactQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </ReactQueryProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}

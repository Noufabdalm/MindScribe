"use client"

import "./globals.css";
import SidebarLayout from "@/components/SidebarLayout";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Determine if the current route is the sign-in page
  const isSignInPage = pathname === "/sign-in";

  return (
    <html lang="en" className="h-full overscroll-auto bg-gradient-to-br from-blue-100 to-purple-200">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Lora:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-lora">
        <SessionProvider>
          {isSignInPage ? (
            <>{children}</>
          ) : (
            <SidebarLayout>
              {children}
            </SidebarLayout>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}
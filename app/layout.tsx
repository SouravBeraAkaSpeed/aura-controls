import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import SessionProvider from "@/components/SessionProvider";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { Suspense } from "react";
import Loader2 from "@/components/Loader2";
import { Toaster } from "@/components/ui/toaster";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aura Controls | Presented by Toil Labs",
  description: "Feel like Tony Stark. Control your PC or Mac with simple hand gestures using just your webcam. The futuristic Jarvis-style interface is here. Command your world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleOAuthProvider clientId="310266179044-2bs4qcdakhpkd6tubh976ccn7fgmut9j.apps.googleusercontent.com">
          <SessionProvider >

            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <Suspense fallback={<Loader2 />}>

                {children}

                <Toaster />
              </Suspense>
            </ThemeProvider>

          </SessionProvider>

        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

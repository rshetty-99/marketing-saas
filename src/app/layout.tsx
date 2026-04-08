import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import {
  Inter,
  JetBrains_Mono,
  Space_Grotesk,
  Syne,
} from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/features/auth/AuthHeader";
import { RouteLoadingBar } from "@/components/ui/route-loading-bar";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["500"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["400", "500"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400"],
});

/**
 * Inline script to set dark/light class before first paint — prevents flash.
 * Reads from localStorage ("theme") or falls back to system preference.
 * Safe: contains only a static string literal, no user input.
 */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light"){document.documentElement.classList.toggle("dark",t==="dark")}else{document.documentElement.classList.toggle("dark",window.matchMedia("(prefers-color-scheme:dark)").matches)}}catch(e){document.documentElement.classList.add("dark")}})()`;

function ThemeScript() {
  return (
    // eslint-disable-next-line react/no-danger -- static string, no user input
    <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
  );
}

export const metadata: Metadata = {
  title: "Aura — AI-Powered Marketing Platform",
  description:
    "Every brand deserves a halo. 36 AI skills, one platform — built for agencies managing 5–100 client accounts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        syne.variable,
        spaceGrotesk.variable,
        inter.variable,
        jetbrainsMono.variable
      )}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased">
        <ClerkProvider>
          <Suspense fallback={null}>
            <RouteLoadingBar />
          </Suspense>
          <AppHeader />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";
import { AuthProvider } from "@/context/AuthContext";
import Footer from "@/components/ui/Footer";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Duel Guess",
  description: "A turn-based 2-player guessing game.",
  verification: {
    google: "6W_4J_J-gwwAVodQi3si23pVzZTq9iWsUMh1tW_L7E4",
  },
};

import { ThemeProvider } from "@/context/ThemeContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-50 dark:bg-slate-950 dark:text-slate-50 light:bg-slate-50 light:text-slate-950 flex flex-col transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>
            <GameProvider>
              {children}
              <Footer />
              <Analytics />
            </GameProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

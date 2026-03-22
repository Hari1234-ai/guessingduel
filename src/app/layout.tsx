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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-50 flex flex-col`}>
        <AuthProvider>
          <GameProvider>
            {children}
            <Footer />
            <Analytics />
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";
import { AuthProvider } from "@/context/AuthContext";

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
    <html lang="en" className="h-full antialiased dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-50 flex flex-col`}>
        <AuthProvider>
          <GameProvider>
            {children}
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

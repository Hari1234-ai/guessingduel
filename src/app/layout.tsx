import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";
import { AuthProvider } from "@/context/AuthContext";
import Footer from "@/components/ui/Footer";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import UpdateDrawer from "@/components/ui/UpdateDrawer";
import BottomNav from "@/components/ui/BottomNav";
import { Capacitor } from "@capacitor/core";
import React, { useState, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://mindm.vercel.app/'),
  title: "MindMatch | Outsmart Your Rivals",
  description: "The ultimate real-time testing of strategy and luck. Challenge friends to a high-stakes MindMatch where every guess counts.",
  alternates: {
    canonical: '/',
  },
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
            <UpdateDrawer />
            <NativeLayoutWrapper>
              <Footer />
            </NativeLayoutWrapper>
            <NativeBottomNav />
            <Analytics />
            
            {/* Google Analytics */}
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-B7SMPRXZVY"
              strategy="afterInteractive"
            />
            <Script 
              id="google-analytics" 
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-B7SMPRXZVY');
                `
              }}
            />

            {/* Force unregister any legacy service workers to fix APK download prompt issues */}
            <Script
              id="unregister-sw"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(function(registrations) {
                      for(let registration of registrations) {
                        registration.unregister();
                      }
                    });
                  }
                `
              }}
            />
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

function NativeLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isNative, setIsNative] = useState(false);
  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);
  
  if (isNative) return null;
  return <>{children}</>;
}

function NativeBottomNav() {
  const [isNative, setIsNative] = useState(false);
  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);
  
  if (!isNative) return null;
  return <BottomNav />;
}

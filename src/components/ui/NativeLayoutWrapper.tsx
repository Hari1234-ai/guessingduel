'use client';

import React, { useState, useEffect } from "react";
import { isNativePlatform } from "@/lib/platform";
import BottomNav from "./BottomNav";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function NativeLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isNative, setIsNative] = useState(false);
  useEffect(() => {
    setIsNative(isNativePlatform());
  }, []);
  
  if (isNative) return null;
  return <>{children}</>;
}

export function NativeBottomNav() {
  const [isNative, setIsNative] = useState(false);
  const pathname = usePathname();
  
  useEffect(() => {
    setIsNative(isNativePlatform());
  }, []);
  
  if (!isNative) return null;
  
  // Hide bottom nav on onboarding/auth if needed, but usually we want it everywhere on native dashboard
  return <BottomNav />;
}

export function NativeContent({ children }: { children: React.ReactNode }) {
  const [isNative, setIsNative] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsNative(isNativePlatform());
  }, []);

  if (!isNative) return <>{children}</>;

  const showBackButton = pathname !== '/' && !pathname.startsWith('/login');

  return (
    <div className="flex-1 w-full max-w-md mx-auto bg-slate-950 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-x-hidden min-h-screen flex flex-col border-x border-white/5 pb-24">
      {showBackButton && (
        <div className="sticky top-0 z-[60] p-4 bg-slate-950/80 backdrop-blur-md">
           <button 
             onClick={() => router.push('/')} 
             className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5 active:scale-95 transition-transform"
           >
              <ChevronLeft size={20} />
           </button>
        </div>
      )}
      <div className={showBackButton ? "-mt-4" : ""}>
        {children}
      </div>
    </div>
  );
}

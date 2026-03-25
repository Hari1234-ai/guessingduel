'use client';

import React, { useState, useEffect } from "react";
import { isNativePlatform } from "@/lib/platform";
import BottomNav from "./BottomNav";

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
  useEffect(() => {
    setIsNative(isNativePlatform());
  }, []);
  
  if (!isNative) return null;
  return <BottomNav />;
}

import { Capacitor } from '@capacitor/core';

/**
 * Checks if the app is running on a native platform (Android/iOS)
 * or if the 'native=true' URL parameter is present for browser mirroring.
 */
export const isNativePlatform = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const isCapacitorNative = Capacitor.isNativePlatform();
  const hasNativeParam = new URLSearchParams(window.location.search).get('native') === 'true';
  const hasNativeStorage = localStorage.getItem('forceNative') === 'true';

  // If user once visits with ?native=true, we can persist it for that session/browser
  if (hasNativeParam) {
    localStorage.setItem('forceNative', 'true');
  }

  return isCapacitorNative || hasNativeParam || hasNativeStorage;
};

/**
 * Resets the forced native state (for testing)
 */
export const resetNativeOverride = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('forceNative');
  }
};

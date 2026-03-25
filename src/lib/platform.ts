import { Capacitor } from '@capacitor/core';

/**
 * Checks if the app is running on a native platform (Android/iOS)
 * or if the 'native=true' URL parameter is present for browser mirroring.
 */
export const isNativePlatform = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Capacitor.isNativePlatform();
};

/**
 * Resets the forced native state (for testing)
 */
export const resetNativeOverride = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('forceNative');
  }
};

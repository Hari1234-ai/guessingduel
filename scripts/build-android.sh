#!/bin/bash

# MindMatch: Automated Android Build Script
# This script builds the web project, syncs it with Capacitor, and generates a Debug APK.

echo "🚀 Starting MindMatch Android Build..."

# 1. Install dependencies if needed
# npm install

# 2. Build the Next.js project
echo "📦 Building web assets..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Web build failed. Aborting."
  exit 1
fi

# 3. Sync with Capacitor
echo "🔄 Syncing with Capacitor Android..."
npx cap sync android

if [ $? -ne 0 ]; then
  echo "❌ Capacitor sync failed. Aborting."
  exit 1
fi

# 4. Build APK using Gradle
echo "🏗️ Building Android APK (Debug)..."
cd android
./gradlew assembleDebug

if [ $? -ne 0 ]; then
  echo "❌ Android build failed. Aborting."
  exit 1
fi

echo "✅ Build Successful!"
echo "📍 Your APK is located at: android/app/build/outputs/apk/debug/app-debug.apk"

# 5. Optional: Open in Android Studio (if user still wants to see it)
# npx cap open android

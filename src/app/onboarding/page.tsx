'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import OnboardingSlides from '@/components/onboarding/OnboardingSlides';

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push('/');
  };

  return <OnboardingSlides onComplete={handleComplete} />;
}

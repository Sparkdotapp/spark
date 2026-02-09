"use client";
import { CommunitiesSection } from '@/components/landingpage/CommunitiesSection';
import { CTASection } from '@/components/landingpage/CTASection';
import { EventsSection } from '@/components/landingpage/EventsSection';
import { FeaturesSection } from '@/components/landingpage/FeaturesSection';

import { HeroSection } from '@/components/landingpage/HeroSection';
import { PitchPalSection } from '@/components/landingpage/PitchPalSection';
import { ProjectsSection } from '@/components/landingpage/ProjectsSection';

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-[rgb(17,17,19)]">

        <main>
          <HeroSection />
          <FeaturesSection />
          <EventsSection />
          <CommunitiesSection />
          <PitchPalSection />
          <ProjectsSection />
          <CTASection />
        </main>
      </div>
    </>
  );
}

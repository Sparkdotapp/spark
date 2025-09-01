import Image from 'next/image';
import TeamSection from './TeamSection';
import MissionVision from './MissionVision';

export default function AboutLayout() {
  return (
    <>
      <section className="bg-card py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About Spark</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Spark is a platform created to empower developers, students, and creators. We aim to provide resources, opportunities, and a collaborative space to innovate.
          </p>
        </div>
      </section>

      <MissionVision />
      <TeamSection />
    </>
  );
}

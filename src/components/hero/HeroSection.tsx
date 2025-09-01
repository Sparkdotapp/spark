import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const featureCards = [
  { title: 'Social Feed', description: 'Connect with us on different platforms.', link: '/social', dataAiHint: 'social media' },
  { title: 'Community Matcher', description: 'Find the right community for your interests.', link: '/communities', dataAiHint: 'team collaboration' },
  { title: 'Event Summarizer', description: 'Get AI-powered summaries for your events.', link: '/events', dataAiHint: 'code project' },
  { title: 'PitchPal', description: 'Generate and analyze presentations for your projects.', link: '/pitchpal', dataAiHint: 'presentation pitch' },
];

export default function HeroSection() {
  return (
    <>
      <section className="relative w-full py-20 md:py-32 lg:py-40 bg-card">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image
          src="https://picsum.photos/1920/1080"
          alt="Community collaboration"
          data-ai-hint="community collaboration"
          fill
          className="object-cover"
          priority
        />
        <div className="container mx-auto px-4 md:px-6 relative z-20">
          <div className="max-w-3xl text-center mx-auto">
            <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl md:text-6xl">
              Welcome to Spark
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Igniting innovation and collaboration through technology, communities, and events. Spark is the hub where creators, developers, and innovators come together.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg">
                <Link href="/events">
                  Explore Events <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
           <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Services</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Discover the tools and services Spark offers to empower your journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureCards.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                    <Image 
                        src={`https://picsum.photos/seed/${feature.title.replace(' ', '')}/600/400`}
                        alt={feature.title}
                        width={600}
                        height={400}
                        className="rounded-md mb-4"
                        data-ai-hint={feature.dataAiHint}
                    />
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <Button variant="link" asChild className="p-0">
                    <Link href={feature.link}>
                      Go to {feature.title} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

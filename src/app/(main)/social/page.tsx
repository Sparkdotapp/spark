import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Rss } from 'lucide-react';
import Image from 'next/image';

const socialSections = [
    {
        title: 'Social Feed',
        description: 'Follow our journey and connect with the Spark community across all our platforms.',
        link: '/social/feed',
        image: 'https://picsum.photos/seed/socialfeed/600/400',
        dataAiHint: 'social media collage',
        icon: Rss,
    },
];

export default function SocialPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Social Hub</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Connect with us on different platforms. Discover Spark’s digital presence and engage with our content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
        {socialSections.map((section) => (
          <Card key={section.title} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
             <Image src={section.image} alt={section.title} width={600} height={400} className="w-full h-48 object-cover" data-ai-hint={section.dataAiHint} />
            <CardHeader className="flex-row items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <section.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">{section.description}</p>
            </CardContent>
            <CardContent>
              <Button asChild>
                <Link href={section.link}>
                  Go to {section.title} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

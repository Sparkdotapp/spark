import { Github, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const socialPlatforms = [
  { name: 'GitHub', icon: Github, handle: '@sparkhub-org', link: '#', dataAiHint: 'github repository' },
  { name: 'LinkedIn', icon: Linkedin, handle: 'Spark Hub', link: '#', dataAiHint: 'business profile' },
  { name: 'Twitter', icon: Twitter, handle: '@sparkhub', link: '#', dataAiHint: 'social media' },
  { name: 'Instagram', icon: Instagram, handle: '@sparkhub', link: '#', dataAiHint: 'photo gallery' },
];

export default function SocialIcons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {socialPlatforms.map((platform) => (
        <Card key={platform.name} className="text-center hover:shadow-primary/20 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
              <platform.icon className="h-10 w-10 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle>{platform.name}</CardTitle>
            <p className="text-muted-foreground mt-2">{platform.handle}</p>
            <Button asChild className="mt-4">
              <Link href={platform.link} target="_blank" rel="noopener noreferrer">Follow Us</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

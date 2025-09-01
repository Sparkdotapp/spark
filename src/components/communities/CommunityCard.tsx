import Image from 'next/image';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Community {
  name: string;
  members: number;
  tags: string[];
  description: string;
  image: string;
  dataAiHint: string;
}

export default function CommunityCard({ community }: { community: Community }) {
  return (
    <Card key={community.name} className="flex flex-col md:flex-row overflow-hidden">
        <Image src={community.image} alt={community.name} width={250} height={250} className="w-full md:w-1/3 h-48 md:h-auto object-cover" data-ai-hint={community.dataAiHint} />
        <div className="flex flex-col justify-between p-6 w-full">
            <div>
                <CardTitle>{community.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground my-2">
                    <Users className="h-4 w-4" />
                    <span>{community.members.toLocaleString()} members</span>
                </div>
                <CardDescription className="mb-4">{community.description}</CardDescription>
                <div className="flex flex-wrap gap-2">
                {community.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
                </div>
            </div>
            <CardFooter className="p-0 pt-4">
                <Button>Join Community</Button>
            </CardFooter>
        </div>
    </Card>
  );
}

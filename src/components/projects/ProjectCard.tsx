import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Github } from 'lucide-react';

interface Project {
  name: string;
  category: string;
  tech: string[];
  description: string;
  image: string;
  dataAiHint: string;
}

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Card key={project.name} className="flex flex-col">
      <CardHeader>
        <Image src={project.image} alt={project.name} width={600} height={400} className="rounded-t-lg aspect-[3/2] object-cover" data-ai-hint={project.dataAiHint} />
      </CardHeader>
      <CardContent className="flex-grow">
        <CardTitle>{project.name}</CardTitle>
        <CardDescription className="my-2">{project.description}</CardDescription>
        <div className="flex flex-wrap gap-2 mt-4">
          {project.tech.map(tech => (
            <Badge key={tech} variant="secondary">{tech}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Learn More</Button>
        <Button variant="ghost" size="icon" asChild>
          <Link href="#" aria-label={`${project.name} Github`}>
            <Github className="h-5 w-5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

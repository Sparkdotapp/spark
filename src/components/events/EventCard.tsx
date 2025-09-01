import Image from 'next/image';
import { Calendar as CalendarIcon, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Event {
    title: string;
    date: string;
    location: string;
    attendees: number;
    description: string;
    image: string;
    dataAiHint: string;
}

export default function EventCard({ event }: { event: Event }) {
    return (
        <Card key={event.title} className="overflow-hidden">
            <Image src={event.image} alt={event.title} width={600} height={400} className="w-full h-48 object-cover" data-ai-hint={event.dataAiHint} />
          <CardHeader>
            <CardTitle>{event.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{event.attendees} attendees</span>
              </div>
            </div>
            <p className="text-foreground/80">{event.description}</p>
          </CardContent>
          <CardFooter>
            <Button>Register Now</Button>
          </CardFooter>
        </Card>
    );
}

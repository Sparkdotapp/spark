import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import EventSummarizer from './EventSummarizer';
import EventCard from './EventCard';

const events = [
  {
    title: 'Global AI Summit 2025',
    date: '2025-08-15',
    location: 'Virtual',
    attendees: 1200,
    description: 'Join thousands of AI enthusiasts and professionals at the largest AI conference of the year. Featuring keynotes from industry leaders, hands-on workshops, and networking opportunities.',
    image: 'https://picsum.photos/seed/aisummit/600/400',
    dataAiHint: 'tech conference',
  },
  {
    title: 'Next.js Conf',
    date: '2025-10-22',
    location: 'San Francisco, CA',
    attendees: 800,
    description: 'The official conference for the Next.js framework. Discover the latest updates, learn from the creators, and connect with the community.',
    image: 'https://picsum.photos/seed/nextjsconf/600/400',
    dataAiHint: 'developer meetup',
  },
  {
    title: 'Hack for Good Hackathon',
    date: '2025-11-05',
    location: 'Online',
    attendees: 350,
    description: 'A 48-hour virtual hackathon focused on creating innovative solutions for social and environmental challenges. Prizes, mentorship, and fun guaranteed.',
    image: 'https://picsum.photos/seed/hackathon/600/400',
    dataAiHint: 'team coding',
  },
];

export default function EventsLayout() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Events at Spark</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Stay updated with our upcoming tech events, hackathons, webinars, and workshops designed to bring people together and spark new ideas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-3xl font-bold">Upcoming Events</h2>
          {events.map((event) => (
            <EventCard key={event.title} event={event} />
          ))}
        </div>

        <aside className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">Event Calendar</h2>
            <Card>
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  className="p-3 w-full"
                />
              </CardContent>
            </Card>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">Dynamic Summary</h2>
            <EventSummarizer />
          </div>
        </aside>
      </div>
    </div>
  );
}

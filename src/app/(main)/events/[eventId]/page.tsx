import { getEvent } from '@/app/actions/event-actions';
import { EventDetailClient } from '@/components/events/EventDetailClient';
import { notFound } from 'next/navigation';

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);
  if (!event) return notFound();

  return <EventDetailClient event={JSON.parse(JSON.stringify(event))} />;
}

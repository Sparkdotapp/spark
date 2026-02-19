import { getEvent } from '@/app/actions/event-actions';
import { EventManageClient } from '@/components/events/manage/EventManageClient';
import { notFound } from 'next/navigation';

export default async function EventManagePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);
  if (!event) return notFound();

  return <EventManageClient event={JSON.parse(JSON.stringify(event))} />;
}

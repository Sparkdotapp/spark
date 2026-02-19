import { EventsSidebar } from '@/components/events/EventsSidebar';

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-72px)]">
      <EventsSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

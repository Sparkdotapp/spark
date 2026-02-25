'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@stackframe/stack';
import { Plus, LayoutDashboard, Users, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getMyParticipatingEvents } from '@/app/actions/event-actions';

export function EventsSidebar() {
  const user = useUser();
  const pathname = usePathname();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const result = await getMyParticipatingEvents();
      if (result.success) setEvents(result.events);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (!user) return null;

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="hidden lg:block w-[240px] shrink-0 fixed top-[72px] left-0 h-[calc(100vh-72px)] overflow-y-auto border-r border-[rgba(255,255,255,0.06)] bg-[rgb(17,17,19)] z-40">
      <div className="p-4 space-y-1">
        {/* Host an Event */}
        <Link
          href="/events/host"
          className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
            isActive('/events/host')
              ? 'bg-[rgba(218,255,1,0.1)] text-[#DAFF01]'
              : 'text-[rgb(200,200,210)] hover:text-white hover:bg-[rgba(255,255,255,0.06)]'
          }`}
        >
          <Plus className="w-4 h-4" />
          Host an Event
        </Link>

        {/* Dashboard */}
        <Link
          href="/events/dashboard"
          className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
            isActive('/events/dashboard')
              ? 'bg-[rgba(218,255,1,0.1)] text-[#DAFF01]'
              : 'text-[rgb(200,200,210)] hover:text-white hover:bg-[rgba(255,255,255,0.06)]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-[rgba(255,255,255,0.06)]" />

      {/* My Participations */}
      <div className="p-4">
        <div className="flex items-center gap-2 px-3 mb-3">
          <Users className="w-3.5 h-3.5 text-[rgb(130,130,140)]" />
          <span className="text-[10px] uppercase font-semibold text-[rgb(130,130,140)] tracking-wider">
            My Participations
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-4 h-4 animate-spin text-[rgb(130,130,140)]" />
          </div>
        ) : events.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-5 h-5 text-[rgb(80,80,90)]" />
            </div>
            <p className="text-xs text-[rgb(130,130,140)]">
              No participations yet
            </p>
            <p className="text-[10px] text-[rgb(80,80,90)] mt-1">
              Join a team to see events here
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {events.map((evt) => {
              const active = pathname === `/events/${evt.id}`;
              return (
                <Link
                  key={evt.id}
                  href={`/events/${evt.id}`}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    active
                      ? 'bg-[rgba(218,255,1,0.08)] border border-[rgba(218,255,1,0.15)]'
                      : 'hover:bg-[rgba(255,255,255,0.04)]'
                  }`}
                >
                  {evt.coverImage ? (
                    <img
                      src={evt.coverImage}
                      alt=""
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[rgba(218,255,1,0.08)] flex items-center justify-center shrink-0 text-xs font-bold text-[#DAFF01]">
                      {evt.title[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-xs font-medium truncate ${
                        active ? 'text-[#DAFF01]' : 'text-[rgb(200,200,210)] group-hover:text-white'
                      }`}
                    >
                      {evt.title}
                    </div>
                    <div className="text-[10px] text-[rgb(100,100,110)] mt-0.5">
                      {new Date(evt.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                      {' · '}
                      {evt.type.charAt(0) + evt.type.slice(1).toLowerCase()}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

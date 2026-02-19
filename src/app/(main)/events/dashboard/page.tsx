'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@stackframe/stack';
import {
  Calendar,
  Plus,
  ArrowRight,
  Loader2,
  Zap,
  Users,
  Eye,
  Settings,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getMyEvents } from '@/app/actions/event-actions';
import Link from 'next/link';

interface EventItem {
  id: string;
  title: string;
  type: string;
  status: string;
  startDate: string;
  _count: { teams: number; rounds: number };
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-[rgba(161,161,170,0.1)] text-[rgb(161,161,170)] border-[rgba(161,161,170,0.2)]',
  PUBLISHED: 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] border-[rgba(34,197,94,0.2)]',
  ONGOING: 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border-[rgba(59,130,246,0.2)]',
  COMPLETED: 'bg-[rgba(161,161,170,0.1)] text-[rgb(161,161,170)] border-[rgba(161,161,170,0.2)]',
  CANCELLED: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border-[rgba(239,68,68,0.2)]',
};

export default function MyEventsDashboard() {
  const user = useUser();
  const [hosted, setHosted] = useState<EventItem[]>([]);
  const [staffed, setStaffed] = useState<{ event: EventItem; role: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadEvents();
  }, [user]);

  async function loadEvents() {
    setLoading(true);
    try {
      const result = await getMyEvents();
      if (result.success) {
        setHosted(
          (result.hosted || []).map((e: Record<string, unknown>) => ({
            ...e,
            startDate: String(e.startDate),
          })) as EventItem[]
        );
        setStaffed(
          (result.staffed || []).map((s: Record<string, unknown>) => ({
            event: {
              ...(s.event as Record<string, unknown>),
              startDate: String((s.event as Record<string, unknown>).startDate),
            },
            role: String(s.role),
          })) as { event: EventItem; role: string }[]
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[rgb(17,17,19)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to view your events</h2>
          <Link
            href="/handler/sign-in"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)]"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(17,17,19)]">
      <div className="max-w-[1000px] mx-auto px-6 pt-28 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Events</h1>
              <p className="text-[rgb(161,161,170)]">Manage events you host or staff.</p>
            </div>
            <Link
              href="/events/host"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] hover:bg-[rgb(166,190,21)] transition-all"
            >
              <Plus className="w-4 h-4" /> Create Event
            </Link>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#DAFF01] animate-spin" />
          </div>
        ) : (
          <div className="space-y-10">
            {/* Hosted Events */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#DAFF01]" /> Hosted by You
              </h2>
              {hosted.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-[rgba(255,255,255,0.1)] text-center">
                  <p className="text-[rgb(130,130,140)] mb-4">You haven&apos;t hosted any events yet.</p>
                  <Link
                    href="/events/host"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#DAFF01] hover:underline"
                  >
                    <Plus className="w-4 h-4" /> Host your first event
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {hosted.map((event, i) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link href={`/events/${event.id}/manage`}>
                        <div className="group flex items-center gap-5 p-5 rounded-xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(218,255,1,0.2)] transition-all duration-300 cursor-pointer">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`text-[10px] border ${statusColors[event.status]}`}>
                                {event.status}
                              </Badge>
                              <span className="text-[10px] text-[rgb(130,130,140)]">{event.type}</span>
                            </div>
                            <h3 className="text-base font-semibold text-white group-hover:text-[#DAFF01] transition-colors truncate">
                              {event.title}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-xs text-[rgb(130,130,140)]">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {event._count.teams} teams
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {event._count.rounds} rounds
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#DAFF01] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                              Manage <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Staffed Events */}
            {staffed.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#00D4FF]" /> Staff Roles
                </h2>
                <div className="space-y-3">
                  {staffed.map((s, i) => (
                    <motion.div
                      key={s.event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link href={`/events/${s.event.id}/manage`}>
                        <div className="group flex items-center gap-5 p-5 rounded-xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(0,212,255,0.2)] transition-all duration-300 cursor-pointer">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-[rgba(0,212,255,0.1)] text-[#00D4FF] border border-[rgba(0,212,255,0.2)] text-[10px]">
                                {s.role}
                              </Badge>
                            </div>
                            <h3 className="text-base font-semibold text-white group-hover:text-[#00D4FF] transition-colors truncate">
                              {s.event.title}
                            </h3>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[rgb(63,63,63)] group-hover:text-[#00D4FF] transition-colors" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  ArrowUpRight,
  Search,
  Zap,
  Globe,
  Trophy,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getPublicEvents } from '@/app/actions/event-actions';
import Link from 'next/link';

type EventType = 'HACKATHON' | 'CONFERENCE' | 'WORKSHOP' | 'MEETUP' | 'COMPETITION' | 'WEBINAR';

interface EventData {
  id: string;
  title: string;
  tagline: string | null;
  description: string;
  type: EventType;
  status: string;
  coverImage: string | null;
  startDate: string;
  endDate: string;
  location: string | null;
  isVirtual: boolean;
  tags: string[];
  skills: string[];
  host: { id: string; displayName: string | null; profileImageUrl: string | null };
  _count: { teams: number; rounds: number };
}

const typeColors: Record<EventType, string> = {
  HACKATHON: 'bg-[rgba(218,255,1,0.12)] text-[#DAFF01] border-[rgba(218,255,1,0.25)]',
  CONFERENCE: 'bg-[rgba(0,212,255,0.1)] text-[#00D4FF] border-[rgba(0,212,255,0.25)]',
  WORKSHOP: 'bg-[rgba(127,74,142,0.15)] text-[#C084FC] border-[rgba(127,74,142,0.3)]',
  MEETUP: 'bg-[rgba(255,107,53,0.1)] text-[#FF6B35] border-[rgba(255,107,53,0.25)]',
  COMPETITION: 'bg-[rgba(255,215,0,0.1)] text-[#FFD700] border-[rgba(255,215,0,0.25)]',
  WEBINAR: 'bg-[rgba(99,179,237,0.1)] text-[#63B3ED] border-[rgba(99,179,237,0.25)]',
};

const typeLabels: Record<EventType, string> = {
  HACKATHON: 'Hackathon',
  CONFERENCE: 'Conference',
  WORKSHOP: 'Workshop',
  MEETUP: 'Meetup',
  COMPETITION: 'Competition',
  WEBINAR: 'Webinar',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDateParts(dateStr: string) {
  const d = new Date(dateStr);
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }),
    day: d.getDate().toString(),
  };
}

function FeaturedEventCard({ event }: { event: EventData }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <Link href={`/events/${event.id}`}>
        <div className="group relative rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.06)] hover:border-[rgba(218,255,1,0.3)] transition-all duration-300 cursor-pointer">
          <div className="relative h-[220px] overflow-hidden">
            {event.coverImage ? (
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[rgba(218,255,1,0.1)] to-[rgba(0,212,255,0.05)] flex items-center justify-center">
                <Zap className="w-12 h-12 text-[rgba(218,255,1,0.3)]" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgb(17,17,19)] via-[rgba(17,17,19,0.4)] to-transparent" />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className={`border ${typeColors[event.type]}`}>
                {typeLabels[event.type]}
              </Badge>
              {event.isVirtual && (
                <Badge className="bg-[rgba(99,179,237,0.1)] text-[#63B3ED] border border-[rgba(99,179,237,0.25)]">
                  Virtual
                </Badge>
              )}
            </div>
          </div>

          <div className="p-6 bg-[rgb(26,28,30)]">
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#DAFF01] transition-colors duration-200">
              {event.title}
            </h3>
            {event.tagline && (
              <p className="text-[rgb(161,161,170)] text-sm mb-3">{event.tagline}</p>
            )}
            <p className="text-[rgb(161,161,170)] text-[14px] leading-relaxed mb-4 line-clamp-2">
              {event.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[rgb(161,161,170)]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#DAFF01]" />
                {formatDate(event.startDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#DAFF01]" />
                {event.isVirtual ? 'Virtual' : event.location || 'TBD'}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#DAFF01]" />
                {event._count.teams} teams
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {event.host.profileImageUrl ? (
                  <img src={event.host.profileImageUrl} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[rgba(218,255,1,0.15)] flex items-center justify-center text-[10px] text-[#DAFF01] font-bold">
                    {(event.host.displayName || 'U')[0]}
                  </div>
                )}
                <span className="text-xs text-[rgb(130,130,140)]">
                  by {event.host.displayName || 'Unknown'}
                </span>
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-[#DAFF01] group-hover:gap-2 transition-all duration-200">
                View Details <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function EventListCard({ event, index }: { event: EventData; index: number }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const dateParts = getDateParts(event.startDate);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={`/events/${event.id}`}>
        <div className="group flex items-start gap-5 p-5 rounded-xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(218,255,1,0.2)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[rgba(218,255,1,0.08)] flex flex-col items-center justify-center">
            <span className="text-xs text-[#DAFF01] font-medium leading-none uppercase">{dateParts.month}</span>
            <span className="text-lg font-bold text-white leading-none mt-0.5">{dateParts.day}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={`text-[10px] border ${typeColors[event.type]} py-0 px-2`}>
                {typeLabels[event.type]}
              </Badge>
              {event._count.rounds > 0 && (
                <span className="text-[10px] text-[rgb(130,130,140)]">{event._count.rounds} rounds</span>
              )}
            </div>
            <h4 className="text-base font-semibold text-white mb-1 group-hover:text-[#DAFF01] transition-colors duration-200 truncate">
              {event.title}
            </h4>
            <p className="text-sm text-[rgb(161,161,170)] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {event.isVirtual ? 'Virtual' : event.location || 'TBD'}
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[rgb(63,63,63)] group-hover:text-[#DAFF01] transition-colors duration-200 flex-shrink-0 mt-1" />
        </div>
      </Link>
    </motion.div>
  );
}

const filterTypes: { label: string; value: EventType | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Hackathon', value: 'HACKATHON' },
  { label: 'Conference', value: 'CONFERENCE' },
  { label: 'Workshop', value: 'WORKSHOP' },
  { label: 'Meetup', value: 'MEETUP' },
  { label: 'Competition', value: 'COMPETITION' },
  { label: 'Webinar', value: 'WEBINAR' },
];

export default function EventsLayout() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<EventType | 'ALL'>('ALL');
  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const data = await getPublicEvents();
      setEvents(
        (data || []).map((e: Record<string, unknown>) => ({
          ...e,
          startDate: (e.startDate as Date)?.toISOString?.() ?? String(e.startDate),
          endDate: (e.endDate as Date)?.toISOString?.() ?? String(e.endDate),
        })) as unknown as EventData[]
      );
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = events.filter((e) => {
    const matchesType = activeFilter === 'ALL' || e.type === activeFilter;
    const matchesSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const featured = filtered.slice(0, 2);
  const rest = filtered.slice(2);

  return (
    <div className="min-h-screen bg-[rgb(17,17,19)]">
      {/* Hero */}
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-3xl mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(100,100,110)]" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 py-6 bg-[rgb(26,28,30)] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[rgb(100,100,110)] rounded-xl focus:border-[rgba(218,255,1,0.3)] focus:ring-1 focus:ring-[rgba(218,255,1,0.2)]"
              />
            </div>
          </motion.div>

          {/* Type Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {filterTypes.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                  activeFilter === f.value
                    ? 'bg-[rgba(218,255,1,0.12)] text-[#DAFF01] border-[rgba(218,255,1,0.3)]'
                    : 'bg-transparent text-[rgb(161,161,170)] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)] hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="pb-24">
        <div className="max-w-[1200px] mx-auto px-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#DAFF01] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-[rgba(218,255,1,0.08)] flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-[#DAFF01]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
              <p className="text-[rgb(161,161,170)] mb-6">
                {search ? 'Try a different search term.' : 'Be the first to host an event!'}
              </p>
              <Link
                href="/events/host"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] transition-all duration-200 hover:bg-[rgb(166,190,21)] hover:shadow-[0_8px_25px_rgba(218,255,1,0.3)]"
              >
                <Zap className="w-4 h-4" /> Host an Event
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {featured.map((event) => (
                    <FeaturedEventCard key={event.id} event={event} />
                  ))}
                </div>
                <div className="flex flex-col gap-4">
                  {rest.map((event, i) => (
                    <EventListCard key={event.id} event={event} index={i} />
                  ))}
                  {rest.length === 0 && featured.length > 0 && (
                    <div className="flex items-center justify-center h-full text-[rgb(100,100,110)] text-sm">
                      More events coming soon...
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

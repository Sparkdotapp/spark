import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, MapPin, Users, ArrowRight, ArrowUpRight } from 'lucide-react';
import { upcomingEvents } from '../../data/mock';
import { Badge } from '../ui/badge';

type EventType = 'Hackathon' | 'Conference' | 'Workshop' | 'Meetup';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  type: EventType;
  attendees: number;
  image: string | null;
  featured: boolean;
}

interface EventProps {
  event: Event;
}

interface EventCardProps {
  event: Event;
  index: number;
}

const typeColors: Record<EventType, string> = {
  Hackathon: 'bg-[rgba(218,255,1,0.12)] text-[#DAFF01] border-[rgba(218,255,1,0.25)]',
  Conference: 'bg-[rgba(0,212,255,0.1)] text-[#00D4FF] border-[rgba(0,212,255,0.25)]',
  Workshop: 'bg-[rgba(127,74,142,0.15)] text-[#C084FC] border-[rgba(127,74,142,0.3)]',
  Meetup: 'bg-[rgba(255,107,53,0.1)] text-[#FF6B35] border-[rgba(255,107,53,0.25)]',
};

const FeaturedEvent = ({ event }: EventProps) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="group relative rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.06)] hover:border-[rgba(218,255,1,0.3)] transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-[260px] overflow-hidden">
        <img
          src={event.image || ''}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(17,17,19)] via-[rgba(17,17,19,0.4)] to-transparent" />
        <Badge className={`absolute top-4 left-4 border ${typeColors[event.type]}`}>
          {event.type}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-6 bg-[rgb(26,28,30)]">
        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#DAFF01] transition-colors duration-200">
          {event.title}
        </h3>
        <p className="text-[rgb(161,161,170)] text-[15px] leading-relaxed mb-5">
          {event.description}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-[rgb(161,161,170)]">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#DAFF01]" />
            {event.date}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#DAFF01]" />
            {event.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#DAFF01]" />
            {event.attendees.toLocaleString()} attending
          </span>
        </div>
        <button className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#DAFF01] hover:gap-3 transition-all duration-200">
          Register Now <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const EventCard = ({ event, index }: EventCardProps) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group flex items-start gap-5 p-5 rounded-xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(218,255,1,0.2)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Date Block */}
      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[rgba(218,255,1,0.08)] flex flex-col items-center justify-center">
        <span className="text-xs text-[#DAFF01] font-medium leading-none">{event.date.split(' ')[0]}</span>
        <span className="text-lg font-bold text-white leading-none mt-0.5">{event.date.split(' ')[1]?.replace(',', '')}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className={`text-[10px] border ${typeColors[event.type]} py-0 px-2`}>
            {event.type}
          </Badge>
        </div>
        <h4 className="text-base font-semibold text-white mb-1 group-hover:text-[#DAFF01] transition-colors duration-200">
          {event.title}
        </h4>
        <p className="text-sm text-[rgb(161,161,170)] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          {event.location}
        </p>
      </div>

      <ArrowUpRight className="w-4 h-4 text-[rgb(63,63,63)] group-hover:text-[#DAFF01] transition-colors duration-200 flex-shrink-0 mt-1" />
    </motion.div>
  );
};

export const EventsSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const featured = upcomingEvents.filter((e: Event) => e.featured);
  const rest = upcomingEvents.filter((e: Event) => !e.featured);

  return (
    <section id="events" className="relative py-24 md:py-32">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(218,255,1,0.03)_0%,transparent_70%)]" />

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <span className="inline-block text-sm font-semibold text-[#DAFF01] tracking-widest uppercase mb-4">
              Upcoming
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Tech Events
            </h2>
          </div>
          <button className="flex items-center gap-2 text-sm font-semibold text-[rgb(218,218,218)] hover:text-[#DAFF01] transition-colors duration-200">
            View All Events <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Featured Event */}
          <div>
            {featured.map((event) => (
              <FeaturedEvent key={event.id} event={event} />
            ))}
          </div>

          {/* Event List */}
          <div className="flex flex-col gap-4">
            {rest.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

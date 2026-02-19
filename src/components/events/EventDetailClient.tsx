'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@stackframe/stack';
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Globe,
  Trophy,
  Clock,
  Zap,
  Tag,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { registerTeam } from '@/app/actions/event-actions';

interface EventDetailProps {
  event: {
    id: string;
    title: string;
    tagline: string | null;
    description: string;
    type: string;
    status: string;
    coverImage: string | null;
    startDate: string;
    endDate: string;
    registrationStart: string | null;
    registrationEnd: string | null;
    location: string | null;
    isVirtual: boolean;
    virtualLink: string | null;
    maxTeamSize: number;
    minTeamSize: number;
    maxParticipants: number | null;
    tags: string[];
    skills: string[];
    host: { id: string; displayName: string | null; email: string; profileImageUrl: string | null };
    rounds: { id: string; title: string; roundNumber: number; status: string }[];
    teams: { id: string; name: string; members: { user: { id: string; displayName: string | null } }[] }[];
    prizes: { id: string; title: string; description: string | null; amount: string | null; position: number | null }[];
    sponsors: { id: string; name: string; logoUrl: string | null; websiteUrl: string | null; tier: string }[];
    staff: { id: string; role: string; user: { id: string; displayName: string | null; email: string } }[];
    _count: { teams: number; rounds: number };
  };
}

const typeColors: Record<string, string> = {
  HACKATHON: 'bg-[rgba(218,255,1,0.12)] text-[#DAFF01] border-[rgba(218,255,1,0.25)]',
  CONFERENCE: 'bg-[rgba(0,212,255,0.1)] text-[#00D4FF] border-[rgba(0,212,255,0.25)]',
  WORKSHOP: 'bg-[rgba(127,74,142,0.15)] text-[#C084FC] border-[rgba(127,74,142,0.3)]',
  MEETUP: 'bg-[rgba(255,107,53,0.1)] text-[#FF6B35] border-[rgba(255,107,53,0.25)]',
  COMPETITION: 'bg-[rgba(255,215,0,0.1)] text-[#FFD700] border-[rgba(255,215,0,0.25)]',
  WEBINAR: 'bg-[rgba(99,179,237,0.1)] text-[#63B3ED] border-[rgba(99,179,237,0.25)]',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-[rgba(161,161,170,0.1)] text-[rgb(161,161,170)] border-[rgba(161,161,170,0.2)]',
  PUBLISHED: 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] border-[rgba(34,197,94,0.2)]',
  ONGOING: 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border-[rgba(59,130,246,0.2)]',
  COMPLETED: 'bg-[rgba(161,161,170,0.1)] text-[rgb(161,161,170)] border-[rgba(161,161,170,0.2)]',
  CANCELLED: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border-[rgba(239,68,68,0.2)]',
};

const tierOrder: Record<string, number> = { TITLE: 0, GOLD: 1, SILVER: 2, BRONZE: 3, PARTNER: 4 };

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EventDetailClient({ event }: EventDetailProps) {
  const user = useUser();
  const [showRegister, setShowRegister] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const isHost = user?.id === event.host.id;
  const sortedSponsors = [...event.sponsors].sort((a, b) => (tierOrder[a.tier] ?? 5) - (tierOrder[b.tier] ?? 5));

  async function handleRegister() {
    if (!teamName.trim()) return;
    setRegistering(true);
    setRegError('');
    try {
      const result = await registerTeam(event.id, { teamName: teamName.trim() });
      if (result.success) {
        setRegSuccess(true);
        setShowRegister(false);
      } else {
        setRegError(result.error || 'Failed to register');
      }
    } catch (err) {
      setRegError((err as Error).message);
    } finally {
      setRegistering(false);
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(17,17,19)]">
      {/* Hero */}
      <section className="relative pt-24 pb-8">
        {event.coverImage && (
          <div className="absolute inset-0 h-[350px] overflow-hidden">
            <img src={event.coverImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(17,17,19,0.3)] to-[rgb(17,17,19)]" />
          </div>
        )}

        <div className="relative max-w-[1000px] mx-auto px-6 pt-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm text-[rgb(161,161,170)] hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All Events
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className={`border ${typeColors[event.type] || typeColors.HACKATHON}`}>
              {event.type}
            </Badge>
            <Badge className={`border ${statusColors[event.status] || statusColors.DRAFT}`}>
              {event.status}
            </Badge>
            {event.isVirtual && (
              <Badge className="bg-[rgba(99,179,237,0.1)] text-[#63B3ED] border border-[rgba(99,179,237,0.25)]">
                <Globe className="w-3 h-3 mr-1" /> Virtual
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">{event.title}</h1>
          {event.tagline && (
            <p className="text-lg text-[rgb(200,200,210)] mb-6">{event.tagline}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-[rgb(161,161,170)] mb-8">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#DAFF01]" />
              {formatDate(event.startDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#DAFF01]" />
              {formatDate(event.endDate)}
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

          {/* Host + CTA row */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-3">
              {event.host.profileImageUrl ? (
                <img src={event.host.profileImageUrl} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[rgba(218,255,1,0.15)] flex items-center justify-center text-sm text-[#DAFF01] font-bold">
                  {(event.host.displayName || 'U')[0]}
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-white">{event.host.displayName || event.host.email}</div>
                <div className="text-xs text-[rgb(130,130,140)]">Organizer</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isHost && (
                <Link
                  href={`/events/${event.id}/manage`}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl border-2 border-[rgba(218,255,1,0.4)] text-[#DAFF01] hover:bg-[rgba(218,255,1,0.08)] transition-all"
                >
                  Manage Event
                </Link>
              )}
              {!isHost && !regSuccess && event.status !== 'DRAFT' && event.status !== 'CANCELLED' && (
                <button
                  onClick={() => setShowRegister(true)}
                  className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] hover:bg-[rgb(166,190,21)] hover:shadow-[0_8px_25px_rgba(218,255,1,0.3)] transition-all"
                >
                  Register Now
                </button>
              )}
              {regSuccess && (
                <span className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[rgba(34,197,94,0.1)] text-[#22C55E] border border-[rgba(34,197,94,0.2)]">
                  ✓ Registered
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)] backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-4 p-6 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.08)]"
          >
            <h3 className="text-lg font-bold text-white mb-4">Register for {event.title}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-[rgb(200,200,210)]">Team Name</label>
                <Input
                  placeholder="Enter your team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
                />
              </div>
              {regError && <p className="text-sm text-red-400">{regError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRegister(false)}
                  className="flex-1 py-2.5 text-sm rounded-xl border border-[rgba(255,255,255,0.1)] text-[rgb(161,161,170)] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegister}
                  disabled={registering || !teamName.trim()}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] disabled:opacity-40"
                >
                  {registering ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Register'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Content */}
      <section className="max-w-[1000px] mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="p-6 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)]">
              <h2 className="text-lg font-bold text-white mb-4">About</h2>
              <p className="text-[rgb(200,200,210)] leading-relaxed whitespace-pre-wrap">{event.description}</p>
              {(event.tags.length > 0 || event.skills.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  {event.tags.map((tag) => (
                    <Badge key={tag} className="bg-[rgba(218,255,1,0.08)] text-[#DAFF01] border-[rgba(218,255,1,0.2)]">
                      {tag}
                    </Badge>
                  ))}
                  {event.skills.map((skill) => (
                    <Badge key={skill} className="bg-[rgba(0,212,255,0.08)] text-[#00D4FF] border-[rgba(0,212,255,0.2)]">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Rounds */}
            {event.rounds.length > 0 && (
              <div className="p-6 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)]">
                <h2 className="text-lg font-bold text-white mb-4">Rounds</h2>
                <div className="space-y-3">
                  {event.rounds.map((round) => (
                    <div
                      key={round.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-[rgb(17,17,19)] border border-[rgba(255,255,255,0.04)]"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[rgba(218,255,1,0.08)] flex items-center justify-center text-sm font-bold text-[#DAFF01]">
                        R{round.roundNumber}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{round.title}</div>
                      </div>
                      <Badge className={`text-[10px] border ${
                        round.status === 'ACTIVE' ? 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] border-[rgba(34,197,94,0.2)]' :
                        round.status === 'COMPLETED' ? 'bg-[rgba(161,161,170,0.1)] text-[rgb(161,161,170)] border-[rgba(161,161,170,0.2)]' :
                        'bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border-[rgba(59,130,246,0.2)]'
                      }`}>
                        {round.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Registered Teams */}
            {event.teams.length > 0 && (
              <div className="p-6 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)]">
                <h2 className="text-lg font-bold text-white mb-4">
                  Registered Teams ({event.teams.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.teams.map((team) => (
                    <div
                      key={team.id}
                      className="p-3 rounded-xl bg-[rgb(17,17,19)] border border-[rgba(255,255,255,0.04)] flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[rgba(218,255,1,0.08)] flex items-center justify-center text-xs font-bold text-[#DAFF01]">
                        {team.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{team.name}</div>
                        <div className="text-xs text-[rgb(130,130,140)]">{team.members.length} members</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick Info */}
            <div className="p-5 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] space-y-4">
              <div>
                <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Team Size</div>
                <div className="text-sm text-white">{event.minTeamSize} - {event.maxTeamSize} members</div>
              </div>
              {event.maxParticipants && (
                <div>
                  <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Max Participants</div>
                  <div className="text-sm text-white">{event.maxParticipants}</div>
                </div>
              )}
              {event.registrationEnd && (
                <div>
                  <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Registration Deadline</div>
                  <div className="text-sm text-white">
                    {new Date(event.registrationEnd).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              )}
              {event.virtualLink && (
                <div>
                  <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Meeting Link</div>
                  <a
                    href={event.virtualLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#DAFF01] flex items-center gap-1 hover:underline"
                  >
                    Join <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Prizes */}
            {event.prizes.length > 0 && (
              <div className="p-5 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)]">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#DAFF01]" /> Prizes
                </h3>
                <div className="space-y-3">
                  {event.prizes.map((prize) => (
                    <div key={prize.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(255,215,0,0.08)] flex items-center justify-center text-sm">
                        {prize.position === 1 ? '🥇' : prize.position === 2 ? '🥈' : prize.position === 3 ? '🥉' : '🏆'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{prize.title}</div>
                        {prize.amount && <div className="text-xs text-[#DAFF01]">{prize.amount}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sponsors */}
            {sortedSponsors.length > 0 && (
              <div className="p-5 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)]">
                <h3 className="text-sm font-bold text-white mb-3">Sponsors</h3>
                <div className="space-y-3">
                  {sortedSponsors.map((sponsor) => (
                    <div key={sponsor.id} className="flex items-center gap-3">
                      {sponsor.logoUrl ? (
                        <img src={sponsor.logoUrl} alt="" className="w-8 h-8 rounded-lg object-contain bg-white p-1" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center text-xs font-bold text-white">
                          {sponsor.name[0]}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">{sponsor.name}</div>
                        <div className="text-[10px] text-[rgb(130,130,140)] uppercase">{sponsor.tier}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}

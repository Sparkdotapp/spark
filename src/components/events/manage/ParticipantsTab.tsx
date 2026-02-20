'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getEventParticipants, promoteTeams } from '@/app/actions/event-actions';
import type { ManagedEvent } from './EventManageClient';

const participationColors: Record<string, string> = {
  IN_PROGRESS: 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border-[rgba(59,130,246,0.2)]',
  SHORTLISTED: 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] border-[rgba(34,197,94,0.2)]',
  REJECTED: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border-[rgba(239,68,68,0.2)]',
};

export function ParticipantsTab({ event }: { event: ManagedEvent }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [promoting, setPromoting] = useState(false);
  const [selectedRound, setSelectedRound] = useState<string>('');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const teams = event.teams || [];
  const filteredTeams = teams.filter((t: any) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  function toggleTeamSelection(teamId: string) {
    setSelectedTeams((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  }

  async function handlePromote() {
    if (!selectedRound || selectedTeams.length === 0) return;
    setPromoting(true);
    try {
      await promoteTeams(selectedRound, selectedTeams);
      setSelectedTeams([]);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setPromoting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-white">Teams ({teams.length})</h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(100,100,110)]" />
          <Input
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[rgb(26,28,30)] border-[rgba(255,255,255,0.08)] text-white"
          />
        </div>
      </div>

      {/* Promote Action Bar */}
      {event.rounds.length > 0 && teams.length > 0 && (
        <div className="p-4 rounded-xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="text-xs text-[rgb(130,130,140)] whitespace-nowrap">Promote selected teams to round:</span>
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg bg-[rgb(17,17,19)] border border-[rgba(255,255,255,0.08)] text-white outline-none"
          >
            <option value="">Select Round</option>
            {event.rounds.map((r) => (
              <option key={r.id} value={r.id}>
                R{r.roundNumber}: {r.title}
              </option>
            ))}
          </select>
          <button
            onClick={handlePromote}
            disabled={promoting || !selectedRound || selectedTeams.length === 0}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] disabled:opacity-40 transition-all"
          >
            {promoting && <Loader2 className="w-4 h-4 animate-spin" />}
            Promote {selectedTeams.length > 0 ? `(${selectedTeams.length})` : ''}
          </button>
        </div>
      )}

      {/* Teams List */}
      {filteredTeams.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-[rgba(255,255,255,0.1)] text-center">
          <Users className="w-10 h-10 mx-auto text-[rgb(70,70,80)] mb-3" />
          <p className="text-[rgb(130,130,140)] mb-1">
            {search ? 'No teams match your search' : 'No teams registered yet'}
          </p>
          <p className="text-sm text-[rgb(100,100,110)]">
            Teams will appear here once participants register.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTeams.map((team: any) => (
            <div
              key={team.id}
              className="rounded-xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] overflow-hidden"
            >
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedTeams.includes(team.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleTeamSelection(team.id);
                  }}
                  className="w-4 h-4 rounded border-[rgba(255,255,255,0.2)] accent-[#DAFF01] cursor-pointer"
                />
                <div className="w-9 h-9 rounded-lg bg-[rgba(218,255,1,0.06)] flex items-center justify-center text-xs font-bold text-[#DAFF01]">
                  {team.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{team.name}</div>
                  <div className="text-xs text-[rgb(130,130,140)]">
                    {team.members?.length || 0} member{(team.members?.length || 0) !== 1 ? 's' : ''} · Joined{' '}
                    {new Date(team.registeredAt).toLocaleDateString()}
                  </div>
                </div>
                {expandedTeam === team.id ? (
                  <ChevronUp className="w-4 h-4 text-[rgb(100,100,110)]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[rgb(100,100,110)]" />
                )}
              </div>

              {expandedTeam === team.id && (
                <div className="px-4 pb-4 pt-2 border-t border-[rgba(255,255,255,0.04)] space-y-3">
                  <div className="text-xs font-semibold text-[rgb(130,130,140)] uppercase">Members</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(team.members || []).map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[rgb(17,17,19)]"
                      >
                        <div className="w-7 h-7 rounded-full bg-[rgba(218,255,1,0.1)] flex items-center justify-center text-[10px] font-bold text-[#DAFF01]">
                          {member.user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white truncate">{member.user?.name || 'Unknown'}</div>
                          <div className="text-[10px] text-[rgb(100,100,110)] truncate">
                            {member.role === 'LEADER' ? 'Team Lead' : 'Member'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Round Participation */}
                  {team.roundParticipations && team.roundParticipations.length > 0 && (
                    <>
                      <div className="text-xs font-semibold text-[rgb(130,130,140)] uppercase mt-4">Round Progress</div>
                      <div className="flex flex-wrap gap-2">
                        {team.roundParticipations.map((rp: any) => (
                          <div
                            key={rp.id}
                            className="px-3 py-1.5 rounded-lg bg-[rgb(17,17,19)] text-xs text-white flex items-center gap-2"
                          >
                            <span>R{rp.round?.roundNumber}</span>
                            <Badge className={`text-[9px] border ${participationColors[rp.status] || ''}`}>
                              {rp.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

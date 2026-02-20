'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Megaphone,
  Users,
  FileText,
  ExternalLink,
  Search,
  X,
  Crown,
  Calendar,
  Github,
  Linkedin,
  Phone,
  Mail,
  GraduationCap,
  Building2,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  createRound,
  updateRound,
  deleteRound,
  getRoundParticipants,
  shortlistTeam,
  rejectTeam,
  rollbackTeam,
  declareResult,
} from '@/app/actions/event-actions';
import type { ManagedEvent } from './EventManageClient';

const roundStatusColors: Record<string, string> = {
  UPCOMING: 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border-[rgba(59,130,246,0.2)]',
  ACTIVE: 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] border-[rgba(34,197,94,0.2)]',
  EVALUATING: 'bg-[rgba(255,215,0,0.1)] text-[#FFD700] border-[rgba(255,215,0,0.2)]',
  COMPLETED: 'bg-[rgba(161,161,170,0.1)] text-[rgb(161,161,170)] border-[rgba(161,161,170,0.2)]',
};

const participationStatusColors: Record<string, string> = {
  IN_PROGRESS: 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border-[rgba(59,130,246,0.2)]',
  SHORTLISTED: 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] border-[rgba(34,197,94,0.2)]',
  REJECTED: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border-[rgba(239,68,68,0.2)]',
};

function calcAge(dob: string | null) {
  if (!dob) return null;
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export function RoundsTab({ event }: { event: ManagedEvent }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedRound, setSelectedRound] = useState<string | null>(
    event.rounds.length > 0 ? event.rounds[0].id : null
  );
  const [activeFilter, setActiveFilter] = useState<'all' | 'IN_PROGRESS' | 'SHORTLISTED' | 'REJECTED'>('all');
  const [participants, setParticipants] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [declaring, setDeclaring] = useState(false);
  const [showDeclareConfirm, setShowDeclareConfirm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    submissionDeadline: '',
    requiresSubmission: false,
    taskDescription: '',
  });

  const currentRound = event.rounds.find((r) => r.id === selectedRound);

  const fetchParticipants = useCallback(async () => {
    if (!selectedRound) return;
    setLoadingParticipants(true);
    try {
      const result = await getRoundParticipants(selectedRound);
      if (result.success) setParticipants(result.participations);
    } catch { /* ignore */ }
    finally { setLoadingParticipants(false); }
  }, [selectedRound]);

  useEffect(() => { fetchParticipants(); }, [fetchParticipants]);

  const filtered = participants.filter((p: any) => {
    const matchesFilter = activeFilter === 'all' || p.status === activeFilter;
    const matchesSearch = !search || p.team.name.toLowerCase().includes(search.toLowerCase()) ||
      p.team.members.some((m: any) =>
        (m.user.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.user.email || '').toLowerCase().includes(search.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: participants.length,
    IN_PROGRESS: participants.filter((p: any) => p.status === 'IN_PROGRESS').length,
    SHORTLISTED: participants.filter((p: any) => p.status === 'SHORTLISTED').length,
    REJECTED: participants.filter((p: any) => p.status === 'REJECTED').length,
  };

  async function handleCreate() {
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const result = await createRound(event.id, {
        title: form.title,
        description: form.description || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        submissionDeadline: form.submissionDeadline || undefined,
        requiresSubmission: form.requiresSubmission,
        taskDescription: form.taskDescription || undefined,
      });
      if (result.success) {
        setShowCreate(false);
        setForm({ title: '', description: '', startDate: '', endDate: '', submissionDeadline: '', requiresSubmission: false, taskDescription: '' });
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  async function handleStatusChange(roundId: string, status: string) {
    try {
      await updateRound(roundId, { status: status as any });
      router.refresh();
    } catch (err) { console.error(err); }
  }

  async function handleDelete(roundId: string) {
    if (!confirm('Delete this round? This action cannot be undone.')) return;
    try {
      await deleteRound(roundId);
      if (selectedRound === roundId) setSelectedRound(event.rounds[0]?.id || null);
      router.refresh();
    } catch (err) { console.error(err); }
  }

  async function handleShortlist(teamId: string) {
    if (!selectedRound) return;
    setActionLoading(teamId);
    try {
      await shortlistTeam(selectedRound, teamId);
      await fetchParticipants();
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  }

  async function handleReject(teamId: string) {
    if (!selectedRound) return;
    setActionLoading(teamId);
    try {
      await rejectTeam(selectedRound, teamId);
      await fetchParticipants();
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  }

  async function handleRollback(teamId: string) {
    if (!selectedRound) return;
    setActionLoading(teamId);
    try {
      await rollbackTeam(selectedRound, teamId);
      await fetchParticipants();
      router.refresh();
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  }

  async function handleDeclareResult() {
    if (!selectedRound || (activeFilter !== 'SHORTLISTED' && activeFilter !== 'REJECTED')) return;
    setDeclaring(true);
    try {
      const resultType = activeFilter === 'SHORTLISTED' ? 'shortlisted' : 'rejected';
      await declareResult(selectedRound, resultType);
      setShowDeclareConfirm(false);
      router.refresh();
      await fetchParticipants();
    } catch (err) { console.error(err); }
    finally { setDeclaring(false); }
  }

  const leader = (team: any) => team.members.find((m: any) => m.isLeader);

  return (
    <div className="flex gap-6 min-h-[600px]">
      {/* Left: Stages Pipeline */}
      <div className="w-[220px] shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Stages</h3>
          <button
            onClick={() => setShowCreate(true)}
            className="p-1.5 rounded-lg bg-[rgba(218,255,1,0.1)] text-[#DAFF01] hover:bg-[rgba(218,255,1,0.18)] transition-all"
            title="Add Round"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* REG stage */}
        <div className="relative">
          <div
            className="p-3 rounded-xl border border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.04)] mb-1 cursor-default"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[rgba(34,197,94,0.15)] flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-[rgb(130,130,140)] uppercase">REG</div>
                <div className="text-xs font-medium text-white">All Registrations</div>
              </div>
            </div>
          </div>

          {/* Connector */}
          {event.rounds.length > 0 && (
            <div className="flex justify-center py-1">
              <div className="w-px h-6 bg-[rgba(255,255,255,0.1)]" />
            </div>
          )}

          {/* Round stages */}
          {event.rounds.map((round, i) => (
            <div key={round.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => { setSelectedRound(round.id); setActiveFilter('all'); setExpandedTeam(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedRound(round.id); setActiveFilter('all'); setExpandedTeam(null); } }}
                className={`w-full p-3 rounded-xl border mb-1 text-left cursor-pointer transition-all group ${
                  selectedRound === round.id
                    ? 'border-[rgba(218,255,1,0.3)] bg-[rgba(218,255,1,0.06)]'
                    : 'border-[rgba(255,255,255,0.06)] bg-[rgb(26,28,30)] hover:border-[rgba(255,255,255,0.12)]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold ${
                    selectedRound === round.id
                      ? 'bg-[rgba(218,255,1,0.15)] text-[#DAFF01]'
                      : 'bg-[rgba(255,255,255,0.06)] text-[rgb(130,130,140)]'
                  }`}>
                    R{round.roundNumber}
                  </div>
                  <Badge className={`text-[8px] border ${roundStatusColors[round.status]}`}>{round.status}</Badge>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(round.id); }}
                    className="ml-auto p-1 rounded opacity-0 group-hover:opacity-100 text-[rgb(100,100,110)] hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-xs font-medium text-white truncate">{round.title}</div>
                {round.requiresSubmission && (
                  <div className="text-[9px] text-[rgb(130,130,140)] mt-1 flex items-center gap-1">
                    <FileText className="w-2.5 h-2.5" /> Submission required
                  </div>
                )}
              </div>
              {/* Connector */}
              {i < event.rounds.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className="w-px h-6 bg-[rgba(255,255,255,0.1)]" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Round status controls (when round selected) */}
        {currentRound && (
          <div className="mt-4 p-3 rounded-xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)]">
            <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-2">Round Status</div>
            <div className="flex flex-wrap gap-1">
              {['UPCOMING', 'ACTIVE', 'EVALUATING', 'COMPLETED'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(currentRound.id, s)}
                  disabled={currentRound.status === s}
                  className={`px-2 py-1 text-[9px] font-medium rounded-md border transition-all disabled:opacity-30 ${
                    currentRound.status === s
                      ? 'border-[rgba(218,255,1,0.3)] text-[#DAFF01] bg-[rgba(218,255,1,0.08)]'
                      : 'border-[rgba(255,255,255,0.08)] text-[rgb(130,130,140)] hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Area */}
      <div className="flex-1 min-w-0">
        {/* Create Round Modal */}
        {showCreate && (
          <div className="mb-6 p-6 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(218,255,1,0.2)] space-y-4">
            <h3 className="text-sm font-bold text-white">New Round</h3>
            <Input
              placeholder="Round title, e.g. Ideation Phase"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
            />
            <Textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-[rgb(130,130,140)]">Start Date</label>
                <Input type="datetime-local" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[rgb(130,130,140)]">End Date</label>
                <Input type="datetime-local" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[rgb(130,130,140)]">Submission Deadline</label>
                <Input type="datetime-local" value={form.submissionDeadline} onChange={(e) => setForm((f) => ({ ...f, submissionDeadline: e.target.value }))} className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
              </div>
            </div>

            {/* Task / Submission toggle */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setForm((f) => ({ ...f, requiresSubmission: !f.requiresSubmission }))}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    form.requiresSubmission
                      ? 'border-[rgba(218,255,1,0.4)] bg-[rgba(218,255,1,0.08)] text-[#DAFF01]'
                      : 'border-[rgba(255,255,255,0.08)] text-[rgb(161,161,170)] hover:border-[rgba(255,255,255,0.2)]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  {form.requiresSubmission ? 'Submission Required' : 'No Submission'}
                </button>
              </div>
              {form.requiresSubmission && (
                <Textarea
                  placeholder="Describe the task or what participants need to submit..."
                  value={form.taskDescription}
                  onChange={(e) => setForm((f) => ({ ...f, taskDescription: e.target.value }))}
                  rows={3}
                  className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
                />
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm rounded-xl border border-[rgba(255,255,255,0.1)] text-[rgb(161,161,170)]">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !form.title.trim()} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] disabled:opacity-40">
                {creating && <Loader2 className="w-4 h-4 animate-spin" />} Create Round
              </button>
            </div>
          </div>
        )}

        {!selectedRound ? (
          <div className="p-12 rounded-2xl border border-dashed border-[rgba(255,255,255,0.1)] text-center">
            <p className="text-[rgb(130,130,140)] mb-2">No rounds yet</p>
            <p className="text-sm text-[rgb(100,100,110)]">Create your first round to define the competition pipeline.</p>
          </div>
        ) : (
          <>
            {/* Header with Tabs + Declare Result */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[rgb(26,28,30)]">
                {[
                  { key: 'all' as const, label: 'All' },
                  { key: 'IN_PROGRESS' as const, label: 'In Progress' },
                  { key: 'SHORTLISTED' as const, label: 'Shortlisted' },
                  { key: 'REJECTED' as const, label: 'Rejected' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                      activeFilter === tab.key
                        ? 'bg-[rgba(218,255,1,0.1)] text-[#DAFF01]'
                        : 'text-[rgb(130,130,140)] hover:text-white'
                    }`}
                  >
                    {tab.label} ({counts[tab.key]})
                  </button>
                ))}
              </div>

              {(activeFilter === 'SHORTLISTED' || activeFilter === 'REJECTED') && counts[activeFilter] > 0 && (
                <button
                  onClick={() => setShowDeclareConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] hover:bg-[rgb(166,190,21)] transition-all"
                >
                  <Megaphone className="w-4 h-4" /> Declare Result
                </button>
              )}
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(100,100,110)]" />
              <Input
                placeholder="Search teams or members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-[rgb(26,28,30)] border-[rgba(255,255,255,0.08)] text-white"
              />
            </div>

            {/* Task description banner */}
            {currentRound?.requiresSubmission && currentRound?.taskDescription && (
              <div className="mb-4 p-4 rounded-xl bg-[rgba(59,130,246,0.05)] border border-[rgba(59,130,246,0.15)]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#3B82F6] mb-2">
                  <FileText className="w-3.5 h-3.5" /> Round Task
                </div>
                <p className="text-sm text-[rgb(200,200,210)] whitespace-pre-wrap">{currentRound.taskDescription}</p>
              </div>
            )}

            {/* Table Header */}
            <div className="grid grid-cols-[40px_1fr_120px_100px_120px_140px] gap-3 px-4 py-2 text-[10px] uppercase font-semibold text-[rgb(100,100,110)] border-b border-[rgba(255,255,255,0.06)]">
              <div>#</div>
              <div>Team / Leader</div>
              <div>Members</div>
              <div>Status</div>
              <div>Submission</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Loading */}
            {loadingParticipants ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-[rgb(130,130,140)]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-sm text-[rgb(130,130,140)]">
                {search ? 'No matching teams found' : 'No teams in this round yet'}
              </div>
            ) : (
              <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                {filtered.map((p: any, idx: number) => {
                  const teamLeader = leader(p.team);
                  const isExpanded = expandedTeam === p.team.id;

                  return (
                    <div key={p.id}>
                      {/* Team Row */}
                      <div
                        className="grid grid-cols-[40px_1fr_120px_100px_120px_140px] gap-3 px-4 py-3 items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer"
                        onClick={() => setExpandedTeam(isExpanded ? null : p.team.id)}
                      >
                        <div className="text-xs text-[rgb(130,130,140)]">{idx + 1}</div>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-[rgba(218,255,1,0.06)] flex items-center justify-center text-xs font-bold text-[#DAFF01] shrink-0">
                            {p.team.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{p.team.name}</div>
                            <div className="text-[11px] text-[rgb(130,130,140)] truncate">
                              {teamLeader ? (teamLeader.user.displayName || teamLeader.user.email) : 'No leader'}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-[rgb(200,200,210)]">
                          <span className="text-[#DAFF01]">{p.team.members.length}</span> Player{p.team.members.length !== 1 ? 's' : ''}
                        </div>
                        <div>
                          <Badge className={`text-[9px] border ${participationStatusColors[p.status]}`}>
                            {p.status === 'IN_PROGRESS' ? 'In Progress' : p.status === 'SHORTLISTED' ? 'Shortlisted' : 'Rejected'}
                          </Badge>
                        </div>
                        <div className="text-xs">
                          {currentRound?.requiresSubmission ? (
                            p.submittedAt ? (
                              <span className="text-[#22C55E] flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Done</span>
                            ) : (
                              <span className="text-[rgb(130,130,140)]">Pending</span>
                            )
                          ) : (
                            <span className="text-[rgb(80,80,90)]">—</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                          {actionLoading === p.team.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[rgb(130,130,140)]" />
                          ) : (
                            <>
                              {p.status === 'IN_PROGRESS' && (
                                <>
                                  <button onClick={() => handleShortlist(p.team.id)} className="p-1.5 rounded-lg text-[#22C55E] hover:bg-[rgba(34,197,94,0.1)] transition-all" title="Shortlist">
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleReject(p.team.id)} className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] transition-all" title="Reject">
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button onClick={() => handleRollback(p.team.id)} className="p-1.5 rounded-lg text-[rgb(161,161,170)] hover:bg-[rgba(255,255,255,0.06)] transition-all" title="Rollback">
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Expanded: Member Profiles */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3 bg-[rgba(255,255,255,0.01)]">
                          {/* Submission details */}
                          {currentRound?.requiresSubmission && p.submittedAt && (
                            <div className="p-3 rounded-xl bg-[rgba(34,197,94,0.04)] border border-[rgba(34,197,94,0.1)]">
                              <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Submission</div>
                              <div className="flex items-center gap-4 text-xs">
                                <span className="text-[rgb(200,200,210)] flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {new Date(p.submittedAt).toLocaleString()}
                                </span>
                                {p.submissionUrl && (
                                  <a href={p.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-[#DAFF01] hover:underline flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3" /> View Submission
                                  </a>
                                )}
                              </div>
                              {p.submissionNotes && <p className="text-xs text-[rgb(200,200,210)] mt-2 whitespace-pre-wrap">{p.submissionNotes}</p>}
                            </div>
                          )}

                          {p.team.members.map((member: any) => {
                            const u = member.user;
                            const age = calcAge(u.dateOfBirth);
                            const eduParts = u.isGraduated
                              ? [u.designation && u.company ? `${u.designation} at ${u.company}` : (u.company || u.designation), u.college, u.graduationYear ? `Class of ${u.graduationYear}` : null].filter(Boolean)
                              : ['College Student', u.degree, u.course, u.graduationYear ? `${u.graduationYear}` : null].filter(Boolean);
                            return (
                              <div key={member.id} className="p-5 rounded-xl bg-[rgb(22,23,26)] border border-[rgba(255,255,255,0.06)]">
                                {/* Badge row */}
                                <div className="mb-3">
                                  {member.isLeader ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[rgba(218,255,1,0.08)] border border-[rgba(218,255,1,0.18)] text-[#DAFF01] text-[10px] font-semibold">
                                      <Crown className="w-3 h-3" /> Team Leader
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[rgba(251,191,36,0.08)] border border-[rgba(251,191,36,0.18)] text-[#FBB924] text-[10px] font-semibold">
                                      <Users className="w-3 h-3" /> Team Member
                                    </span>
                                  )}
                                </div>

                                {/* Name + avatar row */}
                                <div className="flex items-center gap-4 mb-4">
                                  {u.profileImageUrl ? (
                                    <img src={u.profileImageUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-[rgba(255,255,255,0.08)]" />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-[rgba(218,255,1,0.08)] flex items-center justify-center text-base font-bold text-[#DAFF01] border border-[rgba(218,255,1,0.12)]">
                                      {(u.displayName || u.email || '?')[0].toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-base font-bold text-white">{u.displayName || u.email}</span>
                                      {(u.phone || u.college) && (
                                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[rgba(34,197,94,0.15)]">
                                          <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                                        </span>
                                      )}
                                    </div>
                                    {age !== null && <div className="text-xs text-[rgb(130,130,140)]">Age {age}</div>}
                                  </div>
                                </div>

                                {/* Detail rows */}
                                <div className="space-y-2.5">
                                  {u.college && (
                                    <div className="flex items-start gap-3 text-sm text-[rgb(200,200,210)]">
                                      <Building2 className="w-4 h-4 text-[rgb(100,100,110)] mt-0.5 shrink-0" />
                                      <span>{u.college}</span>
                                    </div>
                                  )}
                                  {u.phone && (
                                    <div className="flex items-center gap-3 text-sm text-[rgb(200,200,210)]">
                                      <Phone className="w-4 h-4 text-[rgb(100,100,110)] shrink-0" />
                                      <span>{u.phone}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-3 text-sm text-[rgb(200,200,210)]">
                                    <Mail className="w-4 h-4 text-[rgb(100,100,110)] shrink-0" />
                                    <span>{u.email}</span>
                                  </div>
                                  {eduParts.length > 1 && (
                                    <div className="flex items-start gap-3 text-sm text-[rgb(200,200,210)]">
                                      <GraduationCap className="w-4 h-4 text-[rgb(100,100,110)] mt-0.5 shrink-0" />
                                      <div className="flex flex-wrap gap-x-2 gap-y-1">
                                        {eduParts.map((part, i) => (
                                          <span key={i} className="flex items-center gap-2">
                                            {i > 0 && <span className="text-[rgb(60,60,70)]">|</span>}
                                            {part}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {/* Social links */}
                                  {(u.githubUrl || u.linkedinUrl) && (
                                    <div className="flex items-center gap-3 pt-1">
                                      {u.githubUrl && (
                                        <a href={u.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[rgb(161,161,170)] hover:text-white transition-colors">
                                          <Github className="w-3.5 h-3.5" /> GitHub
                                        </a>
                                      )}
                                      {u.linkedinUrl && (
                                        <a href={u.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[rgb(161,161,170)] hover:text-[#0A66C2] transition-colors">
                                          <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                                        </a>
                                      )}
                                    </div>
                                  )}
                                  {/* Joined date */}
                                  {member.joinedAt && (
                                    <div className="pt-2 border-t border-[rgba(255,255,255,0.04)]">
                                      <span className="text-[11px] text-[rgb(100,100,110)]">
                                        Registered on: {new Date(member.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Declare Result Confirmation */}
      {showDeclareConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)] backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 p-6 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(218,255,1,0.2)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[rgba(218,255,1,0.1)] flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-[#DAFF01]" />
              </div>
              <h3 className="text-lg font-bold text-white">Declare Result</h3>
            </div>
            <p className="text-sm text-[rgb(200,200,210)] mb-2">
              Declare <strong className="text-white">{activeFilter === 'SHORTLISTED' ? 'shortlisted' : 'rejected'}</strong> results for <strong className="text-white">R{currentRound?.roundNumber}: {currentRound?.title}</strong>?
            </p>
            <p className="text-xs text-[rgb(130,130,140)] mb-6">
              {activeFilter === 'SHORTLISTED'
                ? `${counts.SHORTLISTED} teams will be declared as shortlisted. This will mark the round as completed.`
                : `${counts.REJECTED} teams will be declared as rejected. This will mark the round as completed.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeclareConfirm(false)} className="flex-1 py-2.5 text-sm rounded-xl border border-[rgba(255,255,255,0.1)] text-[rgb(161,161,170)] hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={handleDeclareResult} disabled={declaring} className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] hover:bg-[rgb(166,190,21)] disabled:opacity-40 transition-all">
                {declaring ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Declare'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

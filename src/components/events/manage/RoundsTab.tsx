'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Play,
  CheckCircle,
  Clock,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createRound, updateRound, deleteRound } from '@/app/actions/event-actions';
import type { ManagedEvent } from './EventManageClient';

const roundStatusColors: Record<string, string> = {
  UPCOMING: 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border-[rgba(59,130,246,0.2)]',
  ACTIVE: 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] border-[rgba(34,197,94,0.2)]',
  EVALUATING: 'bg-[rgba(255,215,0,0.1)] text-[#FFD700] border-[rgba(255,215,0,0.2)]',
  COMPLETED: 'bg-[rgba(161,161,170,0.1)] text-[rgb(161,161,170)] border-[rgba(161,161,170,0.2)]',
};

export function RoundsTab({ event }: { event: ManagedEvent }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expandedRound, setExpandedRound] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    submissionDeadline: '',
  });

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
      });
      if (result.success) {
        setShowCreate(false);
        setForm({ title: '', description: '', startDate: '', endDate: '', submissionDeadline: '' });
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
      await updateRound(roundId, { status: status as 'UPCOMING' | 'ACTIVE' | 'EVALUATING' | 'COMPLETED' });
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(roundId: string) {
    if (!confirm('Delete this round? This action cannot be undone.')) return;
    try {
      await deleteRound(roundId);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Rounds ({event.rounds.length})</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] hover:bg-[rgb(166,190,21)] transition-all"
        >
          <Plus className="w-4 h-4" /> Add Round
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="p-6 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(218,255,1,0.2)] space-y-4">
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
            rows={3}
            className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-[rgb(130,130,140)]">Start Date</label>
              <Input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[rgb(130,130,140)]">End Date</label>
              <Input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[rgb(130,130,140)]">Submission Deadline</label>
              <Input
                type="datetime-local"
                value={form.submissionDeadline}
                onChange={(e) => setForm((f) => ({ ...f, submissionDeadline: e.target.value }))}
                className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm rounded-xl border border-[rgba(255,255,255,0.1)] text-[rgb(161,161,170)]"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !form.title.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] disabled:opacity-40"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Round
            </button>
          </div>
        </div>
      )}

      {/* Rounds List */}
      {event.rounds.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-[rgba(255,255,255,0.1)] text-center">
          <p className="text-[rgb(130,130,140)] mb-2">No rounds yet</p>
          <p className="text-sm text-[rgb(100,100,110)]">Add rounds to define your event&apos;s competition pipeline.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {event.rounds.map((round) => (
            <div
              key={round.id}
              className="rounded-xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] overflow-hidden"
            >
              <div
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                onClick={() => setExpandedRound(expandedRound === round.id ? null : round.id)}
              >
                <div className="w-10 h-10 rounded-lg bg-[rgba(218,255,1,0.08)] flex items-center justify-center text-sm font-bold text-[#DAFF01]">
                  R{round.roundNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{round.title}</div>
                  {round.description && (
                    <div className="text-xs text-[rgb(130,130,140)] truncate mt-0.5">{round.description}</div>
                  )}
                </div>
                <Badge className={`text-[10px] border ${roundStatusColors[round.status]}`}>{round.status}</Badge>
                {expandedRound === round.id ? (
                  <ChevronUp className="w-4 h-4 text-[rgb(100,100,110)]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[rgb(100,100,110)]" />
                )}
              </div>

              {expandedRound === round.id && (
                <div className="px-5 pb-5 pt-2 border-t border-[rgba(255,255,255,0.04)] space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Start</div>
                      <div className="text-white">{round.startDate ? new Date(round.startDate).toLocaleDateString() : '—'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">End</div>
                      <div className="text-white">{round.endDate ? new Date(round.endDate).toLocaleDateString() : '—'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Submission</div>
                      <div className="text-white">{round.submissionDeadline ? new Date(round.submissionDeadline).toLocaleDateString() : '—'}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-[rgb(130,130,140)] mr-2 self-center">Move to:</span>
                    {['UPCOMING', 'ACTIVE', 'EVALUATING', 'COMPLETED'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(round.id, status)}
                        disabled={round.status === status}
                        className={`px-3 py-1 text-[11px] font-medium rounded-lg border transition-all disabled:opacity-30 ${
                          round.status === status
                            ? 'border-[rgba(218,255,1,0.3)] text-[#DAFF01]'
                            : 'border-[rgba(255,255,255,0.08)] text-[rgb(161,161,170)] hover:text-white hover:border-[rgba(255,255,255,0.2)]'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDelete(round.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-400 hover:bg-[rgba(239,68,68,0.1)] rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Delete Round
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

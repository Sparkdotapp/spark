'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Shield, Loader2, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { addStaff, removeStaff } from '@/app/actions/event-actions';
import type { ManagedEvent } from './EventManageClient';

const roleColors: Record<string, string> = {
  ADMIN: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border-[rgba(239,68,68,0.2)]',
  EVALUATOR: 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border-[rgba(59,130,246,0.2)]',
  MODERATOR: 'bg-[rgba(168,85,247,0.1)] text-[#A855F7] border-[rgba(168,85,247,0.2)]',
};

const roleDescriptions: Record<string, string> = {
  ADMIN: 'Full access to manage all event settings',
  EVALUATOR: 'Can evaluate submissions and score teams',
  MODERATOR: 'Can manage participants and moderate discussions',
};

export function StaffTab({ event }: { event: ManagedEvent }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: '', role: 'EVALUATOR' as string });

  const staff = event.staff || [];

  async function handleAdd() {
    if (!form.email.trim()) return;
    setSaving(true);
    try {
      const result = await addStaff(event.id, {
        email: form.email,
        role: form.role as any,
      });
      if (result.success) {
        setShowForm(false);
        setForm({ email: '', role: 'EVALUATOR' });
        router.refresh();
      } else {
        alert(result.error || 'Failed to add staff');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(staffId: string) {
    if (!confirm('Remove this staff member?')) return;
    await removeStaff(staffId);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#A855F7]" />
          <h2 className="text-lg font-bold text-white">Staff ({staff.length})</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] hover:bg-[rgb(166,190,21)] transition-all"
        >
          <UserPlus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {/* Role Legend */}
      <div className="flex flex-wrap gap-6 p-4 rounded-xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)]">
        {Object.entries(roleDescriptions).map(([role, desc]) => (
          <div key={role} className="flex items-start gap-2">
            <Badge className={`text-[10px] border mt-0.5 ${roleColors[role]}`}>{role}</Badge>
            <span className="text-xs text-[rgb(130,130,140)]">{desc}</span>
          </div>
        ))}
      </div>

      {/* Add Staff Form */}
      {showForm && (
        <div className="p-5 rounded-xl bg-[rgb(26,28,30)] border border-[rgba(218,255,1,0.2)] space-y-4">
          <h3 className="text-sm font-bold text-white">Add Staff Member</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Email address"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="flex-1 bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
            />
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="px-3 py-2 text-sm rounded-lg bg-[rgb(17,17,19)] border border-[rgba(255,255,255,0.08)] text-white outline-none"
            >
              <option value="ADMIN">Admin</option>
              <option value="EVALUATOR">Evaluator</option>
              <option value="MODERATOR">Moderator</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm rounded-xl border border-[rgba(255,255,255,0.1)] text-[rgb(161,161,170)]"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={saving || !form.email.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] disabled:opacity-40"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Add
            </button>
          </div>
        </div>
      )}

      {/* Staff List */}
      {staff.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-[rgba(255,255,255,0.1)] text-center">
          <Shield className="w-10 h-10 mx-auto text-[rgb(70,70,80)] mb-3" />
          <p className="text-[rgb(130,130,140)] mb-1">No staff yet</p>
          <p className="text-sm text-[rgb(100,100,110)]">
            Add evaluators, moderators, or admins to help run your event.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {staff.map((member: any) => (
            <div
              key={member.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] group hover:bg-[rgba(255,255,255,0.02)] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[rgba(168,85,247,0.1)] flex items-center justify-center text-sm font-bold text-[#A855F7]">
                {member.user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">{member.user?.name || 'Unknown'}</div>
                <div className="text-xs text-[rgb(130,130,140)]">{member.user?.email || '—'}</div>
              </div>
              <Badge className={`text-[10px] border ${roleColors[member.role] || ''}`}>{member.role}</Badge>
              <button
                onClick={() => handleRemove(member.id)}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-[rgba(239,68,68,0.1)] rounded-lg text-red-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

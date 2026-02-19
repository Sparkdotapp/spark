'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Trophy, Building2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { addPrize, deletePrize, addSponsor, deleteSponsor } from '@/app/actions/event-actions';
import type { ManagedEvent } from './EventManageClient';

const tierColors: Record<string, string> = {
  TITLE: 'bg-[rgba(255,215,0,0.1)] text-[#FFD700] border-[rgba(255,215,0,0.2)]',
  GOLD: 'bg-[rgba(255,180,0,0.1)] text-[#FFB400] border-[rgba(255,180,0,0.2)]',
  SILVER: 'bg-[rgba(192,192,192,0.1)] text-[#C0C0C0] border-[rgba(192,192,192,0.2)]',
  BRONZE: 'bg-[rgba(205,127,50,0.1)] text-[#CD7F32] border-[rgba(205,127,50,0.2)]',
  COMMUNITY: 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border-[rgba(59,130,246,0.2)]',
};

const medals = ['🥇', '🥈', '🥉', '🏆', '⭐'];

export function PrizesSponsorsTab({ event }: { event: ManagedEvent }) {
  const router = useRouter();
  const [showPrizeForm, setShowPrizeForm] = useState(false);
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prizeForm, setPrizeForm] = useState({ title: '', description: '', amount: '', position: '1' });
  const [sponsorForm, setSponsorForm] = useState({
    name: '',
    logoUrl: '',
    websiteUrl: '',
    tier: 'COMMUNITY' as string,
  });

  async function handleAddPrize() {
    if (!prizeForm.title.trim()) return;
    setSaving(true);
    try {
      await addPrize(event.id, {
        title: prizeForm.title,
        description: prizeForm.description || undefined,
        amount: prizeForm.amount || undefined,
        position: parseInt(prizeForm.position, 10),
      });
      setShowPrizeForm(false);
      setPrizeForm({ title: '', description: '', amount: '', position: '1' });
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePrize(prizeId: string) {
    if (!confirm('Delete this prize?')) return;
    await deletePrize(prizeId);
    router.refresh();
  }

  async function handleAddSponsor() {
    if (!sponsorForm.name.trim()) return;
    setSaving(true);
    try {
      await addSponsor(event.id, {
        name: sponsorForm.name,
        logoUrl: sponsorForm.logoUrl || undefined,
        websiteUrl: sponsorForm.websiteUrl || undefined,
        tier: sponsorForm.tier as any,
      });
      setShowSponsorForm(false);
      setSponsorForm({ name: '', logoUrl: '', websiteUrl: '', tier: 'COMMUNITY' });
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSponsor(sponsorId: string) {
    if (!confirm('Delete this sponsor?')) return;
    await deleteSponsor(sponsorId);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Prizes Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#FFD700]" />
            <h2 className="text-lg font-bold text-white">Prizes ({(event.prizes || []).length})</h2>
          </div>
          <button
            onClick={() => setShowPrizeForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] hover:bg-[rgb(166,190,21)] transition-all"
          >
            <Plus className="w-4 h-4" /> Add Prize
          </button>
        </div>

        {showPrizeForm && (
          <div className="p-5 rounded-xl bg-[rgb(26,28,30)] border border-[rgba(218,255,1,0.2)] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                placeholder="Prize title"
                value={prizeForm.title}
                onChange={(e) => setPrizeForm((f) => ({ ...f, title: e.target.value }))}
                className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
              />
              <Input
                placeholder="Amount (₹ or $)"
                type="number"
                value={prizeForm.amount}
                onChange={(e) => setPrizeForm((f) => ({ ...f, amount: e.target.value }))}
                className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
              />
              <Input
                placeholder="Position (1, 2, 3...)"
                type="number"
                min="1"
                value={prizeForm.position}
                onChange={(e) => setPrizeForm((f) => ({ ...f, position: e.target.value }))}
                className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
              />
            </div>
            <Textarea
              placeholder="Description (optional)"
              value={prizeForm.description}
              onChange={(e) => setPrizeForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowPrizeForm(false)}
                className="px-4 py-2 text-sm rounded-xl border border-[rgba(255,255,255,0.1)] text-[rgb(161,161,170)]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPrize}
                disabled={saving || !prizeForm.title.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] disabled:opacity-40"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Add Prize
              </button>
            </div>
          </div>
        )}

        {(event.prizes || []).length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-[rgba(255,255,255,0.08)] text-center">
            <p className="text-sm text-[rgb(130,130,140)]">No prizes added yet. Add prizes to motivate participants!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(event.prizes || [])
              .sort((a: any, b: any) => a.position - b.position)
              .map((prize: any, idx: number) => (
                <div
                  key={prize.id}
                  className="p-4 rounded-xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] group relative"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{medals[idx] || '🏅'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white">{prize.title}</div>
                      {prize.amount && (
                        <div className="text-[#DAFF01] text-lg font-bold mt-1">₹{prize.amount.toLocaleString()}</div>
                      )}
                      {prize.description && (
                        <div className="text-xs text-[rgb(130,130,140)] mt-1 line-clamp-2">{prize.description}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeletePrize(prize.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[rgba(239,68,68,0.1)] rounded-lg text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="border-t border-[rgba(255,255,255,0.06)]" />

      {/* Sponsors Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#00D4FF]" />
            <h2 className="text-lg font-bold text-white">Sponsors ({(event.sponsors || []).length})</h2>
          </div>
          <button
            onClick={() => setShowSponsorForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] hover:bg-[rgb(166,190,21)] transition-all"
          >
            <Plus className="w-4 h-4" /> Add Sponsor
          </button>
        </div>

        {showSponsorForm && (
          <div className="p-5 rounded-xl bg-[rgb(26,28,30)] border border-[rgba(218,255,1,0.2)] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Sponsor name"
                value={sponsorForm.name}
                onChange={(e) => setSponsorForm((f) => ({ ...f, name: e.target.value }))}
                className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
              />
              <select
                value={sponsorForm.tier}
                onChange={(e) => setSponsorForm((f) => ({ ...f, tier: e.target.value }))}
                className="px-3 py-2 text-sm rounded-lg bg-[rgb(17,17,19)] border border-[rgba(255,255,255,0.08)] text-white outline-none"
              >
                <option value="TITLE">Title Sponsor</option>
                <option value="GOLD">Gold</option>
                <option value="SILVER">Silver</option>
                <option value="BRONZE">Bronze</option>
                <option value="COMMUNITY">Community</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Logo URL (optional)"
                value={sponsorForm.logoUrl}
                onChange={(e) => setSponsorForm((f) => ({ ...f, logoUrl: e.target.value }))}
                className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
              />
              <Input
                placeholder="Website URL (optional)"
                value={sponsorForm.websiteUrl}
                onChange={(e) => setSponsorForm((f) => ({ ...f, websiteUrl: e.target.value }))}
                className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSponsorForm(false)}
                className="px-4 py-2 text-sm rounded-xl border border-[rgba(255,255,255,0.1)] text-[rgb(161,161,170)]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSponsor}
                disabled={saving || !sponsorForm.name.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] disabled:opacity-40"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Add Sponsor
              </button>
            </div>
          </div>
        )}

        {(event.sponsors || []).length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-[rgba(255,255,255,0.08)] text-center">
            <p className="text-sm text-[rgb(130,130,140)]">No sponsors yet. Add sponsors to showcase your partners!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {['TITLE', 'GOLD', 'SILVER', 'BRONZE', 'COMMUNITY'].map((tier) => {
              const tierSponsors = (event.sponsors || []).filter((s: any) => s.tier === tier);
              if (tierSponsors.length === 0) return null;
              return (
                <div key={tier} className="space-y-2">
                  <Badge className={`text-[10px] border ${tierColors[tier]}`}>{tier}</Badge>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tierSponsors.map((sponsor: any) => (
                      <div
                        key={sponsor.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] group"
                      >
                        {sponsor.logoUrl ? (
                          <img src={sponsor.logoUrl} alt="" className="w-10 h-10 rounded-lg object-contain bg-white/5" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[rgba(0,212,255,0.08)] flex items-center justify-center text-xs font-bold text-[#00D4FF]">
                            {sponsor.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{sponsor.name}</div>
                          {sponsor.websiteUrl && (
                            <a
                              href={sponsor.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#00D4FF] hover:underline truncate block"
                            >
                              {sponsor.websiteUrl}
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteSponsor(sponsor.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[rgba(239,68,68,0.1)] rounded-lg text-red-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

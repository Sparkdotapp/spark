'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Users,
  Layers,
  Rocket,
  Globe,
  MapPin,
  Clock,
  Edit2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { updateEvent, publishEvent } from '@/app/actions/event-actions';
import type { ManagedEvent } from './EventManageClient';

export function OverviewTab({ event }: { event: ManagedEvent }) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);

  async function handlePublish() {
    setPublishing(true);
    try {
      await publishEvent(event.id);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Teams', value: event._count.teams, icon: Users, color: '#DAFF01' },
          { label: 'Rounds', value: event._count.rounds, icon: Layers, color: '#00D4FF' },
          { label: 'Staff', value: event.staff.length, icon: Users, color: '#C084FC' },
          { label: 'Activity', value: event._count.activityLogs, icon: Clock, color: '#FF6B35' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)]"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              <span className="text-xs text-[rgb(130,130,140)] uppercase">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Status + Publish */}
      {event.status === 'DRAFT' && (
        <div className="p-5 rounded-xl bg-[rgba(218,255,1,0.04)] border border-[rgba(218,255,1,0.15)] flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-semibold text-[#DAFF01] mb-1">Ready to go live?</h3>
            <p className="text-sm text-[rgb(161,161,170)]">
              Publish your event to make it visible to participants.
            </p>
          </div>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] hover:bg-[rgb(166,190,21)] disabled:opacity-40 transition-all"
          >
            <Rocket className="w-4 h-4" />
            {publishing ? 'Publishing...' : 'Publish Event'}
          </button>
        </div>
      )}

      {/* Event Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] space-y-4">
          <h3 className="text-sm font-bold text-white">Event Details</h3>
          <div className="space-y-3">
            <div>
              <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Description</div>
              <p className="text-sm text-[rgb(200,200,210)] line-clamp-4">{event.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Start</div>
                <div className="text-sm text-white flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#DAFF01]" />
                  {new Date(event.startDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">End</div>
                <div className="text-sm text-white flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#DAFF01]" />
                  {new Date(event.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Location</div>
              <div className="text-sm text-white flex items-center gap-1">
                {event.isVirtual ? (
                  <><Globe className="w-3.5 h-3.5 text-[#DAFF01]" /> Virtual</>
                ) : (
                  <><MapPin className="w-3.5 h-3.5 text-[#DAFF01]" /> {event.location || 'TBD'}</>
                )}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Team Size</div>
              <div className="text-sm text-white">{event.minTeamSize} - {event.maxTeamSize} members</div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)] space-y-4">
          <h3 className="text-sm font-bold text-white">Quick Summary</h3>
          <div className="space-y-3">
            <div>
              <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Visibility</div>
              <Badge className={event.isPublic ? 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] border-[rgba(34,197,94,0.2)]' : 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border-[rgba(239,68,68,0.2)]'}>
                {event.isPublic ? 'Public' : 'Private'}
              </Badge>
            </div>
            <div>
              <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Approval Required</div>
              <div className="text-sm text-white">{event.requireApproval ? 'Yes' : 'No'}</div>
            </div>
            {event.tags.length > 0 && (
              <div>
                <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {event.tags.map((t) => (
                    <Badge key={t} className="bg-[rgba(218,255,1,0.08)] text-[#DAFF01] border-[rgba(218,255,1,0.2)] text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {event.skills.length > 0 && (
              <div>
                <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Skills</div>
                <div className="flex flex-wrap gap-1">
                  {event.skills.map((s) => (
                    <Badge key={s} className="bg-[rgba(0,212,255,0.08)] text-[#00D4FF] border-[rgba(0,212,255,0.2)] text-[10px]">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Prizes</div>
              <div className="text-sm text-white">{event.prizes.length} configured</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Sponsors</div>
              <div className="text-sm text-white">{event.sponsors.length} sponsors</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

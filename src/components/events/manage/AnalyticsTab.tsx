'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Users, Trophy, Activity, Loader2, Clock } from 'lucide-react';
import { getEventAnalytics } from '@/app/actions/event-actions';
import type { ManagedEvent } from './EventManageClient';

export function AnalyticsTab({ event }: { event: ManagedEvent }) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getEventAnalytics(event.id);
        if (result.success) {
          setAnalytics(result.analytics);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [event.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#DAFF01]" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-12 rounded-2xl border border-dashed border-[rgba(255,255,255,0.1)] text-center">
        <BarChart3 className="w-10 h-10 mx-auto text-[rgb(70,70,80)] mb-3" />
        <p className="text-[rgb(130,130,140)]">Analytics unavailable</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Teams',
      value: analytics.totalTeams ?? 0,
      icon: Users,
      color: '#DAFF01',
      bg: 'rgba(218,255,1,0.08)',
    },
    {
      label: 'Total Members',
      value: analytics.totalMembers ?? 0,
      icon: Users,
      color: '#00D4FF',
      bg: 'rgba(0,212,255,0.08)',
    },
    {
      label: 'Rounds',
      value: analytics.totalRounds ?? 0,
      icon: Trophy,
      color: '#FFD700',
      bg: 'rgba(255,215,0,0.08)',
    },
    {
      label: 'Activity Entries',
      value: analytics.recentActivity?.length ?? 0,
      icon: Activity,
      color: '#A855F7',
      bg: 'rgba(168,85,247,0.08)',
    },
  ];

  const roundBreakdown = analytics.roundBreakdown || [];
  const recentActivity = analytics.recentActivity || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-[#DAFF01]" />
        <h2 className="text-lg font-bold text-white">Analytics</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)]"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: stat.bg }}
            >
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-[rgb(130,130,140)] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Round Breakdown */}
      {roundBreakdown.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Round Breakdown</h3>
          <div className="space-y-3">
            {roundBreakdown.map((round: any) => (
              <div
                key={round.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)]"
              >
                <div className="w-10 h-10 rounded-lg bg-[rgba(218,255,1,0.08)] flex items-center justify-center text-sm font-bold text-[#DAFF01]">
                  R{round.roundNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{round.title}</div>
                  <div className="text-xs text-[rgb(130,130,140)]">{round.status}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{round._count?.participations ?? 0}</div>
                  <div className="text-[10px] text-[rgb(130,130,140)] uppercase">Participations</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-[rgba(255,255,255,0.08)] text-center">
            <p className="text-sm text-[rgb(130,130,140)]">No activity logged yet.</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {recentActivity.map((log: any) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-[#DAFF01] mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">
                    <span className="font-medium">{log.action}</span>
                    {log.details && (
                      <span className="text-[rgb(130,130,140)]"> — {log.details}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[rgb(100,100,110)] mt-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(log.createdAt).toLocaleString()}
                    {log.user && <span>by {log.user.name || 'Unknown'}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

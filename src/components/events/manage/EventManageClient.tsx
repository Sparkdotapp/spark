'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  LayoutDashboard,
  Layers,
  Users,
  Trophy,
  Shield,
  BarChart3,
  Eye,
  Rocket,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { OverviewTab } from './OverviewTab';
import { RoundsTab } from './RoundsTab';
import { PrizesSponsorsTab } from './PrizesSponsorsTab';
import { StaffTab } from './StaffTab';
import { AnalyticsTab } from './AnalyticsTab';

export interface ManagedEvent {
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
  isPublic: boolean;
  requireApproval: boolean;
  tags: string[];
  skills: string[];
  hostId: string;
  host: { id: string; displayName: string | null; email: string; profileImageUrl: string | null };
  rounds: {
    id: string;
    title: string;
    description: string | null;
    roundNumber: number;
    status: string;
    startDate: string | null;
    endDate: string | null;
    submissionDeadline: string | null;
    criteria: unknown;
    requiresSubmission: boolean;
    taskDescription: string | null;
  }[];
  teams: {
    id: string;
    name: string;
    description: string | null;
    members: {
      id: string;
      isLeader: boolean;
      user: { id: string; displayName: string | null; email: string; profileImageUrl: string | null };
    }[];
  }[];
  prizes: { id: string; title: string; description: string | null; amount: string | null; position: number | null; icon: string | null }[];
  sponsors: { id: string; name: string; logoUrl: string | null; websiteUrl: string | null; tier: string }[];
  staff: { id: string; role: string; user: { id: string; displayName: string | null; email: string } }[];
  _count: { teams: number; rounds: number; activityLogs: number };
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-[rgba(161,161,170,0.1)] text-[rgb(161,161,170)] border-[rgba(161,161,170,0.2)]',
  PUBLISHED: 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] border-[rgba(34,197,94,0.2)]',
  ONGOING: 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border-[rgba(59,130,246,0.2)]',
  COMPLETED: 'bg-[rgba(161,161,170,0.1)] text-[rgb(161,161,170)] border-[rgba(161,161,170,0.2)]',
  CANCELLED: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border-[rgba(239,68,68,0.2)]',
};

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'rounds', label: 'Rounds', icon: Layers },
  { id: 'participants', label: 'Participants', icon: Users },
  { id: 'prizes', label: 'Prizes & Sponsors', icon: Trophy },
  { id: 'staff', label: 'Staff', icon: Shield },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function EventManageClient({ event }: { event: ManagedEvent }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-[rgb(17,17,19)]">
      {/* Header */}
      <div className="border-b border-[rgba(255,255,255,0.06)] bg-[rgb(17,17,19)]">
        <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/events/dashboard"
              className="text-sm text-[rgb(161,161,170)] hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`border ${statusColors[event.status]}`}>{event.status}</Badge>
                <Badge className="bg-[rgba(218,255,1,0.08)] text-[#DAFF01] border-[rgba(218,255,1,0.2)] text-[10px]">
                  {event.type}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-white">{event.title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/events/${event.id}`}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl border border-[rgba(255,255,255,0.1)] text-[rgb(161,161,170)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
              >
                <Eye className="w-4 h-4" /> Preview
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-[1200px] mx-auto px-6">
          <nav className="flex gap-1 overflow-x-auto pb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-[#DAFF01] text-[#DAFF01]'
                    : 'border-transparent text-[rgb(130,130,140)] hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === 'overview' && <OverviewTab event={event} />}
          {activeTab === 'rounds' && <RoundsTab event={event} />}
          {activeTab === 'prizes' && <PrizesSponsorsTab event={event} />}
          {activeTab === 'staff' && <StaffTab event={event} />}
          {activeTab === 'analytics' && <AnalyticsTab event={event} />}
        </motion.div>
      </div>
    </div>
  );
}

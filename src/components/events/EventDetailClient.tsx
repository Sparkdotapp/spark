'use client';

import { useState, useEffect, useCallback } from 'react';
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
  ExternalLink,
  Loader2,
  X,
  Crown,
  AlertTriangle,
  Trash2,
  LogOut,
  Copy,
  Check,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Send,
  Mail,
  Shield,
  Phone,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  registerTeam,
  getMyTeamForEvent,
  removeTeamMember,
  leaveTeam as leaveTeamAction,
  deleteTeam as deleteTeamAction,
  joinTeamByCode,
  regenerateInviteCode,
  sendTeamInvite,
  getMyInvitesForEvent,
  getPendingInvitesForTeam,
  acceptTeamInvite,
  rejectTeamInvite,
  cancelTeamInvite,
  submitTeam,
} from '@/app/actions/event-actions';
import { getCurrentDbUser, updateCurrentUserProfile } from '@/app/actions/user-actions';

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

  const [myTeam, setMyTeam] = useState<any>(null);
  const [isLeader, setIsLeader] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(true);

  const [showRegister, setShowRegister] = useState(false);
  const [registerTab, setRegisterTab] = useState<'create' | 'join'>('create');
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState('');

  const [memberEmail, setMemberEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [leavingTeam, setLeavingTeam] = useState(false);
  const [teamActionError, setTeamActionError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [regeneratingCode, setRegeneratingCode] = useState(false);

  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [incomingInvites, setIncomingInvites] = useState<any[]>([]);
  const [processingInvite, setProcessingInvite] = useState<string | null>(null);
  const [cancellingInvite, setCancellingInvite] = useState<string | null>(null);

  const [submittingTeam, setSubmittingTeam] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Profile step for registration
  const [dbUser, setDbUser] = useState<any>(null);
  const [regStep, setRegStep] = useState<'profile' | 'team'>('team');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    userType: '',
    location: '',
    college: '',
    course: '',
    degree: '',
    graduationYear: '',
    isGraduated: false,
    company: '',
    designation: '',
  });

  const isHost = user?.id === event.host.id;
  const isStaff = event.staff.some((s) => s.user.id === user?.id);
  const isOrganizer = isHost || isStaff;
  const sortedSponsors = [...event.sponsors].sort((a, b) => (tierOrder[a.tier] ?? 5) - (tierOrder[b.tier] ?? 5));

  const memberCount = myTeam?.members?.length || 0;
  const isBelowMin = myTeam && memberCount < event.minTeamSize;
  const isAtMax = myTeam && memberCount >= event.maxTeamSize;
  const isSubmitted = myTeam?.isSubmitted || false;

  const fetchMyTeam = useCallback(async () => {
    if (!user) { setLoadingTeam(false); return; }
    try {
      const result = await getMyTeamForEvent(event.id);
      if (result.success && result.team) {
        setMyTeam(result.team);
        setIsLeader(result.isLeader);
      } else {
        setMyTeam(null);
        setIsLeader(false);
      }
    } catch {
      /* Not authenticated */
    } finally {
      setLoadingTeam(false);
    }
  }, [user, event.id]);

  const fetchInvites = useCallback(async () => {
    if (!user) return;
    try {
      const incoming = await getMyInvitesForEvent(event.id);
      if (incoming.success) setIncomingInvites(incoming.invites);
    } catch { /* ignore */ }
  }, [user, event.id]);

  const fetchPendingInvites = useCallback(async () => {
    if (!myTeam || !isLeader) return;
    try {
      const pending = await getPendingInvitesForTeam(myTeam.id);
      if (pending.success) setPendingInvites(pending.invites);
    } catch { /* ignore */ }
  }, [myTeam, isLeader]);

  useEffect(() => { fetchMyTeam(); }, [fetchMyTeam]);
  useEffect(() => { fetchInvites(); }, [fetchInvites]);
  useEffect(() => { fetchPendingInvites(); }, [fetchPendingInvites]);

  // Load DB user for profile completeness check
  useEffect(() => {
    if (!user) return;
    getCurrentDbUser().then((u) => {
      if (!u) return;
      setDbUser(u);
      setProfileForm({
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        phone: u.phone || '',
        gender: u.gender || '',
        userType: u.userType || '',
        location: u.location || '',
        college: u.college || '',
        course: u.course || '',
        degree: u.degree || '',
        graduationYear: u.graduationYear ? String(u.graduationYear) : '',
        isGraduated: u.isGraduated || false,
        company: u.company || '',
        designation: u.designation || '',
      });
    });
  }, [user]);

  function handleOpenRegister() {
    const isProfileComplete = dbUser?.firstName && dbUser?.gender && dbUser?.userType && dbUser?.location && dbUser?.phone && (dbUser?.college || dbUser?.company);
    setRegStep(isProfileComplete ? 'team' : 'profile');
    setShowRegister(true);
    setRegError('');
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      const result = await updateCurrentUserProfile({
        firstName: profileForm.firstName || undefined,
        lastName: profileForm.lastName || undefined,
        displayName: profileForm.firstName ? `${profileForm.firstName}${profileForm.lastName ? ` ${profileForm.lastName}` : ''}` : undefined,
        phone: profileForm.phone || undefined,
        gender: profileForm.gender || undefined,
        userType: profileForm.userType || undefined,
        location: profileForm.location || undefined,
        college: profileForm.college || undefined,
        course: profileForm.course || undefined,
        degree: profileForm.degree || undefined,
        graduationYear: profileForm.graduationYear ? parseInt(profileForm.graduationYear) : undefined,
        isGraduated: profileForm.isGraduated,
        company: profileForm.company || undefined,
        designation: profileForm.designation || undefined,
      });
      if (result.success) {
        setDbUser(result.user);
        setRegStep('team');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleCreateTeam() {
    if (!teamName.trim()) return;
    setRegistering(true);
    setRegError('');
    try {
      const result = await registerTeam(event.id, { teamName: teamName.trim() });
      if (result.success) {
        setShowRegister(false);
        setTeamName('');
        await fetchMyTeam();
      } else {
        setRegError(result.error || 'Failed to create team');
      }
    } catch (err) {
      setRegError((err as Error).message);
    } finally {
      setRegistering(false);
    }
  }

  async function handleJoinByCode() {
    if (!inviteCode.trim()) return;
    setRegistering(true);
    setRegError('');
    try {
      const result = await joinTeamByCode(event.id, inviteCode.trim().toUpperCase());
      if (result.success) {
        setShowRegister(false);
        setInviteCode('');
        await fetchMyTeam();
      } else {
        setRegError(result.error || 'Invalid or expired invite code');
      }
    } catch (err) {
      setRegError((err as Error).message);
    } finally {
      setRegistering(false);
    }
  }

  async function handleSendInvite() {
    if (!memberEmail.trim() || !myTeam) return;
    setSendingInvite(true);
    setInviteError('');
    setInviteSuccess('');
    try {
      const result = await sendTeamInvite(myTeam.id, memberEmail.trim());
      if (result.success) {
        setMemberEmail('');
        setInviteSuccess('Invite sent successfully!');
        setTimeout(() => setInviteSuccess(''), 3000);
        await fetchPendingInvites();
      } else {
        setInviteError(result.error || 'Failed to send invite');
      }
    } catch (err) {
      setInviteError((err as Error).message);
    } finally {
      setSendingInvite(false);
    }
  }

  async function handleCancelInvite(inviteId: string) {
    setCancellingInvite(inviteId);
    try {
      const result = await cancelTeamInvite(inviteId);
      if (result.success) await fetchPendingInvites();
    } catch { /* ignore */ }
    finally { setCancellingInvite(null); }
  }

  async function handleAcceptInvite(inviteId: string) {
    setProcessingInvite(inviteId);
    try {
      const result = await acceptTeamInvite(inviteId);
      if (result.success) {
        await fetchMyTeam();
        setIncomingInvites([]);
      } else {
        setTeamActionError(result.error || 'Failed to accept invite');
      }
    } catch (err) {
      setTeamActionError((err as Error).message);
    } finally {
      setProcessingInvite(null);
    }
  }

  async function handleRejectInvite(inviteId: string) {
    setProcessingInvite(inviteId);
    try {
      const result = await rejectTeamInvite(inviteId);
      if (result.success) setIncomingInvites((prev) => prev.filter((i) => i.id !== inviteId));
    } catch { /* ignore */ }
    finally { setProcessingInvite(null); }
  }

  async function handleRemoveMember(memberId: string) {
    if (!myTeam) return;
    setRemovingId(memberId);
    setTeamActionError('');
    try {
      const result = await removeTeamMember(myTeam.id, memberId);
      if (result.success) await fetchMyTeam();
      else setTeamActionError(result.error || 'Failed to remove member');
    } catch (err) {
      setTeamActionError((err as Error).message);
    } finally {
      setRemovingId(null);
    }
  }

  async function handleLeaveTeam() {
    if (!myTeam) return;
    setLeavingTeam(true);
    setTeamActionError('');
    try {
      const result = await leaveTeamAction(myTeam.id);
      if (result.success) { setMyTeam(null); setIsLeader(false); }
      else setTeamActionError(result.error || 'Failed to leave team');
    } catch (err) {
      setTeamActionError((err as Error).message);
    } finally {
      setLeavingTeam(false);
    }
  }

  async function handleDeleteTeam() {
    if (!myTeam) return;
    setDeleting(true);
    setTeamActionError('');
    try {
      const result = await deleteTeamAction(myTeam.id);
      if (result.success) { setMyTeam(null); setIsLeader(false); setShowDeleteConfirm(false); }
      else setTeamActionError(result.error || 'Failed to delete team');
    } catch (err) {
      setTeamActionError((err as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  async function handleSubmitTeam() {
    if (!myTeam) return;
    setSubmittingTeam(true);
    setTeamActionError('');
    try {
      const result = await submitTeam(myTeam.id);
      if (result.success) { setShowSubmitConfirm(false); await fetchMyTeam(); setPendingInvites([]); }
      else setTeamActionError(result.error || 'Failed to submit team');
    } catch (err) {
      setTeamActionError((err as Error).message);
    } finally {
      setSubmittingTeam(false);
    }
  }

  function copyInviteCode() {
    if (!myTeam?.inviteCode) return;
    navigator.clipboard.writeText(myTeam.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  async function handleRegenerateCode() {
    if (!myTeam) return;
    setRegeneratingCode(true);
    setTeamActionError('');
    try {
      const result = await regenerateInviteCode(myTeam.id);
      if (result.success) await fetchMyTeam();
      else setTeamActionError(result.error || 'Failed to regenerate code');
    } catch (err) {
      setTeamActionError((err as Error).message);
    } finally {
      setRegeneratingCode(false);
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
          <Link href="/events" className="inline-flex items-center gap-2 text-sm text-[rgb(161,161,170)] hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Events
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className={`border ${typeColors[event.type] || typeColors.HACKATHON}`}>{event.type}</Badge>
            <Badge className={`border ${statusColors[event.status] || statusColors.DRAFT}`}>{event.status}</Badge>
            {event.isVirtual && (
              <Badge className="bg-[rgba(99,179,237,0.1)] text-[#63B3ED] border border-[rgba(99,179,237,0.25)]">
                <Globe className="w-3 h-3 mr-1" /> Virtual
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">{event.title}</h1>
          {event.tagline && <p className="text-lg text-[rgb(200,200,210)] mb-6">{event.tagline}</p>}
          <div className="flex flex-wrap items-center gap-6 text-sm text-[rgb(161,161,170)] mb-8">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#DAFF01]" />{formatDate(event.startDate)}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#DAFF01]" />{formatDate(event.endDate)}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#DAFF01]" />{event.isVirtual ? 'Virtual' : event.location || 'TBD'}</span>
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#DAFF01]" />{event._count.teams} teams</span>
          </div>
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
              {isOrganizer && (
                <Link href={`/events/${event.id}/manage`} className="px-5 py-2.5 text-sm font-semibold rounded-xl border-2 border-[rgba(218,255,1,0.4)] text-[#DAFF01] hover:bg-[rgba(218,255,1,0.08)] transition-all">
                  Manage Event
                </Link>
              )}
              {!isHost && !myTeam && !loadingTeam && event.status !== 'DRAFT' && event.status !== 'CANCELLED' && (
                <button onClick={handleOpenRegister} className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] hover:bg-[rgb(166,190,21)] hover:shadow-[0_8px_25px_rgba(218,255,1,0.3)] transition-all">
                  Register Now
                </button>
              )}
              {myTeam && (
                <span className={`px-5 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 ${isSubmitted ? 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] border border-[rgba(34,197,94,0.2)]' : 'bg-[rgba(218,255,1,0.08)] text-[#DAFF01] border border-[rgba(218,255,1,0.15)]'}`}>
                  {isSubmitted ? <Shield className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  {myTeam.name}
                  {isSubmitted && <Badge className="bg-[rgba(34,197,94,0.15)] text-[#22C55E] border-none text-[9px] ml-1">Submitted</Badge>}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)] backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg mx-4 p-6 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.08)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {regStep === 'profile' ? 'Complete Your Profile' : `Register for ${event.title}`}
                </h3>
                {regStep === 'profile' && (
                  <p className="text-xs text-[rgb(130,130,140)] mt-1">Hosts need this info to review participants</p>
                )}
              </div>
              <button onClick={() => { setShowRegister(false); setRegError(''); }} className="p-1 rounded-lg text-[rgb(161,161,170)] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`flex items-center gap-1.5 text-xs font-medium ${regStep === 'profile' ? 'text-[#DAFF01]' : 'text-[#22C55E]'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${regStep === 'profile' ? 'bg-[rgba(218,255,1,0.15)] border border-[rgba(218,255,1,0.3)]' : 'bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)]'}`}>
                  {regStep === 'profile' ? '1' : <Check className="w-3 h-3" />}
                </div>
                Profile
              </div>
              <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
              <div className={`flex items-center gap-1.5 text-xs font-medium ${regStep === 'team' ? 'text-[#DAFF01]' : 'text-[rgb(130,130,140)]'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border ${regStep === 'team' ? 'bg-[rgba(218,255,1,0.15)] border-[rgba(218,255,1,0.3)] text-[#DAFF01]' : 'border-[rgba(255,255,255,0.12)] text-[rgb(100,100,110)]'}`}>2</div>
                Team
              </div>
            </div>

            {/* Step 1: Profile */}
            {regStep === 'profile' && (
              <div className="space-y-4">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[rgb(200,200,210)]">First Name <span className="text-red-400">*</span></label>
                    <Input placeholder="First name" value={profileForm.firstName} onChange={(e) => setProfileForm((f) => ({ ...f, firstName: e.target.value }))} className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-[rgb(200,200,210)]">Last Name</label>
                    <Input placeholder="Last name" value={profileForm.lastName} onChange={(e) => setProfileForm((f) => ({ ...f, lastName: e.target.value }))} className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                  </div>
                </div>
                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-xs text-[rgb(200,200,210)]">Gender <span className="text-red-400">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((g) => (
                      <button key={g} onClick={() => setProfileForm((f) => ({ ...f, gender: g }))} className={`px-3 py-1.5 text-xs rounded-full border transition-all ${profileForm.gender === g ? 'border-[rgba(218,255,1,0.4)] bg-[rgba(218,255,1,0.08)] text-[#DAFF01]' : 'border-[rgba(255,255,255,0.1)] text-[rgb(161,161,170)] hover:border-[rgba(255,255,255,0.22)] hover:text-white'}`}>{g}</button>
                    ))}
                  </div>
                </div>
                {/* User type */}
                <div className="space-y-1.5">
                  <label className="text-xs text-[rgb(200,200,210)]">I am a <span className="text-red-400">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {['College Student', 'School Student', 'Professional', 'Fresher'].map((t) => (
                      <button key={t} onClick={() => setProfileForm((f) => ({ ...f, userType: t, isGraduated: t === 'Professional' }))} className={`px-3 py-1.5 text-xs rounded-full border transition-all ${profileForm.userType === t ? 'border-[rgba(218,255,1,0.4)] bg-[rgba(218,255,1,0.08)] text-[#DAFF01]' : 'border-[rgba(255,255,255,0.1)] text-[rgb(161,161,170)] hover:border-[rgba(255,255,255,0.22)] hover:text-white'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs text-[rgb(200,200,210)]">Location <span className="text-red-400">*</span></label>
                  <Input placeholder="e.g. Mumbai, Maharashtra" value={profileForm.location} onChange={(e) => setProfileForm((f) => ({ ...f, location: e.target.value }))} className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                </div>
                {/* Phone + Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[rgb(200,200,210)]">Phone <span className="text-red-400">*</span></label>
                    <Input placeholder="+91 9876543210" value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-[rgb(200,200,210)]">Status</label>
                    <div className="flex gap-2">
                      <button onClick={() => setProfileForm((f) => ({ ...f, isGraduated: false }))} className={`flex-1 py-2 text-xs rounded-lg border transition-all ${!profileForm.isGraduated ? 'border-[rgba(218,255,1,0.3)] bg-[rgba(218,255,1,0.06)] text-[#DAFF01]' : 'border-[rgba(255,255,255,0.08)] text-[rgb(130,130,140)]'}`}>Student</button>
                      <button onClick={() => setProfileForm((f) => ({ ...f, isGraduated: true }))} className={`flex-1 py-2 text-xs rounded-lg border transition-all ${profileForm.isGraduated ? 'border-[rgba(218,255,1,0.3)] bg-[rgba(218,255,1,0.06)] text-[#DAFF01]' : 'border-[rgba(255,255,255,0.08)] text-[rgb(130,130,140)]'}`}>Graduated</button>
                    </div>
                  </div>
                </div>

                {!profileForm.isGraduated ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs text-[rgb(200,200,210)]">College / University <span className="text-red-400">*</span></label>
                      <Input placeholder="e.g. IIT Delhi" value={profileForm.college} onChange={(e) => setProfileForm((f) => ({ ...f, college: e.target.value }))} className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-[rgb(200,200,210)]">Degree</label>
                        <select value={profileForm.degree} onChange={(e) => setProfileForm((f) => ({ ...f, degree: e.target.value }))} className="w-full px-3 py-2 text-sm rounded-lg bg-[rgb(17,17,19)] border border-[rgba(255,255,255,0.08)] text-white outline-none">
                          <option value="">Select</option>
                          <option>B.Tech / B.E.</option>
                          <option>BCA</option>
                          <option>B.Sc</option>
                          <option>MBA</option>
                          <option>MCA</option>
                          <option>M.Tech</option>
                          <option>PhD</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-[rgb(200,200,210)]">Year</label>
                        <select value={profileForm.graduationYear} onChange={(e) => setProfileForm((f) => ({ ...f, graduationYear: e.target.value }))} className="w-full px-3 py-2 text-sm rounded-lg bg-[rgb(17,17,19)] border border-[rgba(255,255,255,0.08)] text-white outline-none">
                          <option value="">Select</option>
                          {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => <option key={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-[rgb(200,200,210)]">Branch / Course</label>
                      <Input placeholder="e.g. Computer Science" value={profileForm.course} onChange={(e) => setProfileForm((f) => ({ ...f, course: e.target.value }))} className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs text-[rgb(200,200,210)]">Company</label>
                      <Input placeholder="e.g. Google" value={profileForm.company} onChange={(e) => setProfileForm((f) => ({ ...f, company: e.target.value }))} className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-[rgb(200,200,210)]">Designation</label>
                      <Input placeholder="e.g. Software Engineer" value={profileForm.designation} onChange={(e) => setProfileForm((f) => ({ ...f, designation: e.target.value }))} className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-[rgb(200,200,210)]">Graduation Year</label>
                      <Input placeholder="e.g. 2023" value={profileForm.graduationYear} onChange={(e) => setProfileForm((f) => ({ ...f, graduationYear: e.target.value }))} className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                    </div>
                  </>
                )}

                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile || !profileForm.firstName.trim() || !profileForm.gender || !profileForm.userType || !profileForm.location.trim() || !profileForm.phone.trim() || (!profileForm.isGraduated && !profileForm.college.trim())}
                  className="w-full py-2.5 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] hover:bg-[rgb(166,190,21)] disabled:opacity-40 transition-all"
                >
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save & Continue →'}
                </button>
              </div>
            )}

            {/* Step 2: Team */}
            {regStep === 'team' && (
              <>
                <div className="flex gap-1 p-1 mb-6 rounded-xl bg-[rgb(17,17,19)]">
                  <button onClick={() => { setRegisterTab('create'); setRegError(''); }} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${registerTab === 'create' ? 'bg-[rgba(218,255,1,0.1)] text-[#DAFF01]' : 'text-[rgb(161,161,170)] hover:text-white'}`}>Create Team</button>
                  <button onClick={() => { setRegisterTab('join'); setRegError(''); }} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${registerTab === 'join' ? 'bg-[rgba(218,255,1,0.1)] text-[#DAFF01]' : 'text-[rgb(161,161,170)] hover:text-white'}`}>Join Team</button>
                </div>
                {registerTab === 'create' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-[rgb(200,200,210)]">Team Name</label>
                      <Input placeholder="Enter a unique team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateTeam()} className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                    </div>
                    <p className="text-xs text-[rgb(130,130,140)]">You&apos;ll be the team leader. Team size: {event.minTeamSize}&ndash;{event.maxTeamSize} members. You can invite members after creating.</p>
                    {regError && <p className="text-sm text-red-400">{regError}</p>}
                    <button onClick={handleCreateTeam} disabled={registering || !teamName.trim()} className="w-full py-2.5 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] hover:bg-[rgb(166,190,21)] disabled:opacity-40 transition-all">
                      {registering ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create Team'}
                    </button>
                  </div>
                )}
                {registerTab === 'join' && (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="w-16 h-16 rounded-2xl bg-[rgba(218,255,1,0.08)] flex items-center justify-center mx-auto mb-4"><Users className="w-8 h-8 text-[#DAFF01]" /></div>
                      <h4 className="text-base font-semibold text-white mb-2">Join with Invite Code</h4>
                      <p className="text-xs text-[rgb(130,130,140)]">Ask your team leader for the 6-character invite code</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-[rgb(200,200,210)]">Invite Code</label>
                      <Input placeholder="Enter 6-character code" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && handleJoinByCode()} className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white text-center text-lg tracking-widest font-mono uppercase" maxLength={6} />
                    </div>
                    {regError && <p className="text-sm text-red-400">{regError}</p>}
                    <button onClick={handleJoinByCode} disabled={registering || inviteCode.trim().length !== 6} className="w-full py-2.5 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] hover:bg-[rgb(166,190,21)] disabled:opacity-40 transition-all">
                      {registering ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Join Team'}
                    </button>
                    <p className="text-[10px] text-center text-[rgb(130,130,140)]">Code remains valid until the team is submitted</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Delete Team Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)] backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm mx-4 p-6 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(239,68,68,0.2)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[rgba(239,68,68,0.1)] flex items-center justify-center"><Trash2 className="w-5 h-5 text-red-400" /></div>
              <h3 className="text-lg font-bold text-white">Delete Team</h3>
            </div>
            <p className="text-sm text-[rgb(200,200,210)] mb-6">Are you sure you want to delete <strong className="text-white">{myTeam?.name}</strong>? This will remove all members and registrations. This cannot be undone.</p>
            {teamActionError && <p className="text-sm text-red-400 mb-4">{teamActionError}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setTeamActionError(''); }} className="flex-1 py-2.5 text-sm rounded-xl border border-[rgba(255,255,255,0.1)] text-[rgb(161,161,170)] hover:text-white transition-colors">Cancel</button>
              <button onClick={handleDeleteTeam} disabled={deleting} className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-40 transition-all">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete Team'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Submit Team Confirmation */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)] backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm mx-4 p-6 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(34,197,94,0.2)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[rgba(34,197,94,0.1)] flex items-center justify-center"><Shield className="w-5 h-5 text-[#22C55E]" /></div>
              <h3 className="text-lg font-bold text-white">Submit Team</h3>
            </div>
            <p className="text-sm text-[rgb(200,200,210)] mb-2">Submit <strong className="text-white">{myTeam?.name}</strong>?</p>
            <p className="text-xs text-[rgb(130,130,140)] mb-6">After submission, the invite code will be deactivated and no new members can join. All pending invites will be cancelled.</p>
            {teamActionError && <p className="text-sm text-red-400 mb-4">{teamActionError}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setShowSubmitConfirm(false); setTeamActionError(''); }} className="flex-1 py-2.5 text-sm rounded-xl border border-[rgba(255,255,255,0.1)] text-[rgb(161,161,170)] hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSubmitTeam} disabled={submittingTeam} className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-[#22C55E] text-white hover:bg-[#16a34a] disabled:opacity-40 transition-all">
                {submittingTeam ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Submit Team'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Content */}
      <section className="max-w-[1000px] mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">

            {/* Incoming Invites */}
            {!myTeam && !loadingTeam && incomingInvites.length > 0 && (
              <div className="space-y-3">
                {incomingInvites.map((invite: any) => (
                  <motion.div key={invite.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(59,130,246,0.2)]">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[rgba(59,130,246,0.1)] flex items-center justify-center shrink-0"><Mail className="w-5 h-5 text-[#3B82F6]" /></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white mb-1">Team Invite from {invite.invitedByUser.displayName || invite.invitedByUser.email}</h3>
                        <p className="text-xs text-[rgb(161,161,170)] mb-3">You&apos;ve been invited to join team <strong className="text-white">&quot;{invite.team.name}&quot;</strong> ({invite.team.members.length}/{invite.team.event.maxTeamSize} members)</p>
                        <div className="flex items-center gap-1 mb-4">
                          {invite.team.members.slice(0, 4).map((m: any) => (
                            <div key={m.user.id} className="w-6 h-6 rounded-full bg-[rgba(218,255,1,0.1)] flex items-center justify-center text-[9px] font-bold text-[#DAFF01] border border-[rgba(255,255,255,0.06)]" title={m.user.displayName || m.user.email}>
                              {(m.user.displayName || m.user.email || '?')[0].toUpperCase()}
                            </div>
                          ))}
                          {invite.team.members.length > 4 && <span className="text-[10px] text-[rgb(130,130,140)]">+{invite.team.members.length - 4}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleAcceptInvite(invite.id)} disabled={processingInvite === invite.id} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-[#22C55E] text-white hover:bg-[#16a34a] disabled:opacity-40 transition-all">
                            {processingInvite === invite.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Accept
                          </button>
                          <button onClick={() => handleRejectInvite(invite.id)} disabled={processingInvite === invite.id} className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-[rgba(255,255,255,0.1)] text-[rgb(161,161,170)] hover:text-white hover:border-[rgba(255,255,255,0.2)] disabled:opacity-40 transition-all">
                            <XCircle className="w-3.5 h-3.5" /> Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* My Team */}
            {myTeam && (
              <div className={`p-6 rounded-2xl bg-[rgb(26,28,30)] border ${isSubmitted ? 'border-[rgba(34,197,94,0.2)]' : 'border-[rgba(218,255,1,0.15)]'}`}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#DAFF01]" /> My Team
                    {isSubmitted && <Badge className="bg-[rgba(34,197,94,0.1)] text-[#22C55E] border-[rgba(34,197,94,0.2)] text-[10px]"><Shield className="w-3 h-3 mr-1" /> Submitted</Badge>}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[rgb(130,130,140)]">{memberCount}/{event.maxTeamSize} members</span>
                    {isBelowMin && !isSubmitted && <Badge className="bg-[rgba(234,179,8,0.1)] text-[#EAB308] border-[rgba(234,179,8,0.2)] text-[10px]"><AlertTriangle className="w-3 h-3 mr-1" /> Below minimum</Badge>}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(218,255,1,0.08)] flex items-center justify-center text-lg font-bold text-[#DAFF01]">{myTeam.name[0]}</div>
                  <div>
                    <div className="text-base font-semibold text-white">{myTeam.name}</div>
                    {isLeader && <div className="text-xs text-[#DAFF01] flex items-center gap-1"><Crown className="w-3 h-3" /> You are the leader</div>}
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs text-[rgb(130,130,140)] mb-1.5">
                    <span>Team Size</span>
                    <span>{memberCount} of {event.minTeamSize}&ndash;{event.maxTeamSize}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isBelowMin ? 'bg-[#EAB308]' : 'bg-[#22C55E]'}`} style={{ width: `${Math.min((memberCount / event.maxTeamSize) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Invite Code (Leader Only, not submitted) */}
                {isLeader && !isSubmitted && (
                  <div className="mb-5 p-4 rounded-xl bg-[rgba(218,255,1,0.05)] border border-[rgba(218,255,1,0.15)]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs uppercase text-[rgb(130,130,140)]">Team Invite Code</div>
                      {myTeam.inviteCode ? (
                        <button onClick={handleRegenerateCode} disabled={regeneratingCode} className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-lg text-[rgb(161,161,170)] hover:text-[#DAFF01] hover:bg-[rgba(218,255,1,0.08)] transition-all disabled:opacity-40" title="Regenerate">
                          {regeneratingCode ? <Loader2 className="w-3 h-3 animate-spin" /> : <><RefreshCw className="w-3 h-3" /> New Code</>}
                        </button>
                      ) : (
                        <button onClick={handleRegenerateCode} disabled={regeneratingCode} className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-lg bg-[rgba(218,255,1,0.1)] text-[#DAFF01] hover:bg-[rgba(218,255,1,0.18)] transition-all disabled:opacity-40">
                          {regeneratingCode ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Generate Code'}
                        </button>
                      )}
                    </div>
                    {myTeam.inviteCode ? (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex-1 p-3 rounded-lg bg-[rgb(17,17,19)] border border-[rgba(218,255,1,0.2)]">
                            <div className="text-lg font-mono font-bold text-[#DAFF01] text-center tracking-widest">{myTeam.inviteCode}</div>
                          </div>
                          <button onClick={copyInviteCode} className="p-3 rounded-lg bg-[rgba(218,255,1,0.1)] hover:bg-[rgba(218,255,1,0.18)] transition-all" title="Copy code">
                            {copiedCode ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4 text-[#DAFF01]" />}
                          </button>
                        </div>
                        <div className="p-3 rounded-lg bg-[rgb(17,17,19)] border border-[rgba(255,255,255,0.04)]">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-[10px] uppercase text-[rgb(130,130,140)]">Share this message</div>
                            <button onClick={() => { const msg = `Join my team "${myTeam.name}" on SPARK!\n\nUse invite code: ${myTeam.inviteCode}\n\nOr click: ${window.location.origin}/events/${event.id}\n\nCode is valid until team is submitted.`; navigator.clipboard.writeText(msg); setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }} className="text-[10px] text-[rgb(161,161,170)] hover:text-[#DAFF01] transition-colors">
                              {copiedCode ? 'Copied!' : 'Copy All'}
                            </button>
                          </div>
                          <div className="text-xs text-[rgb(200,200,210)] font-mono whitespace-pre-wrap break-all">
                            Join my team &quot;{myTeam.name}&quot; on SPARK!{'\n\n'}Use invite code: <span className="text-[#DAFF01] font-bold">{myTeam.inviteCode}</span>{'\n\n'}Or visit: <span className="text-[#00D4FF]">{typeof window !== 'undefined' && window.location.origin}/events/{event.id}</span>{'\n\n'}Code is valid until team is submitted.
                          </div>
                        </div>
                        <p className="text-[10px] text-[rgb(130,130,140)] mt-2">Share code via WhatsApp, email, or any messaging app. Code stays valid until you submit the team.</p>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-xs text-[rgb(161,161,170)] mb-2">No active invite code. Generate one to let others join.</div>
                      </div>
                    )}
                  </div>
                )}

                {isLeader && isSubmitted && (
                  <div className="mb-5 p-3 rounded-xl bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.15)]">
                    <div className="flex items-center gap-2 text-xs text-[#22C55E]">
                      <Shield className="w-4 h-4 shrink-0" />
                      <span>Team has been submitted. Invite code has been deactivated.</span>
                    </div>
                  </div>
                )}

                {isBelowMin && !isSubmitted && (
                  <div className="flex items-start gap-2 p-3 mb-5 rounded-xl bg-[rgba(234,179,8,0.06)] border border-[rgba(234,179,8,0.15)]">
                    <AlertTriangle className="w-4 h-4 text-[#EAB308] mt-0.5 shrink-0" />
                    <div className="text-xs text-[#EAB308]">
                      Your team needs at least <strong>{event.minTeamSize}</strong> members. Add <strong>{event.minTeamSize - memberCount}</strong> more to meet the minimum requirement.
                    </div>
                  </div>
                )}

                {/* Members */}
                <div className="space-y-2 mb-5">
                  <div className="text-xs uppercase text-[rgb(130,130,140)] mb-2">Members</div>
                  {myTeam.members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-[rgb(17,17,19)] border border-[rgba(255,255,255,0.04)]">
                      <div className="flex items-center gap-3">
                        {member.user.profileImageUrl ? (
                          <img src={member.user.profileImageUrl} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[rgba(218,255,1,0.1)] flex items-center justify-center text-xs font-bold text-[#DAFF01]">
                            {(member.user.displayName || member.user.email || '?')[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-white flex items-center gap-1.5">
                            {member.user.displayName || member.user.email}
                            {member.isLeader && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[rgba(218,255,1,0.1)] border border-[rgba(218,255,1,0.2)] text-[#DAFF01] text-[10px] font-semibold leading-none">
                                <Crown className="w-2.5 h-2.5" /> Leader
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[rgb(130,130,140)]">{member.user.email}</div>
                        </div>
                      </div>
                      {isLeader && !member.isLeader && !isSubmitted && (
                        <button onClick={() => handleRemoveMember(member.id)} disabled={removingId === member.id} className="p-1.5 rounded-lg text-[rgb(161,161,170)] hover:text-red-400 hover:bg-[rgba(239,68,68,0.08)] transition-all disabled:opacity-40" title="Remove member">
                          {removingId === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pending Invites (Leader) */}
                {isLeader && pendingInvites.length > 0 && (
                  <div className="mb-5">
                    <div className="text-xs uppercase text-[rgb(130,130,140)] mb-2">Pending Invites</div>
                    <div className="space-y-2">
                      {pendingInvites.map((invite: any) => (
                        <div key={invite.id} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(59,130,246,0.04)] border border-[rgba(59,130,246,0.1)]">
                          <div className="flex items-center gap-3">
                            {invite.invitedUser.profileImageUrl ? (
                              <img src={invite.invitedUser.profileImageUrl} alt="" className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[rgba(59,130,246,0.1)] flex items-center justify-center text-xs font-bold text-[#3B82F6]">
                                {(invite.invitedUser.displayName || invite.invitedUser.email || '?')[0].toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="text-sm text-white">{invite.invitedUser.displayName || invite.invitedUser.email}</div>
                              <div className="text-xs text-[rgb(130,130,140)] flex items-center gap-1"><Send className="w-3 h-3" /> Invite pending</div>
                            </div>
                          </div>
                          <button onClick={() => handleCancelInvite(invite.id)} disabled={cancellingInvite === invite.id} className="p-1.5 rounded-lg text-[rgb(161,161,170)] hover:text-red-400 hover:bg-[rgba(239,68,68,0.08)] transition-all disabled:opacity-40" title="Cancel invite">
                            {cancellingInvite === invite.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invite Member (leader, not at max, not submitted) */}
                {isLeader && !isAtMax && !isSubmitted && (
                  <div className="mb-4">
                    <div className="text-xs uppercase text-[rgb(130,130,140)] mb-2">Invite Member</div>
                    <div className="flex gap-2">
                      <Input placeholder="Enter member's email" value={memberEmail} onChange={(e) => { setMemberEmail(e.target.value); setInviteError(''); setInviteSuccess(''); }} onKeyDown={(e) => e.key === 'Enter' && handleSendInvite()} className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white flex-1" />
                      <button onClick={handleSendInvite} disabled={sendingInvite || !memberEmail.trim()} className="px-4 py-2 rounded-xl bg-[rgba(59,130,246,0.1)] text-[#3B82F6] hover:bg-[rgba(59,130,246,0.18)] transition-all disabled:opacity-40 flex items-center gap-2 text-sm font-medium">
                        {sendingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Invite</>}
                      </button>
                    </div>
                    {inviteError && <p className="text-xs text-red-400 mt-2">{inviteError}</p>}
                    {inviteSuccess && <p className="text-xs text-[#22C55E] mt-2">{inviteSuccess}</p>}
                    <p className="text-[10px] text-[rgb(130,130,140)] mt-1.5">An invite will be sent. The member must accept it on the event page to join.</p>
                  </div>
                )}

                {isLeader && isAtMax && !isSubmitted && (
                  <p className="text-xs text-[rgb(130,130,140)] mb-4">Team is at maximum capacity ({event.maxTeamSize} members).</p>
                )}

                {teamActionError && <p className="text-xs text-red-400 mb-4">{teamActionError}</p>}

                {/* Team Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  {isLeader ? (
                    <>
                      {!isSubmitted && !isBelowMin && (
                        <button onClick={() => setShowSubmitConfirm(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[#22C55E] text-white hover:bg-[#16a34a] transition-all">
                          <Shield className="w-4 h-4" /> Submit Team
                        </button>
                      )}
                      {!isSubmitted && (
                        <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl border border-[rgba(239,68,68,0.2)] text-red-400 hover:bg-[rgba(239,68,68,0.06)] transition-all">
                          <Trash2 className="w-4 h-4" /> Delete Team
                        </button>
                      )}
                    </>
                  ) : (
                    !isSubmitted && (
                      <button onClick={handleLeaveTeam} disabled={leavingTeam} className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl border border-[rgba(255,255,255,0.1)] text-[rgb(161,161,170)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all disabled:opacity-40">
                        {leavingTeam ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LogOut className="w-4 h-4" /> Leave Team</>}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="p-6 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)]">
              <h2 className="text-lg font-bold text-white mb-4">About</h2>
              <p className="text-[rgb(200,200,210)] leading-relaxed whitespace-pre-wrap">{event.description}</p>
              {(event.tags.length > 0 || event.skills.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  {event.tags.map((tag) => <Badge key={tag} className="bg-[rgba(218,255,1,0.08)] text-[#DAFF01] border-[rgba(218,255,1,0.2)]">{tag}</Badge>)}
                  {event.skills.map((skill) => <Badge key={skill} className="bg-[rgba(0,212,255,0.08)] text-[#00D4FF] border-[rgba(0,212,255,0.2)]">{skill}</Badge>)}
                </div>
              )}
            </div>

            {/* Rounds */}
            {event.rounds.length > 0 && (
              <div className="p-6 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)]">
                <h2 className="text-lg font-bold text-white mb-4">Rounds</h2>
                <div className="space-y-3">
                  {event.rounds.map((round) => (
                    <div key={round.id} className="flex items-center gap-4 p-4 rounded-xl bg-[rgb(17,17,19)] border border-[rgba(255,255,255,0.04)]">
                      <div className="w-10 h-10 rounded-lg bg-[rgba(218,255,1,0.08)] flex items-center justify-center text-sm font-bold text-[#DAFF01]">R{round.roundNumber}</div>
                      <div className="flex-1"><div className="text-sm font-medium text-white">{round.title}</div></div>
                      <Badge className={`text-[10px] border ${round.status === 'ACTIVE' ? 'bg-[rgba(34,197,94,0.1)] text-[#22C55E] border-[rgba(34,197,94,0.2)]' : round.status === 'COMPLETED' ? 'bg-[rgba(161,161,170,0.1)] text-[rgb(161,161,170)] border-[rgba(161,161,170,0.2)]' : 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6] border-[rgba(59,130,246,0.2)]'}`}>{round.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
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
                  <div className="text-sm text-white">{new Date(event.registrationEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
              )}
              {event.virtualLink && (
                <div>
                  <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Meeting Link</div>
                  <a href={event.virtualLink} target="_blank" rel="noopener noreferrer" className="text-sm text-[#DAFF01] flex items-center gap-1 hover:underline">
                    Join <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {event.prizes.length > 0 && (
              <div className="p-5 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)]">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-[#DAFF01]" /> Prizes</h3>
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

            {sortedSponsors.length > 0 && (
              <div className="p-5 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)]">
                <h3 className="text-sm font-bold text-white mb-3">Sponsors</h3>
                <div className="space-y-3">
                  {sortedSponsors.map((sponsor) => (
                    <div key={sponsor.id} className="flex items-center gap-3">
                      {sponsor.logoUrl ? (
                        <img src={sponsor.logoUrl} alt="" className="w-8 h-8 rounded-lg object-contain bg-white p-1" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center text-xs font-bold text-white">{sponsor.name[0]}</div>
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

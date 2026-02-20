'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import {
  User,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Heart,
  BookOpen,
  Zap,
  CheckCircle2,
  Loader2,
  X,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getCurrentDbUser, updateCurrentUserProfile } from '@/app/actions/user-actions';

// ─── helpers ───────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, complete }: { icon: any; title: string; complete: boolean }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${complete ? 'bg-[rgba(34,197,94,0.12)]' : 'bg-[rgba(255,255,255,0.06)]'}`}>
          {complete ? <CheckCircle2 className="w-4.5 h-4.5 text-[#22C55E]" /> : <Icon className="w-4.5 h-4.5 text-[rgb(161,161,170)]" />}
        </div>
        <h2 className="text-base font-bold text-white">{title}</h2>
      </div>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs font-medium text-[rgb(161,161,170)] mb-1.5 block">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function SaveButton({ saving, disabled, onClick }: { saving: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <div className="flex justify-end mt-6 pt-5 border-t border-[rgba(255,255,255,0.06)]">
      <button
        onClick={onClick}
        disabled={saving || disabled}
        className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] hover:bg-[rgb(166,190,21)] disabled:opacity-40 transition-all"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        Save
      </button>
    </div>
  );
}

function ChipGroup({ options, value, onChange, multi }: { options: string[]; value: string | string[]; onChange: (v: string | string[]) => void; multi?: boolean }) {
  function toggle(opt: string) {
    if (multi) {
      const arr = value as string[];
      onChange(arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt]);
    } else {
      onChange(value === opt ? '' : opt);
    }
  }
  const selected = Array.isArray(value) ? value : [value];
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => toggle(opt)}
          className={`px-4 py-2 text-sm rounded-full border transition-all ${
            selected.includes(opt)
              ? 'border-[rgba(218,255,1,0.4)] bg-[rgba(218,255,1,0.08)] text-[#DAFF01]'
              : 'border-[rgba(255,255,255,0.1)] text-[rgb(161,161,170)] hover:border-[rgba(255,255,255,0.22)] hover:text-white'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function TagInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('');
  function add() {
    const t = input.trim();
    if (t && !values.includes(t)) onChange([...values, t]);
    setInput('');
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v) => (
          <span key={v} className="flex items-center gap-1 px-3 py-1 rounded-full bg-[rgba(218,255,1,0.08)] border border-[rgba(218,255,1,0.2)] text-[#DAFF01] text-xs font-medium">
            {v}
            <button onClick={() => onChange(values.filter((x) => x !== v))} className="ml-0.5 hover:text-white"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
        />
        <button onClick={add} className="px-3 py-2 rounded-xl bg-[rgba(218,255,1,0.08)] border border-[rgba(218,255,1,0.2)] text-[#DAFF01] hover:bg-[rgba(218,255,1,0.14)] transition-all">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── main component ────────────────────────────────────────
export default function ProfileLayout() {
  const user = useUser();
  const router = useRouter();
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('basic');

  // Section states
  const [basic, setBasic] = useState({ firstName: '', lastName: '', phone: '', gender: '', userType: '', domain: '', course: '', specialization: '', degree: '', courseStartYear: '', graduationYear: '', college: '', location: '', courseType: '', isGraduated: false, company: '', designation: '' });
  const [about, setAbout] = useState({ bio: '' });
  const [skills, setSkills] = useState<string[]>([]);
  const [personal, setPersonal] = useState({ pronouns: '', dateOfBirth: '', location: '', permanentAddress: '', hobbies: [] as string[] });
  const [social, setSocial] = useState({ githubUrl: '', linkedinUrl: '', twitterUrl: '', instagramUrl: '', facebookUrl: '', websiteUrl: '' });

  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<string | null>(null);

  useEffect(() => {
    getCurrentDbUser().then((u) => {
      if (!u) { setLoading(false); return; }
      setDbUser(u);
      setBasic({
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        phone: u.phone || '',
        gender: u.gender || '',
        userType: u.userType || '',
        domain: u.domain || '',
        course: u.course || '',
        specialization: u.specialization || '',
        degree: u.degree || '',
        courseStartYear: u.courseStartYear ? String(u.courseStartYear) : '',
        graduationYear: u.graduationYear ? String(u.graduationYear) : '',
        college: u.college || '',
        location: u.location || '',
        courseType: u.courseType || '',
        isGraduated: u.isGraduated || false,
        company: u.company || '',
        designation: u.designation || '',
      });
      setAbout({ bio: u.bio || '' });
      setSkills(u.skills || []);
      setPersonal({
        pronouns: u.pronouns || '',
        dateOfBirth: u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split('T')[0] : '',
        location: u.location || '',
        permanentAddress: u.permanentAddress || '',
        hobbies: u.hobbies || [],
      });
      setSocial({
        githubUrl: u.githubUrl || '',
        linkedinUrl: u.linkedinUrl || '',
        twitterUrl: u.twitterUrl || '',
        instagramUrl: u.instagramUrl || '',
        facebookUrl: u.facebookUrl || '',
        websiteUrl: u.websiteUrl || '',
      });
      setLoading(false);
    });
  }, []);

  async function save(section: string, data: Record<string, unknown>) {
    setSavingSection(section);
    try {
      await updateCurrentUserProfile(data as any);
      setSavedSection(section);
      setTimeout(() => setSavedSection(null), 2000);
    } catch (err) { console.error(err); }
    finally { setSavingSection(null); }
  }

  const sections = [
    { id: 'basic', label: 'Basic Details', icon: User },
    { id: 'about', label: 'About', icon: BookOpen },
    { id: 'skills', label: 'Skills', icon: Zap },
    { id: 'personal', label: 'Personal Details', icon: Heart },
    { id: 'social', label: 'Social Links', icon: Globe },
  ];

  function isSectionComplete(id: string) {
    if (!dbUser) return false;
    if (id === 'basic') return !!(dbUser.firstName && dbUser.phone && dbUser.college);
    if (id === 'about') return !!dbUser.bio;
    if (id === 'skills') return (dbUser.skills || []).length > 0;
    if (id === 'personal') return !!dbUser.dateOfBirth;
    if (id === 'social') return !!(dbUser.linkedinUrl || dbUser.githubUrl);
    return false;
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-6 h-6 animate-spin text-[rgb(130,130,140)]" />
    </div>
  );

  return (
    <div className="max-w-[1100px] mt-24 mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center gap-4 sm:gap-5 mb-8 sm:mb-10">
        <div className="relative shrink-0">
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="" className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[rgba(218,255,1,0.2)]" />
          ) : (
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-[rgba(218,255,1,0.08)] flex items-center justify-center text-xl sm:text-2xl font-bold text-[#DAFF01] border-2 border-[rgba(218,255,1,0.15)]">
              {(dbUser?.firstName || dbUser?.displayName || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
            {dbUser?.firstName ? `${dbUser.firstName}${dbUser.lastName ? ` ${dbUser.lastName}` : ''}` : (dbUser?.displayName || 'Your Profile')}
          </h1>
          <p className="text-xs sm:text-sm text-[rgb(130,130,140)] truncate">{dbUser?.email}</p>
          {dbUser?.userType && <p className="text-[11px] sm:text-xs text-[rgb(100,100,110)] mt-1 truncate">{dbUser.userType}{dbUser.college ? ` · ${dbUser.college}` : ''}</p>}
        </div>
      </div>

      {/* Mobile section tabs — horizontal scroll */}
      <div className="md:hidden mb-5 -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max pb-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeSection === s.id
                  ? 'bg-[rgba(218,255,1,0.08)] text-[#DAFF01] border border-[rgba(218,255,1,0.2)]'
                  : 'text-[rgb(161,161,170)] border border-[rgba(255,255,255,0.06)] hover:text-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isSectionComplete(s.id) ? 'bg-[rgba(34,197,94,0.12)]' : activeSection === s.id ? 'bg-[rgba(218,255,1,0.06)]' : 'bg-[rgba(255,255,255,0.04)]'}`}>
                {isSectionComplete(s.id)
                  ? <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                  : <s.icon className={`w-3 h-3 ${activeSection === s.id ? 'text-[#DAFF01]' : 'text-[rgb(100,100,110)]'}`} />
                }
              </div>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left sidebar — desktop only, sticky */}
        <div className="hidden md:block w-[220px] shrink-0">
          <div className="sticky top-28 space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeSection === s.id
                    ? 'bg-[rgba(218,255,1,0.08)] text-[#DAFF01] border border-[rgba(218,255,1,0.2)]'
                    : 'text-[rgb(161,161,170)] hover:text-white hover:bg-[rgba(255,255,255,0.04)] border border-transparent'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isSectionComplete(s.id) ? 'bg-[rgba(34,197,94,0.12)]' : activeSection === s.id ? 'bg-[rgba(218,255,1,0.06)]' : 'bg-[rgba(255,255,255,0.04)]'}`}>
                  {isSectionComplete(s.id)
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                    : <s.icon className={`w-3.5 h-3.5 ${activeSection === s.id ? 'text-[#DAFF01]' : 'text-[rgb(100,100,110)]'}`} />
                  }
                </div>
                {s.label}
                {activeSection === s.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0 p-4 sm:p-7 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.07)]">

          {/* ── BASIC DETAILS ── */}
          {activeSection === 'basic' && (
            <div>
              <SectionHeader icon={User} title="Basic Details" complete={isSectionComplete('basic')} />
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>First Name</FieldLabel>
                    <Input value={basic.firstName} onChange={(e) => setBasic((b) => ({ ...b, firstName: e.target.value }))} placeholder="First name" className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                  </div>
                  <div>
                    <FieldLabel>Last Name</FieldLabel>
                    <Input value={basic.lastName} onChange={(e) => setBasic((b) => ({ ...b, lastName: e.target.value }))} placeholder="Last name" className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                  </div>
                </div>
                <div>
                  <FieldLabel required>Mobile</FieldLabel>
                  <Input value={basic.phone} onChange={(e) => setBasic((b) => ({ ...b, phone: e.target.value }))} placeholder="e.g. +91 98765 43210" className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                </div>
                <div>
                  <FieldLabel>Gender</FieldLabel>
                  <ChipGroup options={['Male', 'Female', 'Non-binary', 'Prefer not to say']} value={basic.gender} onChange={(v) => setBasic((b) => ({ ...b, gender: v as string }))} />
                </div>
                <div>
                  <FieldLabel>User Type</FieldLabel>
                  <ChipGroup options={['College Student', 'Professional', 'School Student', 'Fresher']} value={basic.userType} onChange={(v) => setBasic((b) => ({ ...b, userType: v as string }))} />
                </div>
                <div>
                  <FieldLabel>Domain</FieldLabel>
                  <ChipGroup options={['Engineering', 'Management', 'Arts & Science', 'Medicine', 'Law', 'Others']} value={basic.domain} onChange={(v) => setBasic((b) => ({ ...b, domain: v as string }))} />
                </div>

                {basic.userType !== 'Professional' ? (
                  <>
                    <div>
                      <FieldLabel>Course / Degree</FieldLabel>
                      <select value={basic.degree} onChange={(e) => setBasic((b) => ({ ...b, degree: e.target.value }))} className="w-full px-3 py-2.5 text-sm rounded-lg bg-[rgb(17,17,19)] border border-[rgba(255,255,255,0.08)] text-white outline-none">
                        <option value="">Select Course</option>
                        {['B.Tech / B.E.', 'BCA', 'B.Sc', 'B.Com', 'BBA', 'M.Tech', 'MCA', 'MBA', 'M.Sc', 'PhD', 'Diploma', 'Other'].map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <FieldLabel>Specialization / Branch</FieldLabel>
                      <Input value={basic.specialization} onChange={(e) => setBasic((b) => ({ ...b, specialization: e.target.value }))} placeholder="e.g. Computer Science" className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Course Start Year</FieldLabel>
                        <Input value={basic.courseStartYear} onChange={(e) => setBasic((b) => ({ ...b, courseStartYear: e.target.value }))} placeholder="e.g. 2022" className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                      </div>
                      <div>
                        <FieldLabel>Graduation Year</FieldLabel>
                        <Input value={basic.graduationYear} onChange={(e) => setBasic((b) => ({ ...b, graduationYear: e.target.value }))} placeholder="e.g. 2026" className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                      </div>
                    </div>
                    <div>
                      <FieldLabel required>College / University</FieldLabel>
                      <Input value={basic.college} onChange={(e) => setBasic((b) => ({ ...b, college: e.target.value }))} placeholder="e.g. Delhi Technological University" className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <FieldLabel>Company</FieldLabel>
                      <Input value={basic.company} onChange={(e) => setBasic((b) => ({ ...b, company: e.target.value }))} placeholder="e.g. Google, Microsoft" className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                    </div>
                    <div>
                      <FieldLabel>Designation</FieldLabel>
                      <Input value={basic.designation} onChange={(e) => setBasic((b) => ({ ...b, designation: e.target.value }))} placeholder="e.g. Software Engineer" className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                    </div>
                  </>
                )}

                <div>
                  <FieldLabel>Current Location</FieldLabel>
                  <Input value={basic.location} onChange={(e) => setBasic((b) => ({ ...b, location: e.target.value }))} placeholder="e.g. Mumbai, Maharashtra" className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                </div>
              </div>
              <SaveButton
                saving={savingSection === 'basic'}
                onClick={() => save('basic', {
                  firstName: basic.firstName,
                  lastName: basic.lastName,
                  displayName: basic.firstName ? `${basic.firstName}${basic.lastName ? ` ${basic.lastName}` : ''}` : undefined,
                  phone: basic.phone,
                  gender: basic.gender,
                  userType: basic.userType,
                  domain: basic.domain,
                  course: basic.course || basic.degree,
                  specialization: basic.specialization,
                  degree: basic.degree,
                  courseStartYear: basic.courseStartYear ? parseInt(basic.courseStartYear) : null,
                  graduationYear: basic.graduationYear ? parseInt(basic.graduationYear) : null,
                  courseType: basic.courseType,
                  college: basic.college,
                  location: basic.location,
                  isGraduated: basic.userType === 'Professional',
                  company: basic.company,
                  designation: basic.designation,
                })}
              />
            </div>
          )}

          {/* ── ABOUT ── */}
          {activeSection === 'about' && (
            <div>
              <SectionHeader icon={BookOpen} title="About" complete={isSectionComplete('about')} />
              <div>
                <FieldLabel required>About Me</FieldLabel>
                <p className="text-[11px] text-[rgb(100,100,110)] mb-2">Maximum 1000 characters</p>
                <textarea
                  value={about.bio}
                  onChange={(e) => setAbout({ bio: e.target.value })}
                  maxLength={1000}
                  rows={7}
                  placeholder="Introduce yourself here! Share a brief overview of who you are, your interests, and connect with fellow users, recruiters & organizers."
                  className="w-full px-4 py-3 text-sm rounded-xl bg-[rgb(17,17,19)] border border-[rgba(255,255,255,0.08)] text-white resize-none outline-none focus:border-[rgba(218,255,1,0.3)] transition-colors placeholder:text-[rgb(80,80,90)]"
                />
                <div className="text-right text-[11px] text-[rgb(100,100,110)] mt-1">{about.bio.length}/1000</div>
              </div>
              <SaveButton saving={savingSection === 'about'} onClick={() => save('about', { bio: about.bio })} />
            </div>
          )}

          {/* ── SKILLS ── */}
          {activeSection === 'skills' && (
            <div>
              <SectionHeader icon={Zap} title="Skills" complete={isSectionComplete('skills')} />
              <div>
                <FieldLabel>Your Skills</FieldLabel>
                <p className="text-[11px] text-[rgb(100,100,110)] mb-3">Press Enter or click + to add a skill</p>
                <TagInput values={skills} onChange={setSkills} placeholder="e.g. React, Python, Machine Learning..." />
              </div>
              <SaveButton saving={savingSection === 'skills'} onClick={() => save('skills', { skills })} />
            </div>
          )}

          {/* ── PERSONAL DETAILS ── */}
          {activeSection === 'personal' && (
            <div>
              <SectionHeader icon={Heart} title="Personal Details" complete={isSectionComplete('personal')} />
              <div className="space-y-5">
                <div>
                  <FieldLabel>Pronouns</FieldLabel>
                  <ChipGroup options={['He/Him/his', 'She/Her', 'Them/They']} value={personal.pronouns} onChange={(v) => setPersonal((p) => ({ ...p, pronouns: v as string }))} />
                </div>
                <div>
                  <FieldLabel>Date of Birth</FieldLabel>
                  <Input type="date" value={personal.dateOfBirth} onChange={(e) => setPersonal((p) => ({ ...p, dateOfBirth: e.target.value }))} className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                </div>
                <div>
                  <FieldLabel>Current Address</FieldLabel>
                  <Input value={personal.location} onChange={(e) => setPersonal((p) => ({ ...p, location: e.target.value }))} placeholder="e.g. Mumbai, Maharashtra" className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                </div>
                <div>
                  <FieldLabel>Permanent Address</FieldLabel>
                  <Input value={personal.permanentAddress} onChange={(e) => setPersonal((p) => ({ ...p, permanentAddress: e.target.value }))} placeholder="Same as current address" className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white" />
                </div>
                <div>
                  <FieldLabel>Hobbies</FieldLabel>
                  <TagInput values={personal.hobbies} onChange={(v) => setPersonal((p) => ({ ...p, hobbies: v }))} placeholder="e.g. Cricket, Chess, Reading..." />
                </div>
              </div>
              <SaveButton
                saving={savingSection === 'personal'}
                onClick={() => save('personal', {
                  pronouns: personal.pronouns,
                  dateOfBirth: personal.dateOfBirth || null,
                  location: personal.location,
                  permanentAddress: personal.permanentAddress,
                  hobbies: personal.hobbies,
                })}
              />
            </div>
          )}

          {/* ── SOCIAL LINKS ── */}
          {activeSection === 'social' && (
            <div>
              <SectionHeader icon={Globe} title="Social Links" complete={isSectionComplete('social')} />
              <div className="space-y-4">
                {[
                  { key: 'linkedinUrl', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://www.linkedin.com/in/username/' },
                  { key: 'githubUrl', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
                  { key: 'twitterUrl', label: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/username' },
                  { key: 'instagramUrl', label: 'Instagram', icon: Instagram, placeholder: 'https://www.instagram.com/username' },
                  { key: 'facebookUrl', label: 'Facebook', icon: Facebook, placeholder: 'https://www.facebook.com/username' },
                  { key: 'websiteUrl', label: 'Website / Portfolio', icon: Globe, placeholder: 'https://yourwebsite.com' },
                ].map(({ key, label, icon: Icon, placeholder }) => (
                  <div key={key} className="space-y-1.5 sm:grid sm:grid-cols-[140px_1fr] sm:gap-4 sm:items-center sm:space-y-0">
                    <div className="flex items-center gap-2 text-sm text-[rgb(200,200,210)]">
                      <Icon className="w-4 h-4 text-[rgb(100,100,110)]" />
                      {label}
                    </div>
                    <Input
                      value={(social as any)[key]}
                      onChange={(e) => setSocial((s) => ({ ...s, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
                    />
                  </div>
                ))}
              </div>
              <SaveButton saving={savingSection === 'social'} onClick={() => save('social', social)} />
            </div>
          )}

          {/* Saved toast */}
          {savedSection && (
            <div className="mt-4 flex items-center gap-2 text-xs text-[#22C55E]">
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

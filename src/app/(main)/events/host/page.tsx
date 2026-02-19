'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import {
  Zap,
  Calendar,
  MapPin,
  Users,
  Settings,
  ArrowLeft,
  ArrowRight,
  Globe,
  Lock,
  Image as ImageIcon,
  Tag,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { createEvent } from '@/app/actions/event-actions';
import Link from 'next/link';

const eventTypes = [
  { value: 'HACKATHON', label: 'Hackathon', icon: Zap },
  { value: 'CONFERENCE', label: 'Conference', icon: Users },
  { value: 'WORKSHOP', label: 'Workshop', icon: Settings },
  { value: 'MEETUP', label: 'Meetup', icon: Globe },
  { value: 'COMPETITION', label: 'Competition', icon: Zap },
  { value: 'WEBINAR', label: 'Webinar', icon: Globe },
] as const;

const steps = [
  { label: 'Basics', icon: Zap },
  { label: 'Schedule', icon: Calendar },
  { label: 'Details', icon: Settings },
  { label: 'Review', icon: ArrowRight },
];

type EventTypeValue = (typeof eventTypes)[number]['value'];

export default function HostEventPage() {
  const router = useRouter();
  const user = useUser();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    tagline: '',
    description: '',
    type: 'HACKATHON' as EventTypeValue,
    startDate: '',
    endDate: '',
    registrationStart: '',
    registrationEnd: '',
    location: '',
    isVirtual: true,
    virtualLink: '',
    maxTeamSize: 4,
    minTeamSize: 1,
    maxParticipants: undefined as number | undefined,
    isPublic: true,
    requireApproval: false,
    tags: [] as string[],
    skills: [] as string[],
    coverImage: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [skillInput, setSkillInput] = useState('');

  function update(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addTag() {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      update('tags', [...form.tags, tagInput.trim()]);
      setTagInput('');
    }
  }

  function addSkill() {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      update('skills', [...form.skills, skillInput.trim()]);
      setSkillInput('');
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const result = await createEvent({
        title: form.title,
        tagline: form.tagline || undefined,
        description: form.description,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        registrationStart: form.registrationStart || undefined,
        registrationEnd: form.registrationEnd || undefined,
        location: form.location || undefined,
        isVirtual: form.isVirtual,
        virtualLink: form.virtualLink || undefined,
        maxTeamSize: form.maxTeamSize,
        minTeamSize: form.minTeamSize,
        maxParticipants: form.maxParticipants,
        isPublic: form.isPublic,
        requireApproval: form.requireApproval,
        tags: form.tags,
        skills: form.skills,
        coverImage: form.coverImage || undefined,
      });

      if (result.success && result.eventId) {
        router.push(`/events/${result.eventId}/manage`);
      } else {
        setError(result.error || 'Failed to create event');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[rgb(17,17,19)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to host an event</h2>
          <Link
            href="/handler/sign-in"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)]"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const canNext =
    step === 0 ? form.title && form.description && form.type :
    step === 1 ? form.startDate && form.endDate :
    step === 2 ? true :
    true;

  return (
    <div className="min-h-screen bg-[rgb(17,17,19)]">
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Link
            href="/events"
            className="flex items-center gap-2 text-sm text-[rgb(161,161,170)] hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Host an Event</h1>
          <p className="text-[rgb(161,161,170)]">
            Create and manage your hackathon, conference, or workshop.
          </p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => i <= step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  i === step
                    ? 'bg-[rgba(218,255,1,0.12)] text-[#DAFF01]'
                    : i < step
                    ? 'text-[#DAFF01] opacity-60'
                    : 'text-[rgb(80,80,90)]'
                }`}
              >
                <s.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px ${i < step ? 'bg-[rgba(218,255,1,0.3)]' : 'bg-[rgba(255,255,255,0.06)]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {step === 0 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[rgb(200,200,210)]">Event Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {eventTypes.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => update('type', t.value)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                        form.type === t.value
                          ? 'border-[rgba(218,255,1,0.4)] bg-[rgba(218,255,1,0.08)] text-[#DAFF01]'
                          : 'border-[rgba(255,255,255,0.08)] bg-[rgb(26,28,30)] text-[rgb(161,161,170)] hover:border-[rgba(255,255,255,0.2)]'
                      }`}
                    >
                      <t.icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[rgb(200,200,210)]">Event Title *</label>
                <Input
                  placeholder="e.g. Global AI Hackathon 2025"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  className="bg-[rgb(26,28,30)] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[rgb(100,100,110)] focus:border-[rgba(218,255,1,0.3)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[rgb(200,200,210)]">Tagline</label>
                <Input
                  placeholder="Brief one-liner for your event"
                  value={form.tagline}
                  onChange={(e) => update('tagline', e.target.value)}
                  className="bg-[rgb(26,28,30)] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[rgb(100,100,110)] focus:border-[rgba(218,255,1,0.3)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[rgb(200,200,210)]">Description *</label>
                <Textarea
                  placeholder="Tell participants what this event is about..."
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={5}
                  className="bg-[rgb(26,28,30)] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[rgb(100,100,110)] focus:border-[rgba(218,255,1,0.3)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[rgb(200,200,210)]">Cover Image URL</label>
                <Input
                  placeholder="https://..."
                  value={form.coverImage}
                  onChange={(e) => update('coverImage', e.target.value)}
                  className="bg-[rgb(26,28,30)] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[rgb(100,100,110)] focus:border-[rgba(218,255,1,0.3)]"
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[rgb(200,200,210)]">Start Date *</label>
                  <Input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => update('startDate', e.target.value)}
                    className="bg-[rgb(26,28,30)] border-[rgba(255,255,255,0.08)] text-white focus:border-[rgba(218,255,1,0.3)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[rgb(200,200,210)]">End Date *</label>
                  <Input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => update('endDate', e.target.value)}
                    className="bg-[rgb(26,28,30)] border-[rgba(255,255,255,0.08)] text-white focus:border-[rgba(218,255,1,0.3)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[rgb(200,200,210)]">Registration Opens</label>
                  <Input
                    type="datetime-local"
                    value={form.registrationStart}
                    onChange={(e) => update('registrationStart', e.target.value)}
                    className="bg-[rgb(26,28,30)] border-[rgba(255,255,255,0.08)] text-white focus:border-[rgba(218,255,1,0.3)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[rgb(200,200,210)]">Registration Closes</label>
                  <Input
                    type="datetime-local"
                    value={form.registrationEnd}
                    onChange={(e) => update('registrationEnd', e.target.value)}
                    className="bg-[rgb(26,28,30)] border-[rgba(255,255,255,0.08)] text-white focus:border-[rgba(218,255,1,0.3)]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-[rgb(200,200,210)]">Location</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => update('isVirtual', true)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      form.isVirtual
                        ? 'border-[rgba(218,255,1,0.4)] bg-[rgba(218,255,1,0.08)] text-[#DAFF01]'
                        : 'border-[rgba(255,255,255,0.08)] bg-[rgb(26,28,30)] text-[rgb(161,161,170)]'
                    }`}
                  >
                    <Globe className="w-4 h-4" /> Virtual
                  </button>
                  <button
                    onClick={() => update('isVirtual', false)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      !form.isVirtual
                        ? 'border-[rgba(218,255,1,0.4)] bg-[rgba(218,255,1,0.08)] text-[#DAFF01]'
                        : 'border-[rgba(255,255,255,0.08)] bg-[rgb(26,28,30)] text-[rgb(161,161,170)]'
                    }`}
                  >
                    <MapPin className="w-4 h-4" /> In-Person
                  </button>
                </div>
                {form.isVirtual ? (
                  <Input
                    placeholder="Virtual meeting link (optional)"
                    value={form.virtualLink}
                    onChange={(e) => update('virtualLink', e.target.value)}
                    className="bg-[rgb(26,28,30)] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[rgb(100,100,110)] focus:border-[rgba(218,255,1,0.3)]"
                  />
                ) : (
                  <Input
                    placeholder="Venue / City"
                    value={form.location}
                    onChange={(e) => update('location', e.target.value)}
                    className="bg-[rgb(26,28,30)] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[rgb(100,100,110)] focus:border-[rgba(218,255,1,0.3)]"
                  />
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[rgb(200,200,210)]">Min Team Size</label>
                  <Input
                    type="number"
                    min={1}
                    value={form.minTeamSize}
                    onChange={(e) => update('minTeamSize', parseInt(e.target.value) || 1)}
                    className="bg-[rgb(26,28,30)] border-[rgba(255,255,255,0.08)] text-white focus:border-[rgba(218,255,1,0.3)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[rgb(200,200,210)]">Max Team Size</label>
                  <Input
                    type="number"
                    min={1}
                    value={form.maxTeamSize}
                    onChange={(e) => update('maxTeamSize', parseInt(e.target.value) || 4)}
                    className="bg-[rgb(26,28,30)] border-[rgba(255,255,255,0.08)] text-white focus:border-[rgba(218,255,1,0.3)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[rgb(200,200,210)]">Max Participants</label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Unlimited"
                    value={form.maxParticipants ?? ''}
                    onChange={(e) => update('maxParticipants', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="bg-[rgb(26,28,30)] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[rgb(100,100,110)] focus:border-[rgba(218,255,1,0.3)]"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => update('isPublic', true)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    form.isPublic
                      ? 'border-[rgba(218,255,1,0.4)] bg-[rgba(218,255,1,0.08)] text-[#DAFF01]'
                      : 'border-[rgba(255,255,255,0.08)] bg-[rgb(26,28,30)] text-[rgb(161,161,170)]'
                  }`}
                >
                  <Globe className="w-4 h-4" /> Public
                </button>
                <button
                  onClick={() => update('isPublic', false)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    !form.isPublic
                      ? 'border-[rgba(218,255,1,0.4)] bg-[rgba(218,255,1,0.08)] text-[#DAFF01]'
                      : 'border-[rgba(255,255,255,0.08)] bg-[rgb(26,28,30)] text-[rgb(161,161,170)]'
                  }`}
                >
                  <Lock className="w-4 h-4" /> Private
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[rgb(200,200,210)]">Tags</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="bg-[rgb(26,28,30)] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[rgb(100,100,110)] focus:border-[rgba(218,255,1,0.3)]"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.08)] text-white text-sm hover:bg-[rgba(255,255,255,0.06)]"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-[rgba(218,255,1,0.08)] text-[#DAFF01] border-[rgba(218,255,1,0.2)] cursor-pointer hover:bg-[rgba(218,255,1,0.15)]"
                      onClick={() => update('tags', form.tags.filter((t) => t !== tag))}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[rgb(200,200,210)]">Required Skills</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="bg-[rgb(26,28,30)] border-[rgba(255,255,255,0.08)] text-white placeholder:text-[rgb(100,100,110)] focus:border-[rgba(218,255,1,0.3)]"
                  />
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.08)] text-white text-sm hover:bg-[rgba(255,255,255,0.06)]"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.skills.map((skill) => (
                    <Badge
                      key={skill}
                      className="bg-[rgba(0,212,255,0.08)] text-[#00D4FF] border-[rgba(0,212,255,0.2)] cursor-pointer hover:bg-[rgba(0,212,255,0.15)]"
                      onClick={() => update('skills', form.skills.filter((s) => s !== skill))}
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.06)]">
                <h3 className="text-lg font-bold text-white mb-4">Review Your Event</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Title</div>
                      <div className="text-white font-semibold">{form.title}</div>
                    </div>
                    <Badge className="bg-[rgba(218,255,1,0.12)] text-[#DAFF01] border-[rgba(218,255,1,0.25)]">
                      {eventTypes.find((t) => t.value === form.type)?.label}
                    </Badge>
                  </div>

                  {form.tagline && (
                    <div>
                      <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Tagline</div>
                      <div className="text-[rgb(200,200,210)] text-sm">{form.tagline}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Description</div>
                    <div className="text-[rgb(200,200,210)] text-sm line-clamp-3">{form.description}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Starts</div>
                      <div className="text-white text-sm flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#DAFF01]" />
                        {form.startDate ? new Date(form.startDate).toLocaleString() : 'TBD'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Ends</div>
                      <div className="text-white text-sm flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#DAFF01]" />
                        {form.endDate ? new Date(form.endDate).toLocaleString() : 'TBD'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Location</div>
                      <div className="text-white text-sm flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#DAFF01]" />
                        {form.isVirtual ? 'Virtual' : form.location || 'TBD'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-[rgb(130,130,140)] mb-1">Team Size</div>
                      <div className="text-white text-sm flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#DAFF01]" />
                        {form.minTeamSize} - {form.maxTeamSize} members
                      </div>
                    </div>
                  </div>

                  {(form.tags.length > 0 || form.skills.length > 0) && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {form.tags.map((tag) => (
                        <Badge key={tag} className="bg-[rgba(218,255,1,0.08)] text-[#DAFF01] border-[rgba(218,255,1,0.2)]">
                          {tag}
                        </Badge>
                      ))}
                      {form.skills.map((skill) => (
                        <Badge key={skill} className="bg-[rgba(0,212,255,0.08)] text-[#00D4FF] border-[rgba(0,212,255,0.2)]">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-[rgb(130,130,140)]">
                Your event will be created as a <strong className="text-white">Draft</strong>. You can publish it from the dashboard after adding rounds, prizes, and sponsors.
              </p>
            </div>
          )}
        </motion.div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[rgba(255,255,255,0.06)]">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl text-[rgb(161,161,170)] hover:text-white disabled:opacity-30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] hover:bg-[rgb(166,190,21)] disabled:opacity-40 transition-all"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] hover:bg-[rgb(166,190,21)] disabled:opacity-40 transition-all"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Creating...' : 'Create Event'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { Loader2, CheckCircle2, XCircle, Zap, AtSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { checkUsernameAvailability, updateCurrentUserProfile, getCurrentDbUser } from '@/app/actions/user-actions';
import { motion } from 'framer-motion';

export default function OnboardingPage() {
  const user = useUser();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Check if user already has username (already onboarded)
  useEffect(() => {
    if (!user) return;
    getCurrentDbUser().then((dbUser) => {
      if (dbUser?.onboardingDone && dbUser?.username) {
        router.replace(`/${dbUser.username}`);
      } else {
        // Pre-fill name from auth provider
        if (dbUser?.firstName) setFirstName(dbUser.firstName);
        else if (user.displayName) {
          const parts = user.displayName.split(' ');
          setFirstName(parts[0] || '');
          setLastName(parts.slice(1).join(' ') || '');
        }
        setLoading(false);
      }
    });
  }, [user, router]);

  // Debounced username check
  const checkUsername = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setAvailable(null);
      return;
    }
    setChecking(true);
    try {
      const result = await checkUsernameAvailability(value);
      setAvailable(result.available);
    } catch {
      setAvailable(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => checkUsername(username), 500);
    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  const isValidUsername = (value: string) => /^[a-zA-Z0-9_]{3,30}$/.test(value);

  const handleSubmit = async () => {
    if (!username.trim() || !firstName.trim()) return;
    if (!isValidUsername(username)) {
      setError('Username must be 3-30 characters, only letters, numbers, and underscores');
      return;
    }
    if (!available) {
      setError('Username is not available');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const result = await updateCurrentUserProfile({
        username: username.toLowerCase(),
        firstName,
        lastName,
        displayName: `${firstName}${lastName ? ` ${lastName}` : ''}`,
        onboardingDone: true,
      });

      if (result.success) {
        router.replace(`/${username.toLowerCase()}`);
      } else {
        setError(result.error || 'Failed to save profile');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    router.replace('/handler/sign-in');
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-[#DAFF01]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#DAFF01] flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-[rgb(17,17,19)]" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to Spark!</h1>
          <p className="text-sm text-[rgb(130,130,140)]">
            Set up your profile to get started. Choose a unique username.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[rgb(26,28,30)] border border-[rgba(255,255,255,0.07)] space-y-5">
          {/* Username */}
          <div>
            <label className="text-xs font-medium text-[rgb(161,161,170)] mb-1.5 block">
              Username <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(100,100,110)]">
                <AtSign className="w-4 h-4" />
              </div>
              <Input
                value={username}
                onChange={(e) => {
                  const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                  setUsername(val);
                  setError('');
                }}
                placeholder="your_username"
                maxLength={30}
                className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white pl-9 pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checking && <Loader2 className="w-4 h-4 animate-spin text-[rgb(130,130,140)]" />}
                {!checking && available === true && username.length >= 3 && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                {!checking && available === false && (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
            {username && !isValidUsername(username) && (
              <p className="text-[11px] text-amber-400 mt-1">3-30 characters, letters, numbers, and underscores only</p>
            )}
            {!checking && available === false && (
              <p className="text-[11px] text-red-400 mt-1">This username is already taken</p>
            )}
            {!checking && available === true && username.length >= 3 && (
              <p className="text-[11px] text-emerald-400 mt-1">Username is available!</p>
            )}
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[rgb(161,161,170)] mb-1.5 block">
                First Name <span className="text-red-400">*</span>
              </label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[rgb(161,161,170)] mb-1.5 block">
                Last Name
              </label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="bg-[rgb(17,17,19)] border-[rgba(255,255,255,0.08)] text-white"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-[rgba(248,113,113,0.06)] px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving || !username.trim() || !firstName.trim() || !available || !isValidUsername(username)}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-[#DAFF01] text-[rgb(17,17,19)] hover:bg-[rgb(166,190,21)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Continue
          </button>
        </div>

        <p className="text-center text-[11px] text-[rgb(80,80,90)] mt-4">
          You can update your profile details later from your profile page.
        </p>
      </motion.div>
    </div>
  );
}

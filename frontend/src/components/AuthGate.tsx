import React, { useState, useEffect } from 'react';
import { Github, ShieldAlert, Lock, Sparkles, Terminal } from 'lucide-react';
import { supabase, signInWithGitHub, signOut } from '../lib/supabase';
import { isDevMode, setDevMode } from '../lib/api';

const ALLOWED_USER = 'Surendhar2252';

interface AuthGateProps {
  children: (user: { id: string; username: string }) => React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [devBypassActive, setDevBypassActive] = useState<boolean>(() => isDevMode());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleActivateDevBypass = () => {
    setDevMode(true);
    setDevBypassActive(true);
  };

  const handleExitDevBypass = () => {
    setDevMode(false);
    setDevBypassActive(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-black">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm text-slate-500 dark:text-blue-300/70">Verifying security credentials...</p>
      </div>
    );
  }

  // 1. Dev Mode Bypass
  if (devBypassActive) {
    return (
      <>
        {children({ id: 'mock-dev-id-surendhar', username: ALLOWED_USER })}
      </>
    );
  }

  // 2. Not Authenticated
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 bg-white dark:bg-black">
        <div className="w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6 text-center border bg-white border-blue-200 dark:bg-blue-950/40 dark:border-blue-900 dark:shadow-black/80">
          <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
            <Lock className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Single-User Private Journal
            </h1>
            <p className="text-sm mt-2 text-slate-500 dark:text-blue-300/70">
              Authentication restricted strictly to authorized GitHub account{' '}
              <span className="font-semibold font-mono text-blue-600 dark:text-blue-400">@{ALLOWED_USER}</span>.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => signInWithGitHub()}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl font-medium text-sm transition-colors shadow-sm bg-blue-600 hover:bg-blue-700 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black"
            >
              <Github className="w-5 h-5" />
              Sign in with GitHub
            </button>
          </div>

          {/* Dev Mode Bypass */}
          <div className="pt-4 border-t border-blue-100 dark:border-blue-900/60 space-y-2">
            <button
              type="button"
              onClick={handleActivateDevBypass}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border transition-colors shadow-sm bg-blue-50/70 hover:bg-blue-100/70 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:border-blue-800 dark:text-blue-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Preview UI in local mode (bypass for development)
            </button>
            <p className="text-[11px] text-slate-400 dark:text-blue-300/60">
              Instant mock tasks, countdown widget, and 500ms animated checkboxes without OAuth.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated: Check GitHub username
  const userMetadata = session.user?.user_metadata || {};
  const currentGithubUsername: string =
    userMetadata.user_name || userMetadata.preferred_username || '';

  const isAuthorized =
    currentGithubUsername.toLowerCase() === ALLOWED_USER.toLowerCase();

  // 4. Unauthorized User Screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-black">
        <div className="w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-5 text-center border bg-white border-rose-200 dark:bg-zinc-950 dark:border-rose-500/20">
          <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">Access Denied</h2>
            <p className="text-sm mt-2 text-slate-600 dark:text-zinc-400">
              You are signed in as{' '}
              <span className="font-semibold font-mono text-rose-600 dark:text-rose-400">
                @{currentGithubUsername || 'unknown'}
              </span>
              . This application and database are strictly locked to{' '}
              <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                @{ALLOWED_USER}
              </span>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // 5. Authorized User
  return <>{children({ id: session.user.id, username: currentGithubUsername })}</>;
};

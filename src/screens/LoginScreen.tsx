import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import collage from '../assets/login-collage.jpg';
import { GoogleLogo } from '../components/icons';
import { env } from '../config/env';
import { errorMessage } from '../services/api';
import { loginWithGoogle, preloadGoogle } from '../services/auth';
import { Session } from '../types';

interface LoginScreenProps {
  onAuthenticated: (session: Session) => void;
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex w-full items-center gap-[10px]">
      <span className="h-px flex-1 bg-gray-200" />
      <span className="text-[14px] font-medium text-gray-500">{label}</span>
      <span className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

function PolicyLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href || undefined}
      target={href ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="text-gray-600 hover:text-black underline underline-offset-2 transition"
    >
      {children}
    </a>
  );
}

export function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const [error, setError] = useState('');
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    preloadGoogle().catch(() => undefined);
  }, []);

  const handleGoogle = async () => {
    if (googleBusy) return;
    setError('');
    setGoogleBusy(true);

    try {
      const session = await loginWithGoogle();
      if (session) {
        onAuthenticated(session);
      }
    } catch (err) {
      setError(errorMessage(err));
      setGoogleBusy(false);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col bg-white pb-[max(env(safe-area-inset-bottom),24px)] pt-[env(safe-area-inset-top)]">
      {/* Top Banner Collage */}
      <img
        src={collage}
        alt="RailQuick delivery essentials collage"
        className="block w-full select-none"
        draggable={false}
      />

      {/* Main Tagline */}
      <h1 className="mt-6 px-4 text-center font-heading text-[clamp(20px,6.2vw,24px)] font-semibold leading-8 text-black">
        India’s Train delivery app
      </h1>

      {/* Primary Authentication Content */}
      <div className="mt-8 px-[10%] flex flex-col items-center">
        <Divider label="Log in or sign up" />

        {/* Full-width Continue with Google Button */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleBusy}
          aria-label="Continue with Google"
          className="mt-6 flex h-[50px] w-full items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-white px-4 text-[16px] font-semibold text-gray-800 shadow-sm hover:bg-gray-50 active:scale-[0.99] transition duration-150 disabled:opacity-60 cursor-pointer"
        >
          {googleBusy ? (
            <span className="flex items-center gap-2.5 text-gray-600">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
              <span>Connecting to Google...</span>
            </span>
          ) : (
            <>
              <GoogleLogo className="h-5 w-5 shrink-0" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Contextual Error Message (Only shown if login action fails) */}
        {error && (
          <div className="mt-4 flex w-full items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-100 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}
      </div>

      {/* Footer Legal & Policy Links */}
      <p className="mt-auto px-6 pt-10 text-center text-[13px] leading-[20px] text-gray-500">
        By continuing, you agree to our
        <br />
        <span className="inline-flex flex-wrap justify-center gap-x-2">
          <PolicyLink href={env.termsUrl}>Terms of Service</PolicyLink>
          <span>•</span>
          <PolicyLink href={env.privacyUrl}>Privacy Policy</PolicyLink>
          <span>•</span>
          <PolicyLink href={env.contentPolicyUrl}>Content Policy</PolicyLink>
        </span>
      </p>
    </main>
  );
}

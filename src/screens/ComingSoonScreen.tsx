import { useState, useEffect } from 'react';
import {
  ChevronDown,
  Navigation2,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  User as UserIcon,
  ArrowLeft,
} from 'lucide-react';
import hero from '../assets/station-hero.jpg';
import { env } from '../config/env';
import { Session } from '../types';
import { useJourney } from '../state/journey';
import { navigate } from '../router';
import { submitTrainRequest, fetchMyTrainRequests } from '../services/trainRequests';
import { errorMessage } from '../services/api';

interface ComingSoonScreenProps {
  session: Session;
  onLogout?: () => void;
}

export function ComingSoonScreen({ session }: ComingSoonScreenProps) {
  const journey = useJourney();

  const [helpNotice, setHelpNotice] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Name prompt modal state (if user's name is not in profile)
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [nameInput, setNameInput] = useState(session.user?.name || '');
  const [phoneInput, setPhoneInput] = useState(session.user?.phone || '');
  const [dialogError, setDialogError] = useState('');

  // Check if current user already requested this train or area
  useEffect(() => {
    if (!session?.token) return;
    let cancelled = false;

    fetchMyTrainRequests(session.token)
      .then((records) => {
        if (cancelled) return;
        const exists = records.some((r) => {
          if (journey?.trainNumber) {
            return (
              r.trainNumber === journey.trainNumber &&
              (r.journeyDate === journey.journeyDate ||
                r.journeyDate === journey.journeyDateISO ||
                !journey.journeyDate)
            );
          }
          return r.trainNumber === '00000' || r.trainName.includes('Pocket A 2');
        });
        if (exists) {
          setHasRequested(true);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [session?.token, journey?.trainNumber, journey?.journeyDate, journey?.journeyDateISO]);

  const handleRequestClick = () => {
    setRequestError('');
    if (!session) {
      navigate('/login');
      return;
    }

    // Check if user has name in profile
    const currentName = session.user?.name?.trim();
    if (!currentName) {
      setNameInput('');
      setPhoneInput(session.user?.phone || '');
      setShowNameDialog(true);
      return;
    }

    executeSubmit(currentName, session.user?.phone);
  };

  const handleDialogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim();
    if (!cleanName) {
      setDialogError('Please enter your full name.');
      return;
    }
    setDialogError('');
    setShowNameDialog(false);
    executeSubmit(cleanName, phoneInput.trim());
  };

  const executeSubmit = async (userName: string, userPhone?: string) => {
    if (!session?.token) return;
    setIsSubmitting(true);
    setRequestError('');

    try {
      await submitTrainRequest(session.token, {
        journeyToken: journey?.journeyToken || undefined,
        trainNumber: journey?.trainNumber || '00000',
        trainName:
          journey?.trainName ||
          (journey?.boardingStation ? `Route: ${journey.boardingStation}` : 'Pocket A 2 - Station Area'),
        journeyDate: journey?.journeyDate || new Date().toISOString().slice(0, 10),
        areaName: 'Pocket A 2',
        userName,
        userPhone: userPhone || undefined,
      });

      setHasRequested(true);
      setShowSuccessPopup(true);
    } catch (err) {
      const msg = errorMessage(err);
      if (msg.toLowerCase().includes('already requested')) {
        setHasRequested(true);
        setShowSuccessPopup(true);
      } else {
        setRequestError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex h-dvh flex-col justify-between overflow-hidden bg-white select-none">
      {/* Station Background Art matching media_1792441196939.png */}
      <img
        src={hero}
        alt="RailQuick delivery partner on station platform. Coming soon to your station."
        className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
        draggable={false}
      />

      {/* Top Header matching media_1792441196939.png */}
      <header className="relative z-30 flex items-start justify-between px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
        <div className="flex items-start gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 shadow-sm text-gray-800 hover:bg-white active:scale-95 transition"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <h1 className="text-[20px] font-bold leading-6 tracking-tight text-[#111]">
              Unserviceable area
            </h1>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-1 flex items-center gap-1.5 text-[14px] font-semibold text-[#222] hover:opacity-80 transition"
            >
              {journey ? (
                <>
                  <span className="shrink-0 max-w-[140px] truncate">
                    {journey.trainNumber} - {journey.trainName}
                  </span>
                  <Navigation2
                    className="h-3.5 w-3.5 shrink-0 fill-[#222] stroke-[#222]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate max-w-[120px]">
                    {journey.boardingStation || 'New Delhi'}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                </>
              ) : (
                <>
                  <span className="shrink-0">Pocket A 2</span>
                  <Navigation2
                    className="h-3.5 w-3.5 shrink-0 fill-[#222] stroke-[#222]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate">A2/20, Po...</span>
                  <ChevronDown className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Profile avatar circle on top right - navigates directly to /account */}
        <button
          type="button"
          onClick={() => navigate('/account')}
          aria-label="User account"
          className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-[#7a7a80]/85 shadow-sm active:scale-95 hover:opacity-90 transition ml-3"
          title="My Account"
        >
          <User className="h-5 w-5 fill-white stroke-white" aria-hidden="true" />
        </button>
      </header>

      {/* Middle Spacer to keep artwork clear */}
      <div className="flex-1 pointer-events-none" />

      {/* Bottom Action Area matching media_1792441196939.png */}
      <div className="relative z-30 px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-6 bg-gradient-to-t from-white via-white/95 to-transparent">
        {requestError && (
          <div className="mb-3 flex items-start gap-2 rounded-2xl bg-amber-50 border border-amber-200/80 p-3 text-xs text-amber-900 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <span>{requestError}</span>
          </div>
        )}

        {hasRequested ? (
          <button
            type="button"
            disabled
            className="h-[50px] w-full rounded-2xl bg-emerald-700 text-[17px] font-semibold text-white shadow-md flex items-center justify-center gap-2 cursor-default"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>RailQuick Requested in your area</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleRequestClick}
            disabled={isSubmitting}
            className="h-[50px] w-full rounded-2xl bg-[#1AA454] text-[17px] font-semibold text-white shadow-lg shadow-emerald-700/20 active:scale-[0.99] hover:bg-[#16944b] transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 text-[15px]">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Submitting Request...
              </span>
            ) : (
              <span>Request RailQuick in your area</span>
            )}
          </button>
        )}

        {/* Footer Links matching screenshot */}
        <p className="mt-3 text-center text-[14px] text-[#222]">
          {env.supportUrl ? (
            <a href={env.supportUrl} target="_blank" rel="noopener noreferrer" className="underline">
              Need help?
            </a>
          ) : (
            <button type="button" onClick={() => setHelpNotice(true)} className="underline">
              Need help?
            </button>
          )}
          <span className="mx-2" aria-hidden="true">
            •
          </span>
          <a
            href={env.instagramUrl || 'https://www.instagram.com/'}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Get updates on Instagram
          </a>
        </p>

        {helpNotice && (
          <p role="status" className="mt-2 text-center text-[13px] text-gray-500">
            Support contact: support@railquick.in or Rail Madad 139.
          </p>
        )}
      </div>


      {/* Name Input Dialog (if user's name is not in profile) */}
      {showNameDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-[#1AA454]">
                  <UserIcon className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Your Contact Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNameDialog(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Please enter your name so our operations team can notify you when RailQuick expands service to{' '}
              {journey?.trainNumber ? `train #${journey.trainNumber}` : 'your route'}.
            </p>

            <form onSubmit={handleDialogSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold text-gray-900 focus:border-[#1AA454] focus:bg-white focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                  Mobile Number (Optional)
                </label>
                <div className="relative mt-1">
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 pl-10 text-sm font-semibold text-gray-900 focus:border-[#1AA454] focus:bg-white focus:outline-none transition"
                  />
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {dialogError && (
                <p className="text-xs font-semibold text-red-600">{dialogError}</p>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNameDialog(false)}
                  className="flex-1 rounded-2xl border border-gray-200 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-[#1AA454] py-3 text-xs font-bold text-white shadow-md hover:bg-[#16944b] transition"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmed Popup: Exact Text "Request Added" */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[32px] bg-white p-6 sm:p-7 text-center shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-[#1AA454] shadow-inner mb-4">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <h3 className="text-2xl font-black text-gray-950 tracking-tight">
              Request Added
            </h3>

            <p className="mt-2.5 text-xs sm:text-sm font-medium text-gray-600 leading-relaxed">
              We have successfully received your request for RailQuick
              {journey?.trainNumber ? (
                <>
                  {' '}on{' '}
                  <span className="font-bold text-gray-900">
                    {journey.trainName} (#{journey.trainNumber})
                  </span>
                </>
              ) : (
                ' in your area'
              )}
              . Our operations team monitors route demand to expand seat delivery.
            </p>

            {journey?.journeyDate && (
              <div className="mt-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 p-2.5 text-xs text-emerald-900 font-semibold">
                <span>Date: {journey.journeyDate}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowSuccessPopup(false)}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-2xl bg-[#1AA454] text-sm font-bold text-white shadow-md hover:bg-[#16944b] active:scale-[0.99] transition duration-150"
            >
              OK, Got it!
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

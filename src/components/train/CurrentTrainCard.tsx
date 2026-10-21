import { useState, useEffect } from 'react';
import { Train, Calendar, CheckCircle2, AlertCircle, Sparkles, X, User as UserIcon, Phone } from 'lucide-react';
import { getSession } from '../../services/auth';
import { submitTrainRequest, fetchMyTrainRequests } from '../../services/trainRequests';
import { errorMessage } from '../../services/api';

interface CurrentTrainCardProps {
  trainName: string;
  trainNumber: string;
  journeyDate: string;
  journeyToken?: string;
  sourceStation?: string;
  destinationStation?: string;
  className?: string;
}

export function CurrentTrainCard({
  trainName,
  trainNumber,
  journeyDate,
  journeyToken,
  sourceStation,
  destinationStation,
  className = '',
}: CurrentTrainCardProps) {
  const session = getSession();

  const [hasRequested, setHasRequested] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Form input state for name modal
  const [nameInput, setNameInput] = useState(session?.user?.name || '');
  const [phoneInput, setPhoneInput] = useState(session?.user?.phone || '');
  const [dialogError, setDialogError] = useState('');

  // Check if current user already requested this train
  useEffect(() => {
    if (!session?.token) return;
    let cancelled = false;
    setLoadingInitial(true);

    fetchMyTrainRequests(session.token)
      .then((records) => {
        if (cancelled) return;
        const exists = records.some(
          (r) => r.trainNumber === trainNumber && (r.journeyDate === journeyDate || !journeyDate),
        );
        if (exists) {
          setHasRequested(true);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoadingInitial(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.token, trainNumber, journeyDate]);

  const handleRequestClick = () => {
    setErrorMsg('');
    if (!session) {
      setErrorMsg('Please log in to submit a request.');
      return;
    }
    if (!journeyToken) {
      setErrorMsg('Train journey verification token is missing. Please search train again.');
      return;
    }

    // Check if user's name is present in auth/profile
    const currentName = session.user?.name?.trim();
    if (!currentName) {
      setNameInput('');
      setPhoneInput(session.user?.phone || '');
      setShowNameDialog(true);
      return;
    }

    // Submit with existing name
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
    if (!session?.token || !journeyToken) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await submitTrainRequest(session.token, {
        journeyToken,
        userName,
        userPhone: userPhone || undefined,
      });

      setHasRequested(true);
      setShowSuccessPopup(true);
    } catch (err) {
      const msg = errorMessage(err);
      if (msg.toLowerCase().includes('already requested')) {
        setHasRequested(true);
        setErrorMsg("You've already requested RailQuick on this train for this journey.");
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className={`rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 p-5 sm:p-6 shadow-[0_4px_20px_rgba(16,185,129,0.08)] ${className}`}
      >
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Train className="h-4 w-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
              Your Current Train
            </span>
          </div>
          <span className="rounded-xl border border-emerald-200/80 bg-emerald-100/70 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-800">
            #{trainNumber}
          </span>
        </div>

        {/* Train Name & Details */}
        <div className="mt-4">
          <h2 className="text-xl sm:text-2xl font-black text-gray-950 leading-tight">
            {trainName}
          </h2>

          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-600">
            <div className="flex items-center gap-1.5 rounded-lg bg-gray-100/90 px-2.5 py-1">
              <Calendar className="h-3.5 w-3.5 text-emerald-700" />
              <span>{journeyDate}</span>
            </div>
            {sourceStation && destinationStation && (
              <div className="rounded-lg bg-gray-100/90 px-2.5 py-1 text-gray-700">
                <span>{sourceStation}</span>
                <span className="mx-1.5 text-gray-400">→</span>
                <span>{destinationStation}</span>
              </div>
            )}
          </div>

          <p className="mt-3.5 text-xs sm:text-sm font-medium text-gray-600 leading-relaxed">
            Your journey, your essentials. Request RailQuick in Your Train.
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 border border-amber-200/60 p-3 text-xs text-amber-900">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button / Status */}
        <div className="mt-5">
          {hasRequested ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-100/90 border border-emerald-200/80 py-3.5 px-4 text-sm font-bold text-emerald-900">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              <span>RailQuick Requested for this Train</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRequestClick}
              disabled={isSubmitting || loadingInitial}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#138848] text-base font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-[#0f6f3b] active:scale-[0.99] transition duration-150 disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Submitting Request...
                </span>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-emerald-200" />
                  <span>Request RailQuick in Your Train</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Name Input Dialog (if user's name is not in profile) */}
      {showNameDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
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
              Please enter your name so our train operations team can update you when service opens on #{trainNumber}.
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
                  className="mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm font-semibold text-gray-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition"
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
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 pl-10 text-sm font-semibold text-gray-900 focus:border-emerald-600 focus:bg-white focus:outline-none transition"
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
                  className="flex-1 rounded-2xl bg-[#138848] py-3 text-xs font-bold text-white shadow-md hover:bg-[#0f6f3b] transition"
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-[#138848] shadow-inner mb-4">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <h3 className="text-2xl font-black text-gray-950 tracking-tight">
              Request Added
            </h3>

            <p className="mt-2.5 text-xs sm:text-sm font-medium text-gray-600 leading-relaxed">
              We have successfully received your request for RailQuick on{' '}
              <span className="font-bold text-gray-900">
                {trainName} (#{trainNumber})
              </span>
              . Our operations team monitors route demand to expand seat delivery.
            </p>

            <div className="mt-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 p-3 text-xs text-emerald-900 font-semibold">
              <span>Date: {journeyDate}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowSuccessPopup(false)}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-2xl bg-[#138848] text-sm font-bold text-white shadow-md hover:bg-[#0f6f3b] active:scale-[0.99] transition duration-150"
            >
              OK, Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Phone,
  Mail,
  ShieldCheck,
  Train,
  Bell,
  Clock,
  CheckCircle2,
  HelpCircle,
  MessageCircle,
  ExternalLink,
  LogOut,
  Utensils,
  Sparkles,
  Search,
  Check
} from 'lucide-react';
import { Session, TrainRequestRecord } from '../types';
import { useJourney } from '../state/journey';
import { navigate } from '../router';
import { fetchMyTrainRequests } from '../services/trainRequests';

interface AccountScreenProps {
  session: Session;
  onLogout: () => void;
}

export function AccountScreen({ session, onLogout }: AccountScreenProps) {
  const journey = useJourney();
  const [requests, setRequests] = useState<TrainRequestRecord[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Preference states (persisted in localStorage for traveler delight)
  const [mealPref, setMealPref] = useState<'veg' | 'nonveg' | 'jain'>(() => {
    return (localStorage.getItem('rq_pref_meal') as 'veg' | 'nonveg' | 'jain') || 'veg';
  });
  const [whatsappAlerts, setWhatsappAlerts] = useState<boolean>(() => {
    return localStorage.getItem('rq_pref_wa') !== 'false';
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!session?.token) {
      setLoadingRequests(false);
      return;
    }

    let active = true;
    fetchMyTrainRequests(session.token)
      .then((data) => {
        if (active) {
          setRequests(data);
          setLoadingRequests(false);
        }
      })
      .catch(() => {
        if (active) setLoadingRequests(false);
      });

    return () => {
      active = false;
    };
  }, [session?.token]);

  const handleMealChange = (pref: 'veg' | 'nonveg' | 'jain') => {
    setMealPref(pref);
    localStorage.setItem('rq_pref_meal', pref);
  };

  const handleWaToggle = () => {
    const next = !whatsappAlerts;
    setWhatsappAlerts(next);
    localStorage.setItem('rq_pref_wa', String(next));
  };

  const userInitial = (session.user?.name || session.user?.email || 'T')
    .charAt(0)
    .toUpperCase();

  return (
    <main className="min-h-dvh bg-slate-50 pb-16 flex flex-col antialiased select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200/70 bg-white/95 px-5 py-4 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <h1 className="text-base font-extrabold tracking-tight text-gray-900">
          My Account
        </h1>

        <button
          type="button"
          onClick={() => window.open('https://wa.me/919999999999', '_blank')}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
          title="Need Help?"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </header>

      <div className="px-5 py-5 space-y-5 max-w-lg mx-auto w-full">
        {/* Profile Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 p-6 text-white shadow-xl shadow-emerald-950/15">
          {/* Subtle decorative glow */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl" />

          <div className="relative flex items-center gap-4">
            {/* Avatar circle */}
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-200 text-2xl font-black text-emerald-950 shadow-inner ring-4 ring-white/20">
              {userInitial}
              <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-emerald-900">
                <Check className="h-2.5 w-2.5 text-white stroke-[3]" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white truncate">
                  {session.user?.name || 'Rail Traveler'}
                </h2>
              </div>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-200">
                <Mail className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                <span className="truncate">{session.user?.email || 'Authenticated Passenger'}</span>
              </div>

              {session.user?.phone && (
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-200">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                  <span>{session.user.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Verified RailQuick Member</span>
            </div>
            <span className="rounded-full bg-white/15 px-3 py-1 font-semibold text-emerald-100">
              Seat Delivery Active
            </span>
          </div>
        </div>

        {/* Current Active Journey Card (if available) */}
        {journey && journey.trainNumber && (
          <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Train className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Active Travel Route
                </span>
              </div>
              <span className="rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                #{journey.trainNumber}
              </span>
            </div>

            <div className="mt-3">
              <h3 className="text-base font-black text-gray-900">{journey.trainName}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {journey.boardingStation || 'Origin'} ➔ {journey.destinationStation || 'Destination'}
                {journey.journeyDate && ` • ${journey.journeyDate}`}
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => navigate('/journey')}
                className="flex-1 rounded-2xl bg-gray-100 py-2.5 text-xs font-bold text-gray-800 hover:bg-gray-200 transition text-center"
              >
                Track Live Status
              </button>
              <button
                type="button"
                onClick={() => navigate('/coming-soon')}
                className="flex-1 rounded-2xl bg-[#138848] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0f6f3b] transition text-center"
              >
                Order / Request
              </button>
            </div>
          </div>
        )}

        {/* My Train Requests & Notifications Section */}
        <div className="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-[#1AA454]">
                <Bell className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">
                  Requested Trains & Alerts
                </h3>
                <p className="text-[11px] text-gray-400">
                  Routes you'll be notified for
                </p>
              </div>
            </div>

            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-600">
              {requests.length}
            </span>
          </div>

          <div className="mt-3">
            {loadingRequests ? (
              <div className="py-6 text-center">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                <p className="mt-2 text-xs text-gray-400">Loading your train requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 mb-2">
                  <Train className="h-6 w-6" />
                </div>
                <p className="text-xs font-bold text-gray-700">No route requests yet</p>
                <p className="mt-1 text-[11px] text-gray-400 max-w-xs mx-auto">
                  When you search an unserviceable train and request RailQuick, it will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                >
                  <Search className="h-3.5 w-3.5" />
                  Search Train
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-start justify-between rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 transition hover:bg-gray-50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          #{req.trainNumber}
                        </span>
                        <span className="text-xs font-bold text-gray-800 truncate max-w-[170px]">
                          {req.trainName}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>Date: {req.journeyDate || 'Standard Route'}</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" />
                      Requested
                    </span>
                  </div>
                ))}

                <div className="mt-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 p-3 text-[11px] text-emerald-900 flex items-start gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>
                    Our team reviews high-demand routes weekly. You will receive an instant notification when seat delivery goes live!
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Travel & Dietary Preferences */}
        <div className="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Utensils className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-gray-900">Food & Diet Preference</h3>
              <p className="text-[11px] text-gray-400">Quick-filters your train pantry items</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleMealChange('veg')}
              className={`rounded-2xl border py-2.5 text-xs font-bold transition flex flex-col items-center gap-1 ${
                mealPref === 'veg'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20'
                  : 'border-gray-200 bg-gray-50/50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>Pure Veg 🥬</span>
              <span className="text-[10px] text-gray-400 font-normal">100% Vegetarian</span>
            </button>

            <button
              type="button"
              onClick={() => handleMealChange('nonveg')}
              className={`rounded-2xl border py-2.5 text-xs font-bold transition flex flex-col items-center gap-1 ${
                mealPref === 'nonveg'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20'
                  : 'border-gray-200 bg-gray-50/50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>Non-Veg 🍗</span>
              <span className="text-[10px] text-gray-400 font-normal">Chicken / Egg</span>
            </button>

            <button
              type="button"
              onClick={() => handleMealChange('jain')}
              className={`rounded-2xl border py-2.5 text-xs font-bold transition flex flex-col items-center gap-1 ${
                mealPref === 'jain'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20'
                  : 'border-gray-200 bg-gray-50/50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>Jain 🌿</span>
              <span className="text-[10px] text-gray-400 font-normal">No Onion/Garlic</span>
            </button>
          </div>

          {/* WhatsApp Delivery Updates Toggle */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-gray-800">WhatsApp Travel Alerts</p>
                <p className="text-[10px] text-gray-400">Order tracking and train arrival pings</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleWaToggle}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                whatsappAlerts ? 'bg-[#1AA454]' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={whatsappAlerts}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  whatsappAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Helplines & Support */}
        <div className="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-extrabold text-gray-900">Passenger Help & Quick Links</h3>

          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl bg-gray-50/80 p-3.5 hover:bg-emerald-50/50 transition group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 group-hover:scale-105 transition">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-gray-800">24x7 WhatsApp Passenger Care</p>
                <p className="text-[11px] text-gray-400">Instant help with order or seat delivery</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-emerald-700 transition" />
          </a>

          <a
            href="tel:139"
            className="flex items-center justify-between rounded-2xl bg-gray-50/80 p-3.5 hover:bg-gray-100 transition group"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 group-hover:scale-105 transition">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-gray-800">Railway Helpline 139</p>
                <p className="text-[11px] text-gray-400">Security, medical emergency & train inquiry</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-700 transition" />
          </a>
        </div>

        {/* Logout Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 text-xs font-bold text-gray-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition"
          >
            Log Out of Account
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => setShowLogoutConfirm(false)}
            aria-hidden="true"
          />

          <div className="w-full max-w-xs rounded-[28px] bg-white p-6 text-center shadow-2xl animate-in zoom-in-95 duration-150 border border-gray-100">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-3">
              <LogOut className="h-7 w-7" />
            </div>

            <h3 className="text-base font-bold text-gray-900">Sign Out?</h3>
            <p className="mt-1.5 text-xs text-gray-500">
              Are you sure you want to sign out of your RailQuick account?
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-2xl border border-gray-200 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 rounded-2xl bg-red-600 py-3 text-xs font-bold text-white shadow-md hover:bg-red-700 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

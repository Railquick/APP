import React, { useState } from 'react';
import { X, CheckCircle, MapPin, Train, BellRing, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../services/soundEffects';

interface RequestAreaModalProps {
  isOpen: boolean;
  stationName: string;
  onClose: () => void;
}

export const RequestAreaModal: React.FC<RequestAreaModalProps> = ({
  isOpen,
  stationName,
  onClose,
}) => {
  const [stationInput, setStationInput] = useState(stationName || 'Pocket A 2, Platform A2');
  const [trainNumber, setTrainNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [requestCount, setRequestCount] = useState(1482);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.success();

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#008b3e', '#e23744', '#facc15', '#38bdf8'],
      });
    } catch {
      // Ignore if confetti not supported
    }

    setSubmitted(true);
    setRequestCount((c) => c + 1);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 active:scale-90 transition-transform rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-6 flex flex-col items-center text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-[#008b3e] rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Request #RQ-9428 Registered
            </div>
            <h3 className="text-xl font-black text-slate-900">Thank You!</h3>
            <p className="text-sm text-slate-600 mt-2 px-2">
              We've added your vote for <strong className="text-slate-900">{stationInput}</strong>.
              You're voter <span className="font-bold text-[#008b3e]">#{requestCount}</span> for this station!
            </p>
            <p className="text-xs text-slate-500 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              📲 You'll get an instant WhatsApp alert the moment RailQuick service goes live here with a <strong>₹100 first-delivery voucher</strong>!
            </p>
            <button
              onClick={handleReset}
              className="mt-6 w-full bg-[#008b3e] text-white font-bold py-3.5 rounded-xl active:scale-98 transition-all shadow-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#008b3e] flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Request RailQuick</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Help us prioritize your station for 10-minute train deliveries!
            </p>

            {/* Station / Area Name */}
            <div className="mb-3">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Station / Area Name
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={stationInput}
                  onChange={(e) => setStationInput(e.target.value)}
                  placeholder="e.g. Platform A2, Pocket A 2"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#008b3e] focus:bg-white"
                />
              </div>
            </div>

            {/* Train / PNR (Optional) */}
            <div className="mb-3">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Your Frequent Train / Route (Optional)
              </label>
              <div className="relative">
                <Train className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={trainNumber}
                  onChange={(e) => setTrainNumber(e.target.value)}
                  placeholder="e.g. 12952 Rajdhani / Vande Bharat"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-[#008b3e] focus:bg-white"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="mb-3">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Mobile Number for launch update
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-600 text-xs font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#008b3e] focus:bg-white"
                />
              </div>
            </div>

            {/* WhatsApp notification toggle */}
            <label className="flex items-center gap-2.5 p-2 bg-emerald-50/60 rounded-xl cursor-pointer mb-5">
              <input
                type="checkbox"
                checked={notifyWhatsapp}
                onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                className="w-4 h-4 text-[#008b3e] rounded focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-emerald-950 font-medium">
                Get notified on WhatsApp when service launches
              </span>
            </label>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full bg-[#008b3e] hover:bg-[#007a36] text-white font-bold py-3.5 rounded-xl shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <BellRing className="w-4 h-4" />
              <span>Submit Station Request</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

import { useState } from 'react';
import { X, Calculator, Info, CheckCircle2 } from 'lucide-react';

interface RefundCalculatorModalProps {
  open: boolean;
  onClose: () => void;
}

type TicketStatus = 'CNF' | 'RAC_WL';
type TravelClass = '1A_EC' | '2A_FC' | '3A_3E_CC' | 'SL' | '2S';
type CancellationTiming = 'gt48' | '48_to_12' | '12_to_4' | 'lt4';

export function RefundCalculatorModal({ open, onClose }: RefundCalculatorModalProps) {
  const [fare, setFare] = useState<number>(1200);
  const [ticketStatus, setTicketStatus] = useState<TicketStatus>('CNF');
  const [travelClass, setTravelClass] = useState<TravelClass>('3A_3E_CC');
  const [timing, setTiming] = useState<CancellationTiming>('gt48');

  if (!open) return null;

  // Indian Railways Official Cancellation Rules logic
  let cancellationCharge = 0;
  let ruleExplanation = '';

  const flatCharges: Record<TravelClass, number> = {
    '1A_EC': 240,
    '2A_FC': 200,
    '3A_3E_CC': 180,
    SL: 120,
    '2S': 60,
  };

  const minCharge = flatCharges[travelClass];

  if (ticketStatus === 'RAC_WL') {
    if (timing === 'lt4') {
      cancellationCharge = fare;
      ruleExplanation = 'No refund is admissible for RAC/Waitlisted tickets if not cancelled up to 30 min before departure.';
    } else {
      cancellationCharge = 60; // Standard clerkage charge
      ruleExplanation = 'Flat clerkage charge of ₹60 per passenger is deducted for RAC / Waitlist cancellations.';
    }
  } else {
    // Confirmed Ticket
    if (timing === 'gt48') {
      cancellationCharge = minCharge;
      ruleExplanation = `More than 48 hrs before departure: Flat deduction of ₹${minCharge} per passenger for ${travelClass.replace('_', '/')}.`;
    } else if (timing === '48_to_12') {
      const pctCharge = Math.round(fare * 0.25);
      cancellationCharge = Math.max(pctCharge, minCharge);
      ruleExplanation = `Between 48 hrs and 12 hrs: 25% of fare (₹${pctCharge}), subject to minimum flat fee of ₹${minCharge}.`;
    } else if (timing === '12_to_4') {
      const pctCharge = Math.round(fare * 0.5);
      cancellationCharge = Math.max(pctCharge, minCharge);
      ruleExplanation = `Between 12 hrs and 4 hrs: 50% of fare (₹${pctCharge}), subject to minimum flat fee of ₹${minCharge}.`;
    } else {
      cancellationCharge = fare;
      ruleExplanation = 'Less than 4 hours before departure or after chart preparation: No refund is admissible on Confirmed tickets.';
    }
  }

  // Ensure cancellation charge doesn't exceed total fare
  cancellationCharge = Math.min(cancellationCharge, fare);
  const refundAmount = Math.max(0, fare - cancellationCharge);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[500px] rounded-t-3xl sm:rounded-3xl bg-white max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">IRCTC Refund Calculator</h2>
              <p className="text-xs text-gray-500">Official Indian Railways cancellation rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Ticket Fare input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Ticket Fare (₹)
            </label>
            <div className="mt-1.5 flex items-center rounded-xl border border-gray-200 px-4 py-2.5 focus-within:border-emerald-600">
              <span className="text-gray-500 font-semibold mr-2">₹</span>
              <input
                type="number"
                min="60"
                max="20000"
                value={fare}
                onChange={(e) => setFare(Math.max(0, Number(e.target.value)))}
                className="w-full text-base font-bold text-gray-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Ticket Booking Status
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTicketStatus('CNF')}
                className={`rounded-xl py-2.5 px-3 text-xs font-bold border transition ${
                  ticketStatus === 'CNF'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Confirmed (CNF)
              </button>
              <button
                type="button"
                onClick={() => setTicketStatus('RAC_WL')}
                className={`rounded-xl py-2.5 px-3 text-xs font-bold border transition ${
                  ticketStatus === 'RAC_WL'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                RAC / Waiting List (WL)
              </button>
            </div>
          </div>

          {/* Travel Class */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Travel Class
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2 text-xs font-semibold">
              {[
                { id: '1A_EC', label: '1A / EC' },
                { id: '2A_FC', label: '2A / FC' },
                { id: '3A_3E_CC', label: '3A / 3E / CC' },
                { id: 'SL', label: 'Sleeper (SL)' },
                { id: '2S', label: '2nd Sitting (2S)' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setTravelClass(c.id as TravelClass)}
                  className={`rounded-xl py-2 px-2 border transition ${
                    travelClass === c.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cancellation Timing */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              When are you cancelling?
            </label>
            <div className="mt-1.5 space-y-2 text-xs">
              {[
                { id: 'gt48', label: 'More than 48 hours before train departure' },
                { id: '48_to_12', label: 'Between 48 hours and 12 hours before departure' },
                { id: '12_to_4', label: 'Between 12 hours and 4 hours before departure' },
                { id: 'lt4', label: 'Less than 4 hours or after chart is prepared' },
              ].map((t) => (
                <label
                  key={t.id}
                  onClick={() => setTiming(t.id as CancellationTiming)}
                  className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                    timing === t.id
                      ? 'border-emerald-600 bg-emerald-50/50 text-gray-900 font-medium'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="timing"
                    checked={timing === t.id}
                    onChange={() => setTiming(t.id as CancellationTiming)}
                    className="accent-emerald-600"
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Result Card */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">Estimated Refund</span>
              <span className="text-2xl font-black text-white">₹{refundAmount}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-emerald-200">
              <span>Cancellation Deductions:</span>
              <span className="font-semibold text-red-300">- ₹{cancellationCharge}</span>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-white/10 p-2.5 text-[11px] text-emerald-100 leading-relaxed">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{ruleExplanation}</span>
            </div>
          </div>

          {/* Legal / Indicative Note */}
          <div className="flex items-start gap-2 text-gray-400 text-[11px] leading-relaxed">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-gray-400" />
            <p>
              This calculation is indicative based on Gazette cancellation rules of Indian Railways. Actual refund may vary based on convenience fees, agent charges, and dynamic pricing rules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

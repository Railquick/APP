import { X, PhoneCall, ShieldCheck, ExternalLink } from 'lucide-react';

interface HelplineModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelplineModal({ open, onClose }: HelplineModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[500px] rounded-t-3xl sm:rounded-3xl bg-white max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Railway Helpline</h2>
              <p className="text-xs text-gray-500">Official 24/7 Rail Madad assistance</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Main 139 Call Card */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold">
                  All-in-One Railway Helpline
                </span>
                <h3 className="text-3xl font-black tracking-tight mt-1">139</h3>
                <p className="text-xs text-emerald-100 mt-1">
                  Medical emergency, security, coach cleaning, vigilance & inquiry.
                </p>
              </div>
              <a
                href="tel:139"
                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-emerald-800 shadow-md hover:bg-emerald-50 active:scale-95 transition"
              >
                <PhoneCall className="h-4 w-4 text-emerald-600 fill-emerald-600" />
                Call 139
              </a>
            </div>
          </div>

          {/* Service Directory */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dialing Shortcuts on 139</h4>

            <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 bg-gray-50/50">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 font-bold text-sm">
                1
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-900">Security & Medical Emergency</h5>
                <p className="text-[11px] text-gray-500">RPF assistance for crimes, safety or acute onboard medical need</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 bg-gray-50/50">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 font-bold text-sm">
                2
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-900">PNR Status & Train Live Enquiry</h5>
                <p className="text-[11px] text-gray-500">Interactive voice response for arrival, departure & berth updates</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 bg-gray-50/50">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 font-bold text-sm">
                3
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-900">Catering & Coach Cleanliness</h5>
                <p className="text-[11px] text-gray-500">On-board housekeeping service (OBHS) and food quality complaints</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 bg-gray-50/50">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 font-bold text-sm">
                9
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-900">Speak to Customer Executive</h5>
                <p className="text-[11px] text-gray-500">Direct human agent for unresolved journey grievances</p>
              </div>
            </div>
          </div>

          {/* Online Web Portal link */}
          <a
            href="https://railmadad.indianrailways.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-gray-200 p-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Rail Madad Online Web Grievance Portal</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
          </a>
        </div>
      </div>
    </div>
  );
}

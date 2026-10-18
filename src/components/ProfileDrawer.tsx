import React from 'react';
import { X, User, HelpCircle, ShieldCheck, LogOut, ChevronRight, Train } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface ProfileDrawerProps {
  isOpen: boolean;
  phoneNumber: string;
  onClose: () => void;
  onLogout: () => void;
  onOpenHelp: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  phoneNumber,
  onClose,
  onLogout,
  onOpenHelp,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 active:scale-90 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
          <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-emerald-500/20 flex items-center justify-center text-slate-600">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Passenger Account</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              +91 {phoneNumber || '98765 43210'}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-[#008b3e] text-[10px] font-bold rounded-full">
              RailQuick VIP Passenger
            </span>
          </div>
        </div>

        {/* Menu items */}
        <div className="py-3 space-y-1">
          <button
            onClick={() => {
              sounds.tap();
              onOpenHelp();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 active:bg-slate-100 text-left transition-colors"
          >
            <div className="flex items-center gap-3 text-slate-700">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold">24x7 Train Support</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sounds.tap()}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 active:bg-slate-100 text-left transition-colors"
          >
            <div className="flex items-center gap-3 text-slate-700">
              {/* Instagram SVG icon */}
              <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
              <span className="text-sm font-semibold">Get Updates on Instagram</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </a>

          <button
            onClick={() => sounds.tap()}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 active:bg-slate-100 text-left transition-colors"
          >
            <div className="flex items-center gap-3 text-slate-700">
              <Train className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold">Upcoming Train Journeys</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => sounds.tap()}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 active:bg-slate-100 text-left transition-colors"
          >
            <div className="flex items-center gap-3 text-slate-700">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-semibold">Privacy & Security</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Logout */}
        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={() => {
              sounds.tap();
              onLogout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 text-rose-600 hover:bg-rose-50 rounded-2xl text-sm font-bold active:scale-98 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Switch Account / Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

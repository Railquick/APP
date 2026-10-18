import React, { useState } from 'react';
import { User, ChevronDown, MapPin } from 'lucide-react';
import { StationIllustration } from '../components/StationIllustration';
import { RequestAreaModal } from '../components/RequestAreaModal';
import { StationPickerModal } from '../components/StationPickerModal';
import { ProfileDrawer } from '../components/ProfileDrawer';
import { Station } from '../types';
import { sounds } from '../services/soundEffects';

interface ComingSoonScreenProps {
  currentStation: Station;
  phoneNumber: string;
  onSelectStation: (station: Station) => void;
  onLogout: () => void;
}

export const ComingSoonScreen: React.FC<ComingSoonScreenProps> = ({
  currentStation,
  phoneNumber,
  onSelectStation,
  onLogout,
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <div className="relative w-full h-full min-h-[720px] bg-white flex flex-col justify-between overflow-x-hidden">
      {/* 1. Top Bar (Exact Match to Mockup Screen 3) */}
      <div className="w-full px-5 pt-3 pb-2 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
        {/* Left: Location & Unserviceable Area info */}
        <div
          onClick={() => {
            sounds.tap();
            setShowPickerModal(true);
          }}
          className="flex flex-col cursor-pointer group select-none"
        >
          <span className="text-[15px] font-black text-slate-900 tracking-tight leading-none">
            {currentStation.isServiceable ? 'Deliver to Station' : 'Unserviceable area'}
          </span>
          <div className="flex items-center gap-1 mt-1 text-slate-600 text-xs font-semibold group-hover:text-emerald-700 transition-colors">
            <span>{currentStation.pocketName || currentStation.name}</span>
            <span className="text-slate-400">📍</span>
            <span className="truncate max-w-[140px] text-slate-500 font-normal">
              {currentStation.addressSnippet}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-900 transition-transform group-hover:translate-y-0.5" />
          </div>
        </div>

        {/* Right: Circular Profile Icon */}
        <button
          onClick={() => {
            sounds.tap();
            setShowProfileDrawer(true);
          }}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center text-slate-600 border border-slate-200/80 shadow-2xs"
          title="Account Profile"
        >
          <User className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      {/* 2. Main Hero Section (Station Artwork & Bold Headline) */}
      <div className="flex-1 flex flex-col items-center justify-start relative px-4 pt-1">
        {/* Bold Headline matching Mockup Screen 3 */}
        <div className="w-full text-center pt-2 pb-1 z-20">
          <div className="text-[26px] sm:text-[30px] font-black text-slate-500 uppercase tracking-wider leading-none">
            COMING SOON
          </div>
          <div className="flex items-center justify-center gap-2 my-1">
            <span className="text-xl">🗺️</span>
            <span className="text-sm font-extrabold text-slate-700 uppercase tracking-widest">
              TO YOUR
            </span>
            <span className="text-xl">👜</span>
          </div>
          <div className="text-[34px] sm:text-[40px] font-black text-[#008b3e] uppercase tracking-tight leading-none">
            STATION
          </div>
        </div>

        {/* Station Graphic Artwork */}
        <div className="w-full max-w-[380px] -mt-2">
          <StationIllustration />
        </div>
      </div>

      {/* 3. Bottom CTA Section (Exact Match to Mockup Screen 3) */}
      <div className="w-full px-5 pb-6 pt-2 bg-gradient-to-t from-white via-white to-transparent z-20">
        {/* Primary Green CTA Button */}
        <button
          onClick={() => {
            sounds.tap();
            setShowRequestModal(true);
          }}
          className="w-full bg-[#008b3e] hover:bg-[#007a36] active:bg-[#00682e] text-white font-extrabold text-[15px] py-4 rounded-2xl shadow-lg shadow-emerald-700/20 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <span>Request RailQuick in your area</span>
        </button>

        {/* Footer Sub-links */}
        <div className="flex items-center justify-center gap-3 mt-3 text-xs font-semibold text-slate-600">
          <button
            onClick={() => {
              sounds.tap();
              setShowHelpModal(true);
            }}
            className="hover:text-slate-900 underline underline-offset-2 transition-colors"
          >
            Need help?
          </button>
          <span className="text-slate-400">•</span>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sounds.tap()}
            className="hover:text-slate-900 underline underline-offset-2 transition-colors flex items-center gap-1"
          >
            <span>Get updates on Instagram</span>
          </a>
        </div>
      </div>

      {/* Modals & Drawers */}
      <RequestAreaModal
        isOpen={showRequestModal}
        stationName={`${currentStation.name} (${currentStation.pocketName || 'Platform A2'})`}
        onClose={() => setShowRequestModal(false)}
      />

      <StationPickerModal
        isOpen={showPickerModal}
        currentStation={currentStation}
        onSelectStation={onSelectStation}
        onClose={() => setShowPickerModal(false)}
      />

      <ProfileDrawer
        isOpen={showProfileDrawer}
        phoneNumber={phoneNumber}
        onClose={() => setShowProfileDrawer(false)}
        onLogout={onLogout}
        onOpenHelp={() => {
          setShowProfileDrawer(false);
          setShowHelpModal(true);
        }}
      />

      {/* Help Modal */}
      {showHelpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-slate-900 mb-1">RailQuick Train Support</h3>
            <p className="text-xs text-slate-500 mb-4">We are available 24x7 for all Indian Railway passengers.</p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-900">WhatsApp Live Chat</div>
                  <div className="text-emerald-700">+91 91122 33445</div>
                </div>
                <span className="text-emerald-600 font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                  Chat Now
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Toll-Free Rail Helpline</div>
                  <div className="text-slate-600">1800-RAIL-QUICK</div>
                </div>
                <span className="text-slate-700 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  Call
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-5 w-full bg-slate-900 text-white font-bold py-3 rounded-xl text-xs active:scale-98"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { ChevronDown, MapPin, Train } from 'lucide-react';
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

  const trainLabel = currentStation.trainName || currentStation.name || '12952 Rajdhani Express';

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#A5B9D2] via-[#BACBDD] to-white flex items-center justify-center overflow-hidden select-none relative">
      {/* 100% Fit for Mobile Phone Screen */}
      <div className="relative aspect-[1125/2400] w-full h-full max-w-full max-h-full flex items-center justify-center">
        {/* Full-Bleed Design Artwork */}
        <img
          src="/extracted_designs/mockup_screen_3.png"
          alt="RailQuick Coming Soon Station"
          className="w-full h-full object-contain select-none pointer-events-none"
        />

        {/* --- Dynamic Train Header Overlay (Showing Train Name as requested) --- */}
        <div
          onClick={() => {
            sounds.tap();
            setShowPickerModal(true);
          }}
          className="absolute top-[2.4%] left-[4.2%] w-[72%] h-[7%] flex flex-col justify-center px-2 rounded-2xl bg-[#A5B9D2]/95 backdrop-blur-xs cursor-pointer active:opacity-85 transition-opacity"
          title="Click to change Train / Station"
        >
          <span className="text-[13px] sm:text-[14px] font-black text-slate-900 tracking-tight leading-tight">
            {currentStation.isServiceable ? 'Serviceable Train ⚡' : 'Unserviceable train'}
          </span>
          <div className="flex items-center gap-1 mt-0.5 text-slate-700 text-[10px] sm:text-[11px] font-bold">
            <span className="truncate max-w-[155px] sm:max-w-[180px] text-slate-900">
              {trainLabel}
            </span>
            <span className="text-slate-500">📍</span>
            <span className="truncate max-w-[65px] text-slate-600 font-normal">
              {currentStation.addressSnippet || 'Coach B3...'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-700 shrink-0" />
          </div>
        </div>

        {/* --- Interactive Hotspots --- */}

        {/* 2. Header: Profile Icon */}
        <button
          type="button"
          onClick={() => {
            sounds.tap();
            setShowProfileDrawer(true);
          }}
          className="absolute top-[2.2%] right-[4%] w-[13%] h-[7%] rounded-full active:bg-black/15 transition-colors cursor-pointer focus:outline-none"
          title="Passenger Account Profile"
        >
          <span className="sr-only">Profile</span>
        </button>

        {/* 3. Primary Green CTA: "Request RailQuick in your area" */}
        <button
          type="button"
          onClick={() => {
            sounds.tap();
            setShowRequestModal(true);
          }}
          className="absolute bottom-[7.8%] left-[5%] w-[90%] h-[7%] rounded-2xl cursor-pointer active:scale-[0.97] active:brightness-95 transition-all focus:outline-none"
          title="Request RailQuick for your train"
        >
          <span className="sr-only">Request RailQuick for your train</span>
        </button>

        {/* 4. Footer: "Need help?" */}
        <button
          type="button"
          onClick={() => {
            sounds.tap();
            setShowHelpModal(true);
          }}
          className="absolute bottom-[2.6%] left-[18%] w-[27%] h-[4%] cursor-pointer active:opacity-60 transition-opacity focus:outline-none"
          title="Need help?"
        >
          <span className="sr-only">Need help?</span>
        </button>

        {/* 5. Footer: "Get updates on Instagram" */}
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sounds.tap()}
          className="absolute bottom-[2.6%] right-[15%] w-[48%] h-[4%] cursor-pointer active:opacity-60 transition-opacity focus:outline-none"
          title="Get updates on Instagram"
        >
          <span className="sr-only">Get updates on Instagram</span>
        </a>
      </div>

      {/* Interactive Bottom Sheet Modals */}
      <RequestAreaModal
        isOpen={showRequestModal}
        stationName={`${trainLabel} (${currentStation.addressSnippet || 'Coach B3'})`}
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
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
                <span className="text-emerald-700 font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
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
              className="mt-5 w-full bg-[#008b3e] text-white font-bold py-3.5 rounded-xl text-xs active:scale-98 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

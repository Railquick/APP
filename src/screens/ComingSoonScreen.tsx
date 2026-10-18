import React, { useState } from 'react';
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
    <div className="relative w-full h-full min-h-[720px] bg-[#E7EEF5] flex flex-col justify-between overflow-hidden select-none">
      {/* 1. Exact High-Resolution Screen 3 Artwork from Design Mockup */}
      <div className="relative w-full h-full flex flex-col">
        <img
          src="/extracted_designs/mockup_screen_3.png"
          alt="RailQuick Coming Soon Station"
          className="w-full h-full object-cover object-top select-none pointer-events-none"
        />

        {/* 2. Interactive Hotspots over the Exact Design Elements */}

        {/* Hotspot A: Top Location & Unserviceable Area Header (Click to switch stations) */}
        <button
          type="button"
          onClick={() => {
            sounds.tap();
            setShowPickerModal(true);
          }}
          className="absolute top-[3.2%] left-[4.5%] w-[68%] h-[6.5%] rounded-2xl active:bg-black/10 transition-colors cursor-pointer group flex items-start justify-start text-left focus:outline-none"
          title="Click to select or change Station"
        >
          {/* Subtle live indicator pulse badge to show it is interactive */}
          <span className="sr-only">Select Station</span>
        </button>

        {/* Hotspot B: Top-Right Profile Avatar (Click to open profile/support) */}
        <button
          type="button"
          onClick={() => {
            sounds.tap();
            setShowProfileDrawer(true);
          }}
          className="absolute top-[3.2%] right-[5%] w-[12%] h-[6.5%] rounded-full active:bg-black/15 transition-colors cursor-pointer focus:outline-none"
          title="Passenger Profile & Support"
        >
          <span className="sr-only">Profile</span>
        </button>

        {/* Hotspot C: Green "Request RailQuick in your area" Primary Button */}
        <button
          type="button"
          onClick={() => {
            sounds.tap();
            setShowRequestModal(true);
          }}
          className="absolute bottom-[8.5%] left-[6%] w-[88%] h-[6.8%] rounded-2xl cursor-pointer active:scale-[0.98] active:brightness-95 transition-all shadow-md focus:outline-none"
          title="Request RailQuick in your area"
        >
          <span className="sr-only">Request RailQuick in your area</span>
        </button>

        {/* Hotspot D: "Need help?" Link */}
        <button
          type="button"
          onClick={() => {
            sounds.tap();
            setShowHelpModal(true);
          }}
          className="absolute bottom-[3.2%] left-[20%] w-[25%] h-[3.5%] cursor-pointer active:opacity-60 transition-opacity focus:outline-none"
          title="24x7 Train Delivery Help"
        >
          <span className="sr-only">Need help?</span>
        </button>

        {/* Hotspot E: "Get updates on Instagram" Link */}
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sounds.tap()}
          className="absolute bottom-[3.2%] right-[16%] w-[48%] h-[3.5%] cursor-pointer active:opacity-60 transition-opacity focus:outline-none"
          title="Get updates on Instagram"
        >
          <span className="sr-only">Get updates on Instagram</span>
        </a>
      </div>

      {/* 3. Interactive Modals & Drawers */}
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

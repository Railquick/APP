import React, { useState } from 'react';
import { X, Search, Train, Check, Sparkles, MapPin } from 'lucide-react';
import { Station, TrainRoute } from '../types';
import { INITIAL_TRAINS, INITIAL_STATIONS } from '../services/mockData';
import { sounds } from '../services/soundEffects';

interface StationPickerModalProps {
  isOpen: boolean;
  currentStation: Station;
  onSelectStation: (station: Station) => void;
  onClose: () => void;
}

export const StationPickerModal: React.FC<StationPickerModalProps> = ({
  isOpen,
  currentStation,
  onSelectStation,
  onClose,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredTrains = INITIAL_TRAINS.filter(
    (t) =>
      t.trainName.toLowerCase().includes(search.toLowerCase()) ||
      t.trainNumber.includes(search) ||
      t.route.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectTrain = (train: TrainRoute) => {
    sounds.tap();
    const stationFromTrain: Station = {
      id: train.id,
      name: `${train.trainNumber} ${train.trainName}`,
      code: train.trainNumber,
      city: train.route,
      isServiceable: train.isServiceable,
      pocketName: `${train.trainNumber} ${train.trainName}`,
      trainName: `${train.trainNumber} ${train.trainName}`,
      trainNumber: train.trainNumber,
      addressSnippet: `Coach ${train.coach || 'B3'}, Berth ${train.berth || '24'}...`,
      expectedLaunchDate: train.expectedLaunchDate || 'Coming Soon',
    };
    onSelectStation(stationFromTrain);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl relative animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Select Your Train</h3>
            <p className="text-xs text-slate-500">Search train name, number or route</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 active:scale-90 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="my-3 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Train: 12952, Rajdhani, Vande Bharat..."
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#008b3e] focus:bg-white"
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
            🟢 Active Train Delivery
          </span>
          <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
            🟡 Coming Soon
          </span>
        </div>

        {/* Trains List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 no-scrollbar">
          {filteredTrains.map((train) => {
            const isSelected =
              currentStation.trainNumber === train.trainNumber ||
              currentStation.name.includes(train.trainNumber);

            return (
              <div
                key={train.id}
                onClick={() => handleSelectTrain(train)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-[#008b3e] bg-emerald-50/50 shadow-xs'
                    : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      train.isServiceable
                        ? 'bg-emerald-100 text-[#008b3e]'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <Train className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-slate-900">
                        {train.trainNumber} {train.trainName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      {train.route}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      {train.isServiceable ? (
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                          ⚡ 10-Min Delivery to Seat
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                          ⏳ {train.expectedLaunchDate || 'Coming Soon'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-[#008b3e] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

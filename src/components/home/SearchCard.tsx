import { useState, useEffect, useRef } from 'react';
import { Search, Train, Ticket, Calendar, AlertCircle, ArrowRight, Compass } from 'lucide-react';
import { fetchPnrStatus, searchTrains, trackTrainLive } from '../../services/railway';
import { saveJourney } from '../../state/journey';
import { journeyFromPnr, journeyFromLive } from '../../services/journey';
import { navigate } from '../../router';
import { errorMessage } from '../../services/api';
import { TrainSearchResultItem } from '../../types';
import {
  formatDDMMYYYY,
  addDays,
  liveTrackingRange,
} from '../../../shared/dates';

type Tab = 'pnr' | 'live';

export function SearchCard() {
  const [tab, setTab] = useState<Tab>('pnr');

  // PNR state - strictly starts empty, no demo PNR
  const [pnr, setPnr] = useState('');
  const [pnrError, setPnrError] = useState('');
  const [pnrLoading, setPnrLoading] = useState(false);

  // Live Train state - strictly starts empty
  const [trainQuery, setTrainQuery] = useState('');
  const [selectedTrain, setSelectedTrain] = useState<TrainSearchResultItem | null>(null);
  const [suggestions, setSuggestions] = useState<TrainSearchResultItem[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const range = liveTrackingRange();
  const today = formatDDMMYYYY(range.max);
  const [selectedDate, setSelectedDate] = useState(today);
  const [liveError, setLiveError] = useState('');
  const [liveLoading, setLiveLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Date picker options: today down to 5 days ago (IST)
  const dateOptions = Array.from({ length: 6 }).map((_, i) => {
    const d = addDays(range.max, -i);
    const formatted = formatDDMMYYYY(d);
    let label = formatted;
    if (i === 0) label = `Today (${formatted.slice(0, 5)})`;
    else if (i === 1) label = `Yesterday (${formatted.slice(0, 5)})`;
    return { value: formatted, label };
  });

  // Autocomplete train search
  useEffect(() => {
    if (tab !== 'live') return;
    const q = trainQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (selectedTrain && (selectedTrain.trainNo === q || selectedTrain.trainName === q)) {
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        const results = await searchTrains(q);
        setSuggestions(results.slice(0, 8));
        setShowDropdown(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [trainQuery, tab, selectedTrain]);

  // Click outside listener for autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Submit PNR
  const handlePnrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pnrLoading) return;
    const clean = pnr.trim();

    if (!clean) {
      setPnrError('Please enter your 10-digit PNR number.');
      return;
    }
    if (!/^\d{10}$/.test(clean)) {
      setPnrError('PNR number must be exactly 10 numeric digits.');
      return;
    }

    setPnrError('');
    setPnrLoading(true);

    try {
      const data = await fetchPnrStatus(clean);
      const build = journeyFromPnr(data);

      if (build.ok) {
        saveJourney(build.journey);
        navigate('/coming-soon');
      } else {
        // If server provided assessment with a journeyToken, save it so user can see their current train and request service
        if (data.assessment?.journeyToken && data.train?.number && data.train?.name) {
          saveJourney({
            type: 'pnr',
            pnrData: data,
            trainNumber: data.train.number,
            trainName: data.train.name,
            journeyDate: data.journey?.dateOfJourney || 'Today',
            journeyDateISO: data.assessment.journeyDate || '',
            journeyStatus: data.assessment.journeyStatus,
            journeyToken: data.assessment.journeyToken,
            deliveryStations: data.assessment.deliveryStations || [],
            boardingStation: data.journey?.boardingPoint?.name || data.journey?.source?.name,
            destinationStation: data.journey?.destination?.name,
            defaultCoach: data.passengers?.[0]?.current?.coach || data.passengers?.[0]?.booking?.coach,
            defaultSeat: data.passengers?.[0]?.current?.berthNo !== undefined ? String(data.passengers[0].current.berthNo) : undefined,
            passengerName: data.passengers?.[0]?.serialNumber,
            savedAt: Date.now(),
          });
          navigate('/coming-soon');
        } else {
          setPnrError(build.message || 'Unable to verify PNR journey details.');
        }
      }
    } catch (err) {
      setPnrError(errorMessage(err));
    } finally {
      setPnrLoading(false);
    }
  };

  // 2. Submit Live Train Track
  const handleLiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (liveLoading) return;

    const trainNo = selectedTrain?.trainNo || trainQuery.trim();
    if (!trainNo) {
      setLiveError('Please search and select a train number or name.');
      return;
    }
    if (!/^\d{5}$/.test(trainNo)) {
      setLiveError('Please enter or select a valid 5-digit train number.');
      return;
    }

    setLiveError('');
    setLiveLoading(true);

    try {
      const data = await trackTrainLive(trainNo, selectedDate);
      const build = journeyFromLive(data);

      if (build.ok) {
        saveJourney(build.journey);
        navigate('/journey');
      } else {
        // If server provided assessment with a journeyToken, save it so user can see their current train and request service
        if (data.assessment?.journeyToken && data.trainNo && data.trainName) {
          const first = data.timeline?.[0];
          const last = data.timeline?.[data.timeline.length - 1];
          saveJourney({
            type: 'live',
            liveData: data,
            trainNumber: data.trainNo,
            trainName: data.trainName,
            journeyDate: data.date || selectedDate,
            journeyDateISO: data.assessment.journeyDate || '',
            journeyStatus: data.assessment.journeyStatus,
            journeyToken: data.assessment.journeyToken,
            deliveryStations: data.assessment.deliveryStations || [],
            boardingStation: first?.stationName || first?.stationCode,
            destinationStation: last?.stationName || last?.stationCode,
            savedAt: Date.now(),
          });
          navigate('/journey');
        } else {
          setLiveError(build.message || 'Unable to track live train status for this date.');
        }
      }
    } catch (err) {
      setLiveError(errorMessage(err));
    } finally {
      setLiveLoading(false);
    }
  };

  return (
    <div className="relative mx-4 sm:mx-6 z-20 rounded-[32px] bg-white p-5 sm:p-6 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.08)] border border-gray-100">
      {/* Tab Switcher - Exactly matching screenshot styling */}
      <div className="flex rounded-2xl bg-[#f3f4f6] p-1.5 gap-1.5">
        <button
          type="button"
          onClick={() => {
            setTab('pnr');
            setPnrError('');
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold transition-all duration-200 ${
            tab === 'pnr'
              ? 'bg-[#138848] text-white shadow-sm'
              : 'bg-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Ticket className={`h-4 w-4 ${tab === 'pnr' ? 'text-white' : 'text-gray-500'}`} />
          <span>PNR Status</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab('live');
            setLiveError('');
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold transition-all duration-200 ${
            tab === 'live'
              ? 'bg-[#138848] text-white shadow-sm'
              : 'bg-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Train className={`h-4 w-4 ${tab === 'live' ? 'text-white' : 'text-gray-500'}`} />
          <span>Live Status</span>
        </button>
      </div>

      {/* Tab 1: PNR Form */}
      {tab === 'pnr' && (
        <form onSubmit={handlePnrSubmit} className="mt-5 space-y-4">
          <div>
            <div className="relative flex items-center rounded-2xl border border-gray-200 bg-white px-3.5 py-3.5 focus-within:border-[#138848] focus-within:ring-2 focus-within:ring-emerald-100 transition shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-emerald-50 text-emerald-700 mr-3">
                <Ticket className="h-4 w-4" />
              </div>
              <input
                id="pnr-input"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={pnr}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPnr(val);
                  setPnrError('');
                }}
                placeholder="Enter 10-digit PNR No."
                className="w-full text-base sm:text-lg font-bold tracking-wider text-gray-900 placeholder:font-semibold placeholder:tracking-normal placeholder:text-gray-300 focus:outline-none bg-transparent"
              />

              {pnr.length > 0 && (
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      pnr.length === 10
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {pnr.length}/10
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPnr('');
                      setPnrError('');
                    }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200"
                    aria-label="Clear PNR"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-gray-400">
              <span>Printed on top-left of ticket or SMS confirmation.</span>
            </div>
          </div>

          {pnrError && (
            <div className="flex items-start gap-2 rounded-2xl bg-red-50 border border-red-100 p-3 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{pnrError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={pnrLoading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#138848] to-[#16a34a] text-base font-bold text-white shadow-lg shadow-emerald-700/25 hover:brightness-105 active:scale-[0.99] transition duration-150 disabled:opacity-70"
          >
            {pnrLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Verifying PNR with RailKit...
              </span>
            ) : (
              <>
                <span>Continue to Order</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Tab 2: Live Status Form */}
      {tab === 'live' && (
        <form onSubmit={handleLiveSubmit} className="mt-5 space-y-4">
          <div ref={dropdownRef} className="relative">
            <div className="relative flex items-center rounded-2xl border border-gray-200 bg-white px-3.5 py-3.5 focus-within:border-[#138848] focus-within:ring-2 focus-within:ring-emerald-100 transition shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-emerald-50 text-emerald-700 mr-3">
                <Train className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={trainQuery}
                onChange={(e) => {
                  setTrainQuery(e.target.value);
                  setSelectedTrain(null);
                  setLiveError('');
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowDropdown(true);
                }}
                placeholder="Train No. or Name (e.g. 12301)"
                className="w-full text-base sm:text-lg font-bold text-gray-900 placeholder:font-semibold placeholder:text-gray-300 focus:outline-none bg-transparent"
              />

              {trainQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setTrainQuery('');
                    setSelectedTrain(null);
                    setShowDropdown(false);
                    setLiveError('');
                  }}
                  className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200"
                  aria-label="Clear train search"
                >
                  ✕
                </button>
              )}

              {suggestionsLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              ) : (
                <Search className="h-4 w-4 text-gray-400" />
              )}
            </div>

            {/* Suggestions dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 max-h-60 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Matching Indian Railways Trains
                </p>
                {suggestions.map((train) => (
                  <button
                    key={train.trainNo}
                    type="button"
                    onClick={() => {
                      setSelectedTrain(train);
                      setTrainQuery(`${train.trainNo} - ${train.trainName}`);
                      setShowDropdown(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-emerald-50 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                        #{train.trainNo}
                      </span>
                      <span className="text-xs font-bold text-gray-800 group-hover:text-emerald-900 transition">
                        {train.trainName}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 group-hover:text-emerald-700">
                      Select ➔
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Date Pills Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Journey Departure Date
              </span>
              <span className="text-[11px] font-semibold text-emerald-700">
                Selected: {selectedDate}
              </span>
            </div>

            {/* Date Pills for Fast Selection */}
            <div className="grid grid-cols-3 gap-2">
              {dateOptions.slice(0, 3).map((opt, idx) => {
                const isSelected = selectedDate === opt.value;
                const title = idx === 0 ? 'Today' : idx === 1 ? 'Yesterday' : '2 Days Ago';
                const sub = opt.value.slice(0, 5); // DD-MM
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedDate(opt.value)}
                    className={`rounded-2xl border py-2.5 px-2 text-center transition ${
                      isSelected
                        ? 'border-[#138848] bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-gray-200 bg-gray-50/60 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <p className="text-xs font-bold">{title}</p>
                    <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-700 font-semibold' : 'text-gray-400'}`}>
                      {sub}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Full Calendar Dropdown for additional dates */}
            <div className="relative mt-2">
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-xs font-semibold text-gray-700 focus:border-[#138848] focus:bg-white focus:outline-none transition pl-9"
              >
                {dateOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Schedule: {opt.label}
                  </option>
                ))}
              </select>
              <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
            </div>
          </div>

          {liveError && (
            <div className="flex items-start gap-2 rounded-2xl bg-red-50 border border-red-100 p-3 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{liveError}</span>
            </div>
          )}

          {/* Find Train Route button matching media_1792438306779.png with compass icon */}
          <button
            type="submit"
            disabled={liveLoading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#138848] to-[#16a34a] text-base font-bold text-white shadow-lg shadow-emerald-700/25 hover:brightness-105 active:scale-[0.99] transition duration-150 disabled:opacity-70"
          >
            {liveLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Finding Train Route...
              </span>
            ) : (
              <>
                <span>Find Train Route</span>
                <Compass className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
import { useState } from 'react';
import { useJourney, saveJourney } from '../state/journey';
import { navigate } from '../router';
import {
  ArrowLeft,
  Ticket,
  Calendar,
  RotateCw,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Train,
} from 'lucide-react';
import { trackTrainLive } from '../services/railway';
import { journeyFromLive } from '../services/journey';
import { errorMessage } from '../services/api';

export function JourneyScreen() {
  const journey = useJourney();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');

  // If no journey in state, provide redirect action
  if (!journey) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center p-6 text-center bg-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-700 mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">No Verified Journey Found</h1>
        <p className="mt-2 text-xs text-gray-500 max-w-xs">
          Please search your 10-digit PNR or track a live train from the home screen first to verify your seat details.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-6 flex items-center gap-2 rounded-2xl bg-[#138848] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#0f6f3b]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home Search
        </button>
      </main>
    );
  }

  const isPnr = journey.type === 'pnr';
  const pnr = journey.pnrData;
  const live = journey.liveData;

  // Live status refresh handler
  const handleRefreshLive = async () => {
    if (!live || !live.trainNo || !live.date || refreshing) return;
    setRefreshing(true);
    setRefreshError('');
    try {
      const fresh = await trackTrainLive(live.trainNo, live.date);
      const build = journeyFromLive(fresh);
      if (build.ok) {
        saveJourney(build.journey);
      } else {
        saveJourney({
          ...journey,
          liveData: fresh,
        });
      }
    } catch (err) {
      setRefreshError(errorMessage(err));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <main className="min-h-dvh bg-gray-50/70 pb-32">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 px-5 py-3.5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#138848]">
            {isPnr ? 'Verified PNR Journey' : 'Live Train Tracking'}
          </span>
          <h1 className="text-sm font-bold text-gray-900 leading-none mt-0.5">
            {journey.trainNumber} • {journey.trainName}
          </h1>
        </div>

        {!isPnr ? (
          <button
            type="button"
            onClick={handleRefreshLive}
            disabled={refreshing}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            title="Refresh live status"
          >
            <RotateCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </header>

      <div className="px-5 py-5 space-y-4 max-w-lg mx-auto">
        {/* Train Overview Banner */}

        {/* Train Overview Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-800 to-emerald-950 p-5 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <span className="rounded-xl bg-white/15 px-3 py-1 font-mono text-xs font-bold text-emerald-200">
              #{journey.trainNumber}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-200">
              <Calendar className="h-3.5 w-3.5" />
              <span>{journey.journeyDate}</span>
            </div>
          </div>

          <h2 className="mt-3 text-xl font-black text-white">{journey.trainName}</h2>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/10 p-3 text-xs">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">From</p>
              <p className="text-sm font-bold text-white mt-0.5 truncate max-w-[130px]">{journey.boardingStation || 'Origin'}</p>
            </div>
            <div className="flex flex-col items-center px-2">
              <div className="h-0.5 w-12 bg-emerald-400/50 relative">
                <div className="absolute -top-1 right-0 h-2.5 w-2.5 rounded-full bg-emerald-300" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">To</p>
              <p className="text-sm font-bold text-white mt-0.5 truncate max-w-[130px]">{journey.destinationStation || 'Destination'}</p>
            </div>
          </div>

          {isPnr && pnr?.chartStatus && (
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{pnr.chartStatus}</span>
            </div>
          )}
        </div>

        {/* PNR DETAILS VIEW */}
        {isPnr && pnr && (
          <div className="space-y-4">
            {/* Passenger List */}
            <div className="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-gray-900">Passenger & Berth Details</h3>
                </div>
                <span className="font-mono text-xs font-bold text-gray-500">PNR: {pnr.pnr}</span>
              </div>

              <div className="mt-3 divide-y divide-gray-100">
                {pnr.passengers.length === 0 ? (
                  <p className="py-3 text-xs text-gray-500">No passenger berth details returned by railway API.</p>
                ) : (
                  pnr.passengers.map((p, idx) => {
                    const c = p.current || p.booking;
                    return (
                      <div key={idx} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-xs font-bold text-gray-800">{p.serialNumber || `Passenger ${idx + 1}`}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                            {c?.coach && (
                              <span className="font-semibold text-gray-800">
                                Coach {c.coach}
                              </span>
                            )}
                            {c?.berthNo !== undefined && (
                              <span>
                                Berth {c.berthNo} {c.berthCode ? `(${c.berthCode})` : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span
                            className={`rounded-xl px-2.5 py-1 text-xs font-bold ${
                              c?.status === 'CNF'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c?.status === 'RAC'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {c?.status || 'CNF'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Journey Meta */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Class & Quota</p>
                <p className="mt-1 text-sm font-bold text-gray-800">
                  {pnr.journey.class || 'N/A'} • {pnr.journey.quota || 'General'}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Distance</p>
                <p className="mt-1 text-sm font-bold text-gray-800">
                  {pnr.journey.distance ? `${pnr.journey.distance} km` : 'Scheduled Route'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* LIVE TRACKING VIEW */}
        {!isPnr && live && (() => {
          const total = live.timeline?.length || 0;
          const passedCount = live.timeline?.filter((s) => s.status === 'passed').length || 0;
          const currentStation = live.timeline?.find((s) => s.status === 'current');
          const nextStation = live.timeline?.find((s) => s.status !== 'passed' && s.status !== 'current');
          const progressPct =
            total > 1
              ? Math.min(100, Math.max(5, Math.round(((passedCount + (currentStation ? 0.5 : 0)) / (total - 1)) * 100)))
              : total === 1 && passedCount === 1
              ? 100
              : 25;

          return (
            <div className="space-y-4">
              {refreshError && (
                <div className="rounded-2xl bg-red-50 p-3 text-xs text-red-700">
                  {refreshError}
                </div>
              )}

              {/* Journey Progress Percentage Card */}
              <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <Train className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Live Journey Progress
                      </h3>
                      <p className="text-sm font-black text-gray-900">
                        {passedCount} of {total} Stoppages Crossed
                      </p>
                    </div>
                  </div>

                  <span className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-3.5 py-1.5 text-xs font-black text-white shadow-sm shadow-emerald-600/20">
                    {progressPct}% Completed
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="space-y-1.5">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#138848] transition-all duration-500 shadow-sm"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-400 font-semibold px-0.5">
                    <span>{journey.boardingStation || 'Origin'}</span>
                    <span>{journey.destinationStation || 'Destination'}</span>
                  </div>
                </div>

                {/* Current Train Location & Status Note */}
                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-600" />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                        Train Current Position
                      </span>
                    </div>

                    {live.lastUpdate && (
                      <span className="text-[10px] text-emerald-700 font-medium">
                        Updated: {live.lastUpdate}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-black text-emerald-950 leading-snug">
                    {live.statusNote ||
                      (currentStation
                        ? `Currently at ${currentStation.stationName || currentStation.stationCode}`
                        : 'Running on schedule towards destination')}
                  </p>
                </div>

                {/* Next Upcoming Station Card */}
                {nextStation && (
                  <div className="flex items-center justify-between rounded-2xl bg-gray-50/80 border border-gray-100 p-3.5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Next Upcoming Station
                      </p>
                      <p className="text-xs font-bold text-gray-900 mt-0.5">
                        {nextStation.stationName || nextStation.stationCode}
                        {nextStation.platform && (
                          <span className="ml-1.5 rounded bg-gray-200/80 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700">
                            PF {nextStation.platform}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Arrival Time
                      </p>
                      <p className="text-xs font-bold text-emerald-700 mt-0.5">
                        {nextStation.arrival?.actual || nextStation.arrival?.scheduled || '--'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Route Timeline Stoppages */}
              <div className="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-gray-900">
                    Route Stoppages & Timings
                  </h3>
                  <span className="text-xs text-gray-400 font-semibold">
                    {total} Stations
                  </span>
                </div>

                {live.timeline.length === 0 ? (
                  <p className="text-xs text-gray-400">Route timeline stations unavailable for this schedule.</p>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                    {live.timeline.map((station, idx) => {
                      const isPassed = station.status === 'passed';
                      const isCurrent = station.status === 'current';

                      return (
                        <div key={idx} className="relative">
                          <div
                            className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 ${
                              isCurrent
                                ? 'border-emerald-600 bg-emerald-600 ring-4 ring-emerald-100'
                                : isPassed
                                ? 'border-gray-400 bg-gray-400'
                                : 'border-emerald-600 bg-white'
                            }`}
                          />

                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold ${isPassed ? 'text-gray-500' : 'text-gray-900'}`}>
                                  {station.stationName || station.stationCode}
                                </span>
                                {station.platform && (
                                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
                                    PF {station.platform}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400">
                                Arr: {station.arrival?.actual || station.arrival?.scheduled || '--'} • Dep:{' '}
                                {station.departure?.actual || station.departure?.scheduled || '--'}
                              </p>
                            </div>

                            {station.arrival?.delay && (
                              <span className="text-[11px] font-semibold text-amber-600">
                                {station.arrival.delay}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Sticky Bottom Order Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 p-4 backdrop-blur-md">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-emerald-800">Direct Seat Delivery</p>
            <p className="text-xs font-extrabold text-gray-900 truncate">
              #{journey.trainNumber} • {journey.trainName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/coming-soon')}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#138848] to-[#16a34a] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/25 hover:brightness-105 active:scale-[0.99] transition duration-150"
          >
            <span>Order Now</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
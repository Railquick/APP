import { useState } from 'react';
import { X, Search, MapPin, Clock, AlertCircle } from 'lucide-react';
import { fetchStationLive } from '../../services/railway';
import { StationLiveTrain } from '../../types';
import { errorMessage } from '../../services/api';

interface PlatformModalProps {
  open: boolean;
  onClose: () => void;
}

export function PlatformModal({ open, onClose }: PlatformModalProps) {
  const [stationCode, setStationCode] = useState('NDLS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trains, setTrains] = useState<StationLiveTrain[]>([]);
  const [summary, setSummary] = useState('');
  const [searched, setSearched] = useState(false);

  if (!open) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = stationCode.trim().toUpperCase();
    if (!code) {
      setError('Please enter a station code (e.g. NDLS, HWH, BCT).');
      return;
    }
    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const data = await fetchStationLive(code, 4);
      setSummary(data.summary || `Live platform and train board for ${code}`);
      setTrains(data.trains || []);
    } catch (err) {
      setError(errorMessage(err));
      setTrains([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[500px] rounded-t-3xl sm:rounded-3xl bg-white max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Platform Locator</h2>
              <p className="text-xs text-gray-500">Live platform numbers & station board</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={stationCode}
                onChange={(e) => setStationCode(e.target.value.toUpperCase())}
                placeholder="Station code (e.g. NDLS, BCT, CNB)"
                maxLength={5}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold uppercase text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-70"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Find
            </button>
          </form>

          {/* Quick chips */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto text-xs text-gray-500">
            <span>Quick:</span>
            {['NDLS', 'NZM', 'DLI', 'BCT', 'HWH', 'CSMT'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setStationCode(code);
                }}
                className={`rounded-lg px-2.5 py-1 font-medium transition ${
                  stationCode === code ? 'bg-emerald-100 text-emerald-800' : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {summary && <p className="text-xs font-medium text-gray-500">{summary}</p>}

          {!searched && !loading && (
            <div className="py-10 text-center text-gray-400">
              <MapPin className="mx-auto h-8 w-8 mb-2 stroke-1" />
              <p className="text-sm">Enter a station code above to look up platform assignments.</p>
            </div>
          )}

          {searched && !loading && trains.length === 0 && !error && (
            <div className="py-10 text-center text-gray-500">
              <p className="text-sm font-medium">No live trains found at {stationCode} in the next 4 hours.</p>
              <p className="text-xs text-gray-400 mt-1">Platform information will appear once assigned by railway dispatch.</p>
            </div>
          )}

          {trains.map((train, idx) => (
            <div
              key={`${train.trainNo}-${idx}`}
              className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm hover:border-emerald-200 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-xs font-bold text-emerald-800">
                      {train.trainNo}
                    </span>
                    <h3 className="font-semibold text-sm text-gray-900">{train.trainName}</h3>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {train.sourceName} → {train.destName}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-flex flex-col items-center justify-center rounded-xl bg-emerald-50 px-3 py-1 text-emerald-800 border border-emerald-200/60">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Platform</span>
                    <span className="text-base font-bold leading-tight">
                      {train.platform ? train.platform : 'TBD'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <span>
                    Arrival: <strong className="text-gray-700">{train.arrival?.actual || train.arrival?.scheduled || '--'}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>
                    Dep: <strong className="text-gray-700">{train.departure?.actual || train.departure?.scheduled || '--'}</strong>
                  </span>
                  {typeof train.arrival?.delay === 'number' && train.arrival.delay > 0 ? (
                    <span className="ml-1 text-amber-600 font-semibold">({train.arrival.delay}m late)</span>
                  ) : (
                    <span className="ml-1 text-emerald-600 font-semibold">On time</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

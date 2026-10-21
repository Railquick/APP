import { useState } from 'react';
import { X, Calendar, Search, AlertCircle, Train } from 'lucide-react';
import { fetchStationTimetable } from '../../services/railway';
import { errorMessage } from '../../services/api';
import { todayIST, formatDDMMYYYY, addDays } from '../../../shared/dates';

interface TimetableModalProps {
  open: boolean;
  onClose: () => void;
}

export function TimetableModal({ open, onClose }: TimetableModalProps) {
  const [stationCode, setStationCode] = useState('NDLS');
  const today = formatDDMMYYYY(todayIST());
  const [selectedDate, setSelectedDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trains, setTrains] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  if (!open) return null;

  const yesterday = formatDDMMYYYY(addDays(todayIST(), -1));
  const tomorrow = formatDDMMYYYY(addDays(todayIST(), 1));

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = stationCode.trim().toUpperCase();
    if (!code) {
      setError('Please enter a station code.');
      return;
    }
    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const data = await fetchStationTimetable(code, selectedDate);
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.trains)
        ? data.trains
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setTrains(list);
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Station Timetable</h2>
              <p className="text-xs text-gray-500">Scheduled trains crossing station</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Inputs */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={stationCode}
              onChange={(e) => setStationCode(e.target.value.toUpperCase())}
              placeholder="Station code (e.g. NDLS)"
              maxLength={5}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold uppercase text-gray-900 placeholder:text-gray-400 focus:border-purple-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-70"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search
            </button>
          </form>

          {/* Date Picker (Yesterday, Today, Tomorrow per RailKit docs) */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500 font-medium">Date:</span>
            {[
              { id: yesterday, label: 'Yesterday' },
              { id: today, label: 'Today' },
              { id: tomorrow, label: 'Tomorrow' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDate(d.id)}
                className={`rounded-lg px-2.5 py-1 font-medium transition ${
                  selectedDate === d.id
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {!searched && !loading && (
            <div className="py-10 text-center text-gray-400">
              <Train className="mx-auto h-8 w-8 mb-2 stroke-1" />
              <p className="text-sm">Search station code above to view the full train timetable.</p>
            </div>
          )}

          {searched && !loading && trains.length === 0 && !error && (
            <div className="py-10 text-center text-gray-500">
              <p className="text-sm font-medium">No scheduled trains found for {stationCode} on {selectedDate}.</p>
            </div>
          )}

          {trains.map((train, idx) => {
            const no = train.train_no || train.trainNo || train.number;
            const name = train.train_name || train.trainName || train.name;
            const arr = train.arrival || train.arrTime || train.arr || '--';
            const dep = train.departure || train.depTime || train.dep || '--';
            const halt = train.halt || train.haltTime || '--';

            return (
              <div
                key={`${no}-${idx}`}
                className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm hover:border-purple-200 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-purple-100 px-1.5 py-0.5 font-mono text-xs font-bold text-purple-800">
                      {no}
                    </span>
                    <h3 className="font-semibold text-sm text-gray-900">{name}</h3>
                  </div>
                  {halt !== '--' && (
                    <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      Halt: {halt}
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-600">
                  <span>
                    Arr: <strong className="text-gray-900">{arr}</strong>
                  </span>
                  <span>
                    Dep: <strong className="text-gray-900">{dep}</strong>
                  </span>
                  {train.platform && (
                    <span className="font-semibold text-emerald-700">PF {train.platform}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

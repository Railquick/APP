import { FormEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { errorMessage, NotConfiguredError } from '../services/api';
import { submitAreaRequest } from '../services/area';
import { isValidIndianMobile } from '../services/auth';

interface RequestAreaSheetProps {
  open: boolean;
  token: string;
  /** Pre-filled area name; only pass real backend data here. */
  defaultArea: string;
  onClose: () => void;
}

type Status = 'idle' | 'submitting' | 'saved' | 'error' | 'not-configured';

export function RequestAreaSheet({ open, token, defaultArea, onClose }: RequestAreaSheetProps) {
  const [area, setArea] = useState(defaultArea);
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ area?: string; phone?: string }>({});
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (open) {
      setArea(defaultArea);
      setStatus('idle');
      setErrors({});
      setMessage('');
    }
  }, [open, defaultArea]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'submitting') return;

    const next: { area?: string; phone?: string } = {};
    if (area.trim().length < 2) next.area = 'Enter your station or area name.';
    if (!isValidIndianMobile(phone)) next.phone = 'Enter a valid 10-digit Indian mobile number.';
    setErrors(next);
    if (next.area || next.phone) return;

    setStatus('submitting');
    try {
      await submitAreaRequest(token, { area: area.trim(), phone });
      setStatus('saved');
    } catch (err) {
      if (err instanceof NotConfiguredError) {
        setStatus('not-configured');
        setMessage('Your request was not saved: the RailQuick backend is not connected yet.');
      } else {
        setStatus('error');
        setMessage(errorMessage(err));
      }
    }
  };

  const inputClass = (invalid: boolean) =>
    `h-[46px] w-full rounded-[14px] border bg-white px-4 text-[16px] text-black outline-none placeholder:text-gray-400 ${
      invalid ? 'border-red-500' : 'border-gray-300 focus:border-gray-500'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-white px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-5"
      >
        <div className="flex items-start justify-between">
          <h2 id="request-title" className="font-heading text-[20px] font-semibold text-black">
            Request RailQuick
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 p-2 text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {status === 'saved' ? (
          <div className="py-6 text-center">
            <p className="text-[16px] font-semibold text-black">Request received</p>
            <p className="mt-1 text-[14px] text-gray-500">We’ll let you know when RailQuick reaches your station.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 h-[46px] w-full rounded-xl bg-[#1AA454] text-[17px] font-semibold text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-4">
            <label className="block text-[13px] font-medium text-gray-600" htmlFor="request-area">
              Station / area
            </label>
            <input
              id="request-area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Platform A2"
              autoComplete="off"
              className={`mt-1 ${inputClass(Boolean(errors.area))}`}
            />
            {errors.area && <p className="mt-1 text-[13px] text-red-600">{errors.area}</p>}

            <label className="mt-4 block text-[13px] font-medium text-gray-600" htmlFor="request-phone">
              Mobile number
            </label>
            <div className={`mt-1 flex h-[46px] items-center rounded-[14px] border bg-white px-4 ${errors.phone ? 'border-red-500' : 'border-gray-300 focus-within:border-gray-500'}`}>
              <span className="mr-3 text-[17px] font-semibold text-black">+91</span>
              <input
                id="request-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter Phone Number"
                className="min-w-0 flex-1 bg-transparent text-[16px] text-black outline-none placeholder:text-gray-400"
              />
            </div>
            {errors.phone && <p className="mt-1 text-[13px] text-red-600">{errors.phone}</p>}

            {(status === 'error' || status === 'not-configured') && (
              <p
                role="alert"
                className={`mt-4 rounded-xl px-3 py-2 text-[13px] ${
                  status === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="mt-5 flex h-[46px] w-full items-center justify-center rounded-xl bg-[#1AA454] text-[17px] font-semibold text-white disabled:opacity-80"
            >
              {status === 'submitting' ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-label="Please wait" />
              ) : (
                'Request RailQuick'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

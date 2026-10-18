import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface OtpModalProps {
  isOpen: boolean;
  phoneNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const OtpModal: React.FC<OtpModalProps> = ({
  isOpen,
  phoneNumber,
  onClose,
  onSuccess,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [countdown, setCountdown] = useState<number>(30);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '']);
      setIsSuccess(false);
      setIsVerifying(false);
      setCountdown(30);
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (!/^\d*$/.test(char)) return;

    sounds.tap();
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto advance
    if (char && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 4 digits entered
    if (char && index === 3 && newDigits.every((d) => d !== '')) {
      verifyOtp(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = (code: string) => {
    setIsVerifying(true);
    sounds.tap();

    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      sounds.success();

      setTimeout(() => {
        onSuccess();
      }, 700);
    }, 600);
  };

  const handleAutoFill = () => {
    sounds.tap();
    setDigits(['8', '4', '9', '2']);
    verifyOtp('8492');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 active:scale-90 transition-transform rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Verified!</h3>
            <p className="text-sm text-slate-500 mt-1">Connecting to your station...</p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Enter OTP</h3>
            </div>

            <p className="text-xs text-slate-500">
              We sent a 4-digit code via SMS to{' '}
              <span className="font-bold text-slate-800">+91 {phoneNumber || '98765 43210'}</span>
            </p>

            {/* Quick Demo Helper */}
            <div className="mt-3 bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 flex items-center justify-between">
              <span className="text-[11px] text-amber-900 font-medium">
                Testing Demo? Click to auto-verify:
              </span>
              <button
                type="button"
                onClick={handleAutoFill}
                className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg active:scale-95 transition-all shadow-xs"
              >
                Auto-fill 8492
              </button>
            </div>

            {/* OTP Input Boxes */}
            <div className="flex justify-between gap-3 my-5">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={isVerifying}
                  className="w-14 h-14 text-center text-2xl font-black rounded-xl border-2 border-slate-200 focus:border-[#008b3e] focus:bg-emerald-50/20 focus:outline-none transition-all"
                />
              ))}
            </div>

            {/* Timer & Resend */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-5">
              <span>Didn't get code?</span>
              {countdown > 0 ? (
                <span className="text-slate-400 font-medium">Resend in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setCountdown(30)}
                  className="text-[#008b3e] font-bold hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => verifyOtp(digits.join(''))}
              disabled={digits.some((d) => !d) || isVerifying}
              className="w-full bg-[#008b3e] disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
            >
              {isVerifying ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Verify & Proceed</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

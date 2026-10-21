import { useState } from 'react';
import { Compass, Train, IndianRupee, Clock, Phone } from 'lucide-react';
import { PlatformModal } from '../utilities/PlatformModal';
import { RefundCalculatorModal } from '../utilities/RefundCalculatorModal';
import { TimetableModal } from '../utilities/TimetableModal';
import { HelplineModal } from '../utilities/HelplineModal';

export function TravelUtilitiesGrid() {
  const [platformOpen, setPlatformOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [timetableOpen, setTimetableOpen] = useState(false);
  const [helplineOpen, setHelplineOpen] = useState(false);

  const utilities = [
    {
      id: 'platform',
      title: 'Platform',
      icon: Train,
      iconColor: 'text-[#138848]',
      action: () => setPlatformOpen(true),
    },
    {
      id: 'refund',
      title: 'Refund Calc',
      icon: IndianRupee,
      iconColor: 'text-[#138848]',
      action: () => setRefundOpen(true),
    },
    {
      id: 'timetable',
      title: 'Timetable',
      icon: Clock,
      iconColor: 'text-[#138848]',
      action: () => setTimetableOpen(true),
    },
    {
      id: 'helpline',
      title: 'Helpline',
      icon: Phone,
      iconColor: 'text-rose-500',
      action: () => setHelplineOpen(true),
    },
  ];

  return (
    <section className="px-5 sm:px-6 pt-7 pb-4">
      {/* Header matching media_1792438306771.png */}
      <div className="mb-3.5 flex items-center gap-2">
        <Compass className="h-4 w-4 text-[#138848]" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          TRAVEL UTILITIES
        </h2>
      </div>

      {/* 4 Cards in 1 Row */}
      <div className="grid grid-cols-4 gap-2.5">
        {utilities.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-3.5 px-1 shadow-sm hover:border-gray-200 hover:shadow-md active:scale-95 transition duration-150"
            >
              <div className="flex h-7 w-7 items-center justify-center mb-1.5">
                <Icon className={`h-5 w-5 ${item.iconColor}`} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-gray-900 leading-tight">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>

      <PlatformModal open={platformOpen} onClose={() => setPlatformOpen(false)} />
      <RefundCalculatorModal open={refundOpen} onClose={() => setRefundOpen(false)} />
      <TimetableModal open={timetableOpen} onClose={() => setTimetableOpen(false)} />
      <HelplineModal open={helplineOpen} onClose={() => setHelplineOpen(false)} />
    </section>
  );
}

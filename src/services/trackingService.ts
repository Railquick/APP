import { TrackingStep, RunnerInfo, TrackingStatus } from '../types/order';

export const DEFAULT_RUNNER: RunnerInfo = {
  name: 'Ramesh Kumar',
  title: 'IRCTC Authorized Runner',
  rating: 4.9,
  totalDeliveries: 2430,
  uniformTag: 'Wearing Neon Green Vest #KNP-14 • Platform 2',
  phone: '+91 98765 43210',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC2qJaoqzM_l7LvTFiXdizjc-OG5N2gsIcO9gSM2Hj0_rdRb9KDQwkzFU213fmJs9eQqm-PCISgXEunBIBlWYRzJI-fu_6DyYxfd5untvjSPG2QcpvUZEGdujBRa0KiZg07s4dQglgLpHIc8D0QDvVrj5lzX__T1UkrhX0lddSnkPy2oVZqug2a-85oTAAuzkviPOtHQ3eYMFVC9l_BuMnCNftkSNrPu34TGSsZL2g',
};

export function generateTrackingSteps(
  station: string,
  coach: string,
  berth: string,
  platform: string,
  otp: string,
  safetyTag: string
): TrackingStep[] {
  const now = new Date();
  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  const time1 = formatTime(now);
  const time2 = formatTime(new Date(now.getTime() + 2 * 60000));

  return [
    {
      id: 'step-1',
      title: 'Order Confirmed',
      subtitle: `Transmitted to ${station} Platform Darkstore terminal`,
      time: time1,
      status: 'completed',
    },
    {
      id: 'step-2',
      title: 'Packed at Darkstore',
      subtitle: `Sealed in tamper-evident eco paper bag with safety tag #${safetyTag}`,
      time: time2,
      status: 'completed',
    },
    {
      id: 'step-3',
      title: `Runner Sprinting to Coach ${coach}`,
      subtitle: `Waiting at designated Coach ${coach} marker line on ${platform} ahead of train halt.`,
      badge: '~3 mins away',
      status: 'active',
    },
    {
      id: 'step-4',
      title: `Handover at Berth ${berth}`,
      subtitle: 'Upcoming receipt at your berth seat.',
      status: 'upcoming',
      otp,
    },
  ];
}


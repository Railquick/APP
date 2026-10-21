import { SearchCard } from '../components/home/SearchCard';
import { TravelUtilitiesGrid } from '../components/home/TravelUtilitiesGrid';
import { TestimonialsCarousel } from '../components/home/TestimonialsCarousel';
import delhiHero from '../assets/delhi-hero.jpg';
import { Session } from '../types';
import { navigate } from '../router';

interface HomeScreenProps {
  session: Session;
  onLogout?: () => void;
}

export function HomeScreen({ session }: HomeScreenProps) {

  const userInitial = (session.user?.name || session.user?.email || 'T')
    .charAt(0)
    .toUpperCase();

  return (
    <main className="min-h-dvh bg-white pb-12 flex flex-col">
      {/* Top subtle user bar */}
      <div className="relative z-30 flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+14px)] pb-1">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            RailQuick Active
          </span>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => navigate('/account')}
            aria-label="User account"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-xs font-black text-white shadow-sm ring-2 ring-emerald-50 hover:opacity-90 active:scale-95 transition"
            title="My Account"
          >
            {userInitial}
          </button>
        </div>
      </div>

      {/* Hero Section matching media_1792438306769.png */}
      <section className="relative overflow-hidden bg-white pt-2 pb-6">
        {/* Right side station & India gate image with smooth fade to white on the left */}
        <div className="absolute right-0 top-0 bottom-0 w-[55%] sm:w-[50%] pointer-events-none overflow-hidden select-none">
          <img
            src={delhiHero}
            alt="Delhi Station platform at night with India Gate"
            className="h-full w-full object-cover object-left"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />
        </div>

        {/* Left Heading & Subtitle */}
        <div className="relative z-10 px-6 pt-2 max-w-[62%] sm:max-w-[60%]">
          <h1 className="text-[34px] sm:text-[38px] font-black tracking-tight text-gray-950 leading-[1.08]">
            Delivered to <br />
            <span className="text-[#138848]">your seat.</span>
          </h1>
          <p className="mt-3.5 text-xs sm:text-sm font-semibold text-gray-500 leading-snug">
            Tasty snacks, drinks, chargers & comfort kits.
          </p>
        </div>
      </section>

      {/* Train Search Card */}
      <section className="relative z-20">
        <SearchCard />
      </section>

      {/* Travel Utilities */}
      <TravelUtilitiesGrid />

      {/* Customer Testimonials Carousel */}
      <TestimonialsCarousel />

      {/* Footer matching media_1792438306771.png and media_1792438306779.png */}
      <footer className="mt-8 px-6 pt-6 pb-8 text-center select-none">
        <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-300 tracking-tight">
          Happy Travel!
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm font-semibold text-gray-500">
          See you on your train ride. ❤️
        </p>
      </footer>
    </main>
  );
}
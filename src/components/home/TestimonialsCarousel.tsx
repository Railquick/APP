import { useState, useRef, useEffect, useCallback } from 'react';
import { Star, CheckCircle2, MessageSquare, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  initial: string;
  avatarBg: string;
  name: string;
  role: string;
  route: string;
  verified: boolean;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    initial: 'G',
    avatarBg: 'bg-amber-100 text-amber-800 border-amber-200',
    name: 'Gaurav',
    role: 'Business Traveler',
    route: '12301 Rajdhani • NDLS',
    verified: true,
    quote:
      'Knowing that the products are verified gives confidence. I don\'t mind ordering if I know I\'m getting genuine items.',
  },
  {
    id: 't-2',
    initial: 'A',
    avatarBg: 'bg-rose-100 text-rose-800 border-rose-200',
    name: 'Ayush',
    role: 'Student Traveler',
    route: '12004 Shatabdi • LKO',
    verified: true,
    quote: 'This feels like a service passengers have needed for a long time. Fast delivery right to my seat!',
  },
  {
    id: 't-3',
    initial: 'S',
    avatarBg: 'bg-sky-100 text-sky-800 border-sky-200',
    name: 'Shreya',
    role: 'Solo Traveler',
    route: '22436 Vande Bharat • BSB',
    verified: true,
    quote:
      "I'll definitely use this service. No overpricing, no different or fake products — that's what travelers actually need.",
  },
  {
    id: 't-4',
    initial: 'P',
    avatarBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    name: 'Priya',
    role: 'Family Traveler',
    route: '12952 Tejas Rajdhani • MMCT',
    verified: true,
    quote:
      'Got emergency baby wipes and a 20W phone charger delivered right to coach B4 at NDLS in 10 mins. Pure lifesaver!',
  },
];

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = TESTIMONIALS.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-advance loop every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section className="pt-6 pb-2 overflow-hidden select-none">
      {/* Header with Navigation Controls */}
      <div className="px-5 sm:px-6 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-100 text-[#138848]">
            <MessageSquare className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            WHAT OUR CUSTOMERS SAY
          </h2>
        </div>

        {/* Arrow buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous testimonial"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next testimonial"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Swipeable Slide Container */}
      <div
        className="px-5 sm:px-6"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="overflow-hidden rounded-3xl">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {TESTIMONIALS.map((item) => (
              <div key={item.id} className="w-full shrink-0 px-1">
                <div className="relative rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.06)] hover:shadow-md transition">
                  {/* Subtle quote watermark */}
                  <Quote className="pointer-events-none absolute right-4 top-4 h-12 w-12 text-emerald-500/10" />

                  {/* Top user row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full font-black text-base border-2 shadow-inner ${item.avatarBg}`}
                      >
                        {item.initial}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-gray-900 leading-tight">
                            {item.name}
                          </h3>
                          {item.verified && (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-100">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
                          {item.role} • <span className="text-emerald-700 font-bold">{item.route}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Review Quote */}
                  <p className="mt-3.5 text-xs sm:text-sm text-gray-700 leading-relaxed font-medium italic">
                    "{item.quote}"
                  </p>

                  {/* 5 Stars Rating & Trust Badges */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="ml-1 text-xs font-black text-gray-800">5.0</span>
                    </div>

                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Verified Passenger
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sliding Dot Indicators */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {TESTIMONIALS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 transition-all duration-300 rounded-full ${
                currentIndex === idx
                  ? 'w-6 bg-[#138848]'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
